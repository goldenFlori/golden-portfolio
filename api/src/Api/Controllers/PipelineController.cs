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
            // Databricks unreachable, timed out, or returned a non-success
            // status — degrade gracefully rather than surfacing a raw 500.
            _logger.LogWarning(ex, "Databricks runs/list call failed");
            return Problem(
                title: "Pipeline history is temporarily unavailable",
                detail: "Couldn't reach Databricks. Try again shortly.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
