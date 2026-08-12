using Api.Models;

namespace Api.Services;

public interface IDatabricksJobsService
{
    /// <summary>Most recent runs of the configured job, newest first.</summary>
    Task<IReadOnlyList<PipelineRunDto>> GetRecentRunsAsync(int limit, CancellationToken cancellationToken);
}
