import { useState } from "react";
import { Button, Table } from "@heroui/react";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";
import { constructorStandingsBySeason, driverStandingsBySeason, seasons, type Season } from "./data";

type Kind = "drivers" | "constructors";

/** Recreates the real dashboard's "Driver/Constructor Championship Standings"
 * pages: a season filter, a ranked points bar, a wins pie, and the full table. */
export function StandingsView() {
  const [kind, setKind] = useState<Kind>("drivers");
  const [season, setSeason] = useState<Season>(seasons[0]);

  const driverRows = driverStandingsBySeason[season];
  const constructorRows = constructorStandingsBySeason[season];

  const barData =
    kind === "drivers"
      ? driverRows.slice(0, 8).map((d) => ({ label: d.driver, value: d.points }))
      : constructorRows.map((c) => ({ label: c.team, value: c.points }));

  const pieData =
    kind === "drivers"
      ? driverRows.filter((d) => d.wins > 0).map((d) => ({ label: d.driver, value: d.wins }))
      : constructorRows.filter((c) => c.wins > 0).map((c) => ({ label: c.team, value: c.wins }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <Button size="sm" variant={kind === "drivers" ? "primary" : "ghost"} onPress={() => setKind("drivers")}>
            Drivers
          </Button>
          <Button size="sm" variant={kind === "constructors" ? "primary" : "ghost"} onPress={() => setKind("constructors")}>
            Constructors
          </Button>
        </div>
        <div className="flex gap-1.5">
          {seasons.map((s) => (
            <Button key={s} size="sm" variant={season === s ? "primary" : "ghost"} onPress={() => setSeason(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-display text-sm font-semibold text-foreground">
          {kind === "drivers" ? "Points by driver" : "Points by team"}
        </h4>
        <BarChart ariaLabel={`${season} ${kind} championship points`} data={barData} />
      </div>

      {pieData.length > 0 && (
        <div>
          <h4 className="mb-2 font-display text-sm font-semibold text-foreground">
            {kind === "drivers" ? "Wins by driver" : "Wins by team"}
          </h4>
          <PieChart ariaLabel={`${season} ${kind} race wins`} data={pieData} />
        </div>
      )}

      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={`${season} ${kind} standings`}>
              <Table.Header>
                <Table.Column>Pos</Table.Column>
                <Table.Column isRowHeader>{kind === "drivers" ? "Driver" : "Team"}</Table.Column>
                {kind === "drivers" && <Table.Column>Nationality</Table.Column>}
                {kind === "drivers" && <Table.Column>Team</Table.Column>}
                <Table.Column>Points</Table.Column>
                <Table.Column>Wins</Table.Column>
              </Table.Header>
              <Table.Body>
                {kind === "drivers"
                  ? driverRows.map((d) => (
                      <Table.Row key={d.position}>
                        <Table.Cell>{d.position}</Table.Cell>
                        <Table.Cell>{d.driver}</Table.Cell>
                        <Table.Cell>{d.nationality}</Table.Cell>
                        <Table.Cell>{d.team}</Table.Cell>
                        <Table.Cell>{d.points}</Table.Cell>
                        <Table.Cell>{d.wins}</Table.Cell>
                      </Table.Row>
                    ))
                  : constructorRows.map((c) => (
                      <Table.Row key={c.position}>
                        <Table.Cell>{c.position}</Table.Cell>
                        <Table.Cell>{c.team}</Table.Cell>
                        <Table.Cell>{c.points}</Table.Cell>
                        <Table.Cell>{c.wins}</Table.Cell>
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
