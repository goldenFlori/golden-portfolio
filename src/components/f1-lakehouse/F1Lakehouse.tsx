import { Card, Chip, Link, Tabs } from "@heroui/react";
import { AllTimeView } from "./AllTimeView";
import { pipelineMeta } from "./data";
import { LiveRunPanel } from "./LiveRunPanel";
import { StandingsView } from "./StandingsView";

/**
 * Recreates the Databricks Lakeview dashboard from the full-refresh F1
 * lakehouse pipeline (github.com/goldenFlori/formula1-databricks). That
 * project's Databricks workspace has since been decommissioned, so this is a
 * faithful client-side recreation — the real 17-task DAG, the real chart
 * types, the real greatness-score formula — built on public F1 standings
 * rather than a live query.
 */
export function F1Lakehouse() {
  return (
    <Card className="glass w-full">
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Card.Title className="font-display">F1 Lakehouse</Card.Title>
            <Chip color="default" size="sm">
              <Chip.Label>recreation</Chip.Label>
            </Chip>
          </div>
          <Card.Description>
            The full-refresh pipeline and dashboard from{" "}
            <Link href={pipelineMeta.repo} target="_blank">
              formula1-databricks
            </Link>
            , rebuilt here on real public F1 data — the project's own Databricks workspace has since
            been decommissioned.
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
