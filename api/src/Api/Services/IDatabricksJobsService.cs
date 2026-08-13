using Api.Models;

namespace Api.Services;

public enum TriggerOutcomeKind
{
    /// <summary>A brand-new run was started.</summary>
    Started,

    /// <summary>A run was already in progress; the caller attaches to it instead of starting a second one.</summary>
    Attached,

    /// <summary>Within the global cooldown window and no run is currently in progress — rejected.</summary>
    RateLimited,
}

public sealed record TriggerOutcome(TriggerOutcomeKind Kind, long? RunId, int? RetryAfterSeconds);

public interface IDatabricksJobsService
{
    /// <summary>Most recent runs of the configured job, newest first.</summary>
    Task<IReadOnlyList<PipelineRunDto>> GetRecentRunsAsync(int limit, CancellationToken cancellationToken);

    /// <summary>Detailed status of one run, including per-task state.</summary>
    Task<RunStatusDto> GetRunStatusAsync(long runId, CancellationToken cancellationToken);

    /// <summary>
    /// Starts a real run, subject to a global cooldown — or attaches to one
    /// already in progress instead of starting a second one.
    /// </summary>
    Task<TriggerOutcome> TriggerRunAsync(CancellationToken cancellationToken);
}
