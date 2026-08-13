namespace Api.Options;

/// <summary>
/// Global trigger rate limit. Currently backed by IMemoryCache (see
/// DatabricksJobsService) — NOT persistent across a Container Apps
/// scale-to-zero restart. That's a known, deliberate simplification to ship
/// the trigger feature quickly; upgrading to Azure SQL-backed persistent
/// state (surviving restarts) is the real stage-2 work, still to do.
/// </summary>
public sealed class PipelineOptions
{
    public const string SectionName = "Pipeline";

    /// <summary>Minimum time between two real Databricks job triggers, global (not per-visitor).</summary>
    public int TriggerCooldownSeconds { get; set; } = 600;
}
