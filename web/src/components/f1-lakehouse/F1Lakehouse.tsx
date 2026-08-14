import { Card, Chip, Link, Tabs } from "@heroui/react";
import { AllTimeView } from "./AllTimeView";
import { pipelineMeta } from "./data";
import { LiveRunPanel } from "./LiveRunPanel";
import { StandingsView } from "./StandingsView";

/**
 * Pipeline tab is live: a real ASP.NET Core backend (api/) triggers and
 * polls actual runs of the full-refresh job on a rebuilt
 * (github.com/goldenFlori/formula1-databricks) Databricks Free Edition
 * workspace — the original workspace behind this project was decommissioned,
 * this one replaces it. Standings and All-Time stay a faithful client-side
 * recreation of the Lakeview dashboard — the real chart types, the real
 * greatness-score formula — built on public F1 standings rather than a live
 * SQL query.
 */
export function F1Lakehouse() {
  return (
    <Card className="glass w-full">
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Card.Title className="font-display">F1 Lakehouse</Card.Title>
            <Chip color="success" size="sm">
              <Chip.Label>live</Chip.Label>
            </Chip>
          </div>
          <Card.Description>
            The full-refresh pipeline from{" "}
            <Link href={pipelineMeta.repo} target="_blank">
              formula1-databricks
            </Link>{" "}
            runs live against a real Databricks workspace. Standings and All-Time are a client-side
            recreation of the dashboard, built on real public F1 data.
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        <Tabs defaultSelectedKey="pipeline">
          <Tabs.ListContainer>
            <Tabs.List aria-label="F1 lakehouse views">
              <Tabs.Tab id="pipeline">
                Pipeline
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="standings">
                Standings
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="all-time">
                All-Time
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="pipeline" className="pt-3">
            <LiveRunPanel />
          </Tabs.Panel>
          <Tabs.Panel id="standings" className="pt-3">
            <StandingsView />
          </Tabs.Panel>
          <Tabs.Panel id="all-time" className="pt-3">
            <AllTimeView />
          </Tabs.Panel>
        </Tabs>
      </Card.Content>
    </Card>
  );
}
