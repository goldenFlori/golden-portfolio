namespace Api.Models;

/// <summary>Detailed single-run status, returned by GET /api/pipeline/status/{runId} — includes
/// per-task state so the frontend can light up the DAG task-by-task.</summary>
public sealed record RunStatusDto(
    long Id,
    string Status,
    DateTimeOffset? StartedAt,
    double? DurationSeconds,
    IReadOnlyList<TaskStatusDto> Tasks
);
