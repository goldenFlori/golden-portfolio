using System.Net.Http.Headers;
using System.Net.Http.Json;
using Api.Models;
using Api.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Api.Services;

/// <summary>
/// Calls the real Databricks Jobs API 2.2 and maps responses onto the public
/// DTOs. Registered as a typed HttpClient (see Program.cs) with a resilience
/// handler for retry/timeout.
///
/// Rate limiting and "attach to in-progress run" are backed by IMemoryCache —
/// NOT persistent across a restart. That's a deliberate, disclosed
/// simplification to ship the trigger feature today rather than wait on
/// Azure SQL; see PipelineOptions. Same cache also holds a short-lived
/// history snapshot so a page full of visitors doesn't each hit Databricks
/// directly.
/// </summary>
public sealed class DatabricksJobsService : IDatabricksJobsService
{
    private const string HistoryCacheKey = "pipeline-history";
    private const string ActiveRunCacheKey = "pipeline-active-run-id";
    private const string LastTriggeredCacheKey = "pipeline-last-triggered-at";
    private static readonly TimeSpan HistoryCacheDuration = TimeSpan.FromSeconds(60);

    private readonly HttpClient _httpClient;
    private readonly DatabricksOptions _options;
    private readonly PipelineOptions _pipelineOptions;
    private readonly IMemoryCache _cache;
    private readonly ILogger<DatabricksJobsService> _logger;

    public DatabricksJobsService(
        HttpClient httpClient,
        IOptions<DatabricksOptions> options,
        IOptions<PipelineOptions> pipelineOptions,
        IMemoryCache cache,
        ILogger<DatabricksJobsService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _pipelineOptions = pipelineOptions.Value;
        _cache = cache;
        _logger = logger;

        _httpClient.BaseAddress = new Uri($"https://{_options.Host}");
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.Token);
    }

    public async Task<IReadOnlyList<PipelineRunDto>> GetRecentRunsAsync(int limit, CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(HistoryCacheKey, out IReadOnlyList<PipelineRunDto>? cached) && cached is not null)
        {
            return cached;
        }

        var response = await _httpClient.GetFromJsonAsync<RunsListResponse>(
            $"/api/2.2/jobs/runs/list?job_id={_options.JobId}&limit={limit}",
            cancellationToken);

        var runs = (response?.Runs ?? [])
            .Select(MapToDto)
            .ToList();

        _cache.Set(HistoryCacheKey, (IReadOnlyList<PipelineRunDto>)runs, HistoryCacheDuration);
        _logger.LogInformation("Fetched {Count} runs from Databricks for job {JobId}", runs.Count, _options.JobId);

        return runs;
    }

    public async Task<RunStatusDto> GetRunStatusAsync(long runId, CancellationToken cancellationToken)
    {
        var run = await _httpClient.GetFromJsonAsync<DatabricksRun>(
            $"/api/2.2/jobs/runs/get?run_id={runId}",
            cancellationToken);

        if (run is null)
        {
            throw new InvalidOperationException($"runs/get returned no body for run {runId}");
        }

        return MapToStatusDto(run);
    }

    public async Task<TriggerOutcome> TriggerRunAsync(CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(ActiveRunCacheKey, out long activeRunId))
        {
            var status = await GetRunStatusAsync(activeRunId, cancellationToken);
            if (status.Status is "pending" or "running")
            {
                _logger.LogInformation("Attaching caller to in-progress run {RunId}", activeRunId);
                return new TriggerOutcome(TriggerOutcomeKind.Attached, activeRunId, null);
            }
            _cache.Remove(ActiveRunCacheKey);
        }

        var cooldown = TimeSpan.FromSeconds(_pipelineOptions.TriggerCooldownSeconds);
        if (_cache.TryGetValue(LastTriggeredCacheKey, out DateTimeOffset lastTriggeredAt))
        {
            var elapsed = DateTimeOffset.UtcNow - lastTriggeredAt;
            if (elapsed < cooldown)
            {
                var retryAfterSeconds = (int)Math.Ceiling((cooldown - elapsed).TotalSeconds);
                return new TriggerOutcome(TriggerOutcomeKind.RateLimited, null, retryAfterSeconds);
            }
        }

        var response = await _httpClient.PostAsJsonAsync(
            "/api/2.2/jobs/run-now",
            new { job_id = _options.JobId },
            cancellationToken);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<RunNowResponse>(cancellationToken: cancellationToken);
        if (result is null)
        {
            throw new InvalidOperationException("run-now returned no body");
        }

        _cache.Set(ActiveRunCacheKey, result.RunId, TimeSpan.FromHours(1));
        _cache.Set(LastTriggeredCacheKey, DateTimeOffset.UtcNow, cooldown);
        _cache.Remove(HistoryCacheKey);
        _logger.LogInformation("Triggered new run {RunId} for job {JobId}", result.RunId, _options.JobId);

        return new TriggerOutcome(TriggerOutcomeKind.Started, result.RunId, null);
    }

    /// <summary>Internal (not private) so DatabricksJobsServiceTests can exercise it directly via InternalsVisibleTo.</summary>
    internal static PipelineRunDto MapToDto(DatabricksRun run)
    {
        var startedAt = run.StartTimeMs is > 0
            ? DateTimeOffset.FromUnixTimeMilliseconds(run.StartTimeMs.Value)
            : (DateTimeOffset?)null;

        double? durationSeconds = run.StartTimeMs is > 0 && run.EndTimeMs is > 0
            ? (run.EndTimeMs.Value - run.StartTimeMs.Value) / 1000.0
            : null;

        return new PipelineRunDto(
            Id: run.RunId,
            Status: MapStatus(run.State),
            StartedAt: startedAt,
            DurationSeconds: durationSeconds);
    }

    internal static RunStatusDto MapToStatusDto(DatabricksRun run)
    {
        var dto = MapToDto(run);
        var tasks = (run.Tasks ?? [])
            .Select(t => new TaskStatusDto(t.TaskKey, MapStatus(t.State)))
            .ToList();
        return new RunStatusDto(dto.Id, dto.Status, dto.StartedAt, dto.DurationSeconds, tasks);
    }

    /// <summary>
    /// life_cycle_state drives the coarse pending/running/terminal split;
    /// result_state (only meaningful once TERMINATED) resolves success vs.
    /// failure. Mirrors the same mapping the earlier Cloudflare Worker
    /// prototype used, verified against Databricks' documented state values.
    /// </summary>
    internal static string MapStatus(DatabricksRunState? state)
    {
        var lifeCycle = state?.LifeCycleState;
        if (lifeCycle is null or "PENDING" or "QUEUED" or "BLOCKED")
        {
            return "pending";
        }
        if (lifeCycle is "RUNNING" or "TERMINATING")
        {
            return "running";
        }
        if (lifeCycle == "TERMINATED" && state?.ResultState == "SUCCESS")
        {
            return "success";
        }
        return "failed";
    }
}
