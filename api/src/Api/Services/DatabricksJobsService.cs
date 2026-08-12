using System.Net.Http.Headers;
using Api.Models;
using Api.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Api.Services;

/// <summary>
/// Calls the real Databricks Jobs API 2.2 (<c>GET /api/2.2/jobs/runs/list</c>)
/// and maps the response onto <see cref="PipelineRunDto"/>. Registered as a
/// typed HttpClient (see Program.cs) with a resilience handler for retry/timeout,
/// and cached briefly so a page full of visitors doesn't each hit Databricks
/// directly — not the persistent rate limiter that arrives in stage 2, just
/// enough to keep stage 1 from hammering the upstream API.
/// </summary>
public sealed class DatabricksJobsService : IDatabricksJobsService
{
    private const string CacheKey = "pipeline-history";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);

    private readonly HttpClient _httpClient;
    private readonly DatabricksOptions _options;
    private readonly IMemoryCache _cache;
    private readonly ILogger<DatabricksJobsService> _logger;

    public DatabricksJobsService(
        HttpClient httpClient,
        IOptions<DatabricksOptions> options,
        IMemoryCache cache,
        ILogger<DatabricksJobsService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _cache = cache;
        _logger = logger;

        _httpClient.BaseAddress = new Uri($"https://{_options.Host}");
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.Token);
    }

    public async Task<IReadOnlyList<PipelineRunDto>> GetRecentRunsAsync(int limit, CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(CacheKey, out IReadOnlyList<PipelineRunDto>? cached) && cached is not null)
        {
            return cached;
        }

        var response = await _httpClient.GetFromJsonAsync<RunsListResponse>(
            $"/api/2.2/jobs/runs/list?job_id={_options.JobId}&limit={limit}",
            cancellationToken);

        var runs = (response?.Runs ?? [])
            .Select(MapToDto)
            .ToList();

        _cache.Set(CacheKey, (IReadOnlyList<PipelineRunDto>)runs, CacheDuration);
        _logger.LogInformation("Fetched {Count} runs from Databricks for job {JobId}", runs.Count, _options.JobId);

        return runs;
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
