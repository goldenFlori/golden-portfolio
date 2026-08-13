using System.Text.Json;
using Api.Services;

namespace Api.Tests;

/// <summary>
/// Databricks' JSON is snake_case; System.Text.Json won't convert that
/// automatically. Get the DatabricksModels.cs [JsonPropertyName] attributes
/// wrong and DatabricksJobsService compiles and runs fine while silently
/// returning all-null/all-zero runs forever — a failure mode that "can't
/// test against the real workspace yet" would otherwise hide for months.
/// This test needs no live Databricks credentials: it feeds a static
/// fixture, shaped exactly like a real runs/list response, through the
/// actual deserialization + mapping code and asserts the DTO comes out right.
/// </summary>
public class DatabricksJobsServiceTests
{
    private static RunsListResponse LoadFixture()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Fixtures", "runs-list-response.json");
        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<RunsListResponse>(json)
            ?? throw new InvalidOperationException("Fixture failed to deserialize.");
    }

    [Fact]
    public void Deserializes_snake_case_fields_from_the_real_response_shape()
    {
        var response = LoadFixture();

        Assert.Equal(3, response.Runs.Count);

        var first = response.Runs[0];
        Assert.Equal(1001, first.RunId);
        Assert.Equal("TERMINATED", first.State?.LifeCycleState);
        Assert.Equal("SUCCESS", first.State?.ResultState);
        Assert.Equal(1735689600000, first.StartTimeMs);
        Assert.Equal(1735689734000, first.EndTimeMs);
    }

    [Fact]
    public void Maps_a_terminated_successful_run_to_success_with_computed_duration()
    {
        var run = LoadFixture().Runs[0];

        var dto = DatabricksJobsService.MapToDto(run);

        Assert.Equal(1001, dto.Id);
        Assert.Equal("success", dto.Status);
        Assert.Equal(DateTimeOffset.FromUnixTimeMilliseconds(1735689600000), dto.StartedAt);
        Assert.Equal(134, dto.DurationSeconds); // 1735689734000 - 1735689600000, in seconds
    }

    [Fact]
    public void Maps_a_running_run_to_running_with_no_duration_yet()
    {
        var run = LoadFixture().Runs[1];

        var dto = DatabricksJobsService.MapToDto(run);

        Assert.Equal(1002, dto.Id);
        Assert.Equal("running", dto.Status);
        Assert.Null(dto.DurationSeconds); // no end_time yet — must not render as a fake 0s
    }

    [Fact]
    public void Maps_a_terminated_failed_run_to_failed()
    {
        var run = LoadFixture().Runs[2];

        var dto = DatabricksJobsService.MapToDto(run);

        Assert.Equal(1003, dto.Id);
        Assert.Equal("failed", dto.Status);
    }

    [Fact]
    public void Maps_per_task_state_for_the_status_endpoint()
    {
        var run = new DatabricksRun
        {
            RunId = 42,
            State = new DatabricksRunState { LifeCycleState = "RUNNING" },
            StartTimeMs = 1735689600000,
            EndTimeMs = null,
            Tasks =
            [
                new DatabricksTask { TaskKey = "01_ingest_circuits_file", State = new DatabricksRunState { LifeCycleState = "TERMINATED", ResultState = "SUCCESS" } },
                new DatabricksTask { TaskKey = "02_ingest_races_file", State = new DatabricksRunState { LifeCycleState = "RUNNING" } },
                new DatabricksTask { TaskKey = "03_ingest_constructors_file", State = new DatabricksRunState { LifeCycleState = "PENDING" } },
            ],
        };

        var dto = DatabricksJobsService.MapToStatusDto(run);

        Assert.Equal(42, dto.Id);
        Assert.Equal("running", dto.Status);
        Assert.Null(dto.DurationSeconds);
        Assert.Equal(3, dto.Tasks.Count);
        Assert.Equal("success", dto.Tasks.Single(t => t.Key == "01_ingest_circuits_file").Status);
        Assert.Equal("running", dto.Tasks.Single(t => t.Key == "02_ingest_races_file").Status);
        Assert.Equal("pending", dto.Tasks.Single(t => t.Key == "03_ingest_constructors_file").Status);
    }

    [Fact]
    public void Maps_a_run_with_no_tasks_to_an_empty_task_list()
    {
        var run = new DatabricksRun { RunId = 1, State = new DatabricksRunState { LifeCycleState = "PENDING" } };

        var dto = DatabricksJobsService.MapToStatusDto(run);

        Assert.Empty(dto.Tasks);
    }

    [Theory]
    [InlineData(null, null, "pending")]
    [InlineData("PENDING", null, "pending")]
    [InlineData("QUEUED", null, "pending")]
    [InlineData("BLOCKED", null, "pending")]
    [InlineData("RUNNING", null, "running")]
    [InlineData("TERMINATING", null, "running")]
    [InlineData("TERMINATED", "SUCCESS", "success")]
    [InlineData("TERMINATED", "FAILED", "failed")]
    [InlineData("TERMINATED", "TIMEDOUT", "failed")]
    [InlineData("TERMINATED", "CANCELED", "failed")]
    [InlineData("INTERNAL_ERROR", null, "failed")]
    [InlineData("SKIPPED", null, "failed")]
    public void MapStatus_covers_every_documented_life_cycle_and_result_state(
        string? lifeCycleState, string? resultState, string expected)
    {
        var state = lifeCycleState is null
            ? null
            : new DatabricksRunState { LifeCycleState = lifeCycleState, ResultState = resultState };

        Assert.Equal(expected, DatabricksJobsService.MapStatus(state));
    }
}
