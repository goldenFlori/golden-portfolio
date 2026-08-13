using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/pipeline")]
public sealed class PipelineController : ControllerBase
{
    private readonly IDatabricksJobsService _databricksJobsService;
    private readonly ILogger<PipelineController> _logger;

    public PipelineController(IDatabricksJobsService databricksJobsService, ILogger<PipelineController> logger)
    {
        _databricksJobsService = databricksJobsService;
        _logger = logger;
    }

    /// <summary>Last 10 runs of the F1 full-refresh job, newest first.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(CancellationToken cancellationToken)
    {
        try
        {
            var runs = await _databricksJobsService.GetRecentRunsAsync(limit: 10, cancellationToken);
            return Ok(runs);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Databricks runs/list call failed");
            return Problem(
                title: "Pipeline history is temporarily unavailable",
                detail: "Couldn't reach Databricks. Try again shortly.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    /// <summary>Detailed status of one run, including per-task state — polled while a run is live.</summary>
    [HttpGet("status/{runId:long}")]
    public async Task<IActionResult> GetStatus(long runId, CancellationToken cancellationToken)
    {
        try
        {
            var status = await _databricksJobsService.GetRunStatusAsync(runId, cancellationToken);
            return Ok(status);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Databricks runs/get call failed for run {RunId}", runId);
            return Problem(
                title: "Run status is temporarily unavailable",
                detail: "Couldn't reach Databricks. Try again shortly.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    /// <summary>
    /// Starts a real run of the full-refresh job — subject to a global
    /// cooldown, and attaches to a run already in progress instead of
    /// starting a second one.
    /// </summary>
    [HttpPost("trigger")]
    public async Task<IActionResult> Trigger(CancellationToken cancellationToken)
    {
        try
        {
            var outcome = await _databricksJobsService.TriggerRunAsync(cancellationToken);
            return outcome.Kind switch
            {
                TriggerOutcomeKind.Started => Ok(new { runId = outcome.RunId, attached = false }),
                TriggerOutcomeKind.Attached => Ok(new { runId = outcome.RunId, attached = true }),
                TriggerOutcomeKind.RateLimited => StatusCode(
                    StatusCodes.Status429TooManyRequests,
                    new { error = "rate_limited", retryAfterSeconds = outcome.RetryAfterSeconds }),
                _ => throw new InvalidOperationException($"Unhandled outcome kind {outcome.Kind}"),
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Databricks run-now call failed");
            return Problem(
                title: "Couldn't start the pipeline",
                detail: "Couldn't reach Databricks. Try again shortly.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
