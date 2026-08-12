namespace Api.Models;

/// <summary>
/// Public shape of a run, returned by GET /api/pipeline/history. Serializes
/// as camelCase JSON (ASP.NET Core's default output policy) — no attributes
/// needed here, unlike the Databricks-facing wire models in DatabricksModels.cs.
/// </summary>
public sealed record PipelineRunDto(
    long Id,
    string Status,
    DateTimeOffset? StartedAt,
    /// <summary>Null while the run is still in progress (no EndTime yet) — the
    /// frontend renders that distinctly instead of a misleading 0s.</summary>
    double? DurationSeconds
);
