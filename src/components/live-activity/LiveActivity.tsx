import { Avatar, Button, Card, Chip, Link, Spinner, Tabs } from "@heroui/react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { GITHUB_USER } from "../../lib/github";
import { RefreshIcon } from "../icons";
import { githubKeys } from "../../hooks/useGithub";
import { CommitsPanel } from "./CommitsPanel";
import { ReposPanel } from "./ReposPanel";

/**
 * Frosted-glass card streaming live GitHub activity (commits + repos)
 * through TanStack Query, with a manual refresh.
 */
export function LiveActivity() {
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: githubKeys.all }) > 0;

  return (
    <Card className="glass w-full">
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <Avatar.Image
                src={`https://github.com/${GITHUB_USER}.png?size=80`}
                alt={`${GITHUB_USER} on GitHub`}
              />
              <Avatar.Fallback>FM</Avatar.Fallback>
            </Avatar>
            <Card.Title className="font-display">Live from GitHub</Card.Title>
            <Chip color="success" size="sm">
              <span className="pulse-dot" aria-hidden="true" />
              <Chip.Label>live</Chip.Label>
            </Chip>
          </div>
          <Card.Description>
            Fetched in your browser with TanStack Query — real activity from{" "}
            <Link href={`https://github.com/${GITHUB_USER}`} target="_blank">
              @{GITHUB_USER}
            </Link>
            , not screenshots.
          </Card.Description>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label="Refresh GitHub data"
          isDisabled={isRefreshing}
          onPress={() => queryClient.invalidateQueries({ queryKey: githubKeys.all })}
        >
          {isRefreshing ? <Spinner size="sm" /> : <RefreshIcon />}
        </Button>
      </Card.Header>

      <Card.Content>
        <Tabs defaultSelectedKey="commits">
          <Tabs.ListContainer>
            <Tabs.List aria-label="GitHub activity">
              <Tabs.Tab id="commits">
                Latest commits
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="repos">
                Repositories
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="commits" className="pt-3">
            <CommitsPanel />
          </Tabs.Panel>
          <Tabs.Panel id="repos" className="pt-3">
            <ReposPanel />
          </Tabs.Panel>
        </Tabs>
      </Card.Content>
    </Card>
  );
}
