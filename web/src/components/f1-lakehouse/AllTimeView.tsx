import { useState } from "react";
import { Button, Table } from "@heroui/react";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";
import { dominantDrivers, dominantTeams, greatnessScore } from "./data";

type Kind = "drivers" | "teams";

/** Recreates the real dashboard's "Dominant Drivers/Teams of All Time" pages,
 * including its exact greatness-score formula. */
export function AllTimeView() {
  const [kind, setKind] = useState<Kind>("drivers");

  const rows = kind === "drivers" ? dominantDrivers : dominantTeams;
  const scored = rows
    .map((r) => ({ ...r, score: greatnessScore(r.championships, r.wins, r.podiums) }))
    .sort((a, b) => b.score - a.score);

  const barData = scored.map((r) => ({ label: r.name, value: r.score }));
  const pieData = scored.filter((r) => r.championships > 0).map((r) => ({ label: r.name, value: r.championships }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        <Button size="sm" variant={kind === "drivers" ? "primary" : "ghost"} onPress={() => setKind("drivers")}>
          Drivers
        </Button>
        <Button size="sm" variant={kind === "teams" ? "primary" : "ghost"} onPress={() => setKind("teams")}>
          Teams
        </Button>
      </div>

      <div>
        <h4 className="mb-2 font-display text-sm font-semibold text-foreground">
          Greatness score — {kind === "drivers" ? "by driver" : "by team"}
        </h4>
        <BarChart ariaLabel={`all-time ${kind} greatness score`} data={barData} />
      </div>

      <div>
        <h4 className="mb-2 font-display text-sm font-semibold text-foreground">
          Championships — {kind === "drivers" ? "by driver" : "by team"}
        </h4>
        <PieChart ariaLabel={`all-time ${kind} championships`} data={pieData} />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={`all-time dominant ${kind}`}>
              <Table.Header>
                <Table.Column isRowHeader>{kind === "drivers" ? "Driver" : "Team"}</Table.Column>
                <Table.Column>Championships</Table.Column>
                <Table.Column>Wins</Table.Column>
                <Table.Column>Podiums</Table.Column>
                <Table.Column>Races</Table.Column>
                <Table.Column>Greatness</Table.Column>
              </Table.Header>
              <Table.Body>
                {scored.map((r) => (
                  <Table.Row key={r.name}>
                    <Table.Cell>{r.name}</Table.Cell>
                    <Table.Cell>{r.championships}</Table.Cell>
                    <Table.Cell>{r.wins}</Table.Cell>
                    <Table.Cell>{r.podiums}</Table.Cell>
                    <Table.Cell>{r.races}</Table.Cell>
                    <Table.Cell>{r.score.toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}
