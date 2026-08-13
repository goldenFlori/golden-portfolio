using System.Text.Json.Serialization;

namespace Api.Services;

/// <summary>
/// Wire shapes for Databricks Jobs API 2.2 responses. Databricks' JSON is
/// snake_case; System.Text.Json does NOT convert that automatically, so
/// every property here is explicit via <see cref="JsonPropertyNameAttribute"/>
/// rather than relying on a naming policy — get this wrong and the service
/// compiles and runs fine while silently returning all-null/all-zero runs.
/// See DatabricksJobsServiceTests for the fixture-based check.
/// </summary>
internal sealed class RunsListResponse
{
    [JsonPropertyName("runs")]
    public List<DatabricksRun> Runs { get; set; } = [];
}

internal sealed class DatabricksRun
{
    [JsonPropertyName("run_id")]
    public long RunId { get; set; }

    [JsonPropertyName("state")]
    public DatabricksRunState? State { get; set; }

    [JsonPropertyName("start_time")]
    public long? StartTimeMs { get; set; }

    [JsonPropertyName("end_time")]
    public long? EndTimeMs { get; set; }

    /// <summary>Only present on GET runs/get (not runs/list) — per-task state for the DAG.</summary>
    [JsonPropertyName("tasks")]
    public List<DatabricksTask>? Tasks { get; set; }
}

internal sealed class DatabricksRunState
{
    [JsonPropertyName("life_cycle_state")]
    public string? LifeCycleState { get; set; }

    [JsonPropertyName("result_state")]
    public string? ResultState { get; set; }
}

internal sealed class DatabricksTask
{
    [JsonPropertyName("task_key")]
    public string TaskKey { get; set; } = string.Empty;

    [JsonPropertyName("state")]
    public DatabricksRunState? State { get; set; }
}

/// <summary>Response of POST /api/2.2/jobs/run-now.</summary>
internal sealed class RunNowResponse
{
    [JsonPropertyName("run_id")]
    public long RunId { get; set; }
}
