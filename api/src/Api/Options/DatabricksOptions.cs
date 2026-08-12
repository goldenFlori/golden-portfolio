using System.ComponentModel.DataAnnotations;

namespace Api.Options;

/// <summary>
/// Bound from configuration (appsettings + environment variables + Container
/// Apps secrets). <see cref="Host"/> and <see cref="JobId"/> aren't secret and
/// can live in checked-in appsettings.json; <see cref="Token"/> must only ever
/// come from user-secrets locally or a Container Apps secret when deployed —
/// never appsettings.Development.json, never logged.
/// </summary>
public sealed class DatabricksOptions
{
    public const string SectionName = "Databricks";

    /// <summary>Workspace host, no scheme — e.g. "adb-1234567890123456.7.azuredatabricks.net".</summary>
    [Required]
    public string Host { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>Databricks job_id is numeric — config binding converts the env var string automatically.</summary>
    [Required]
    [Range(1, long.MaxValue)]
    public long JobId { get; set; }
}
