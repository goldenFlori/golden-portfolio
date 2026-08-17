import { Card, Chip, Tabs } from "@heroui/react";
import { motion } from "motion/react";
import { certificates, education, experience } from "../data/content";
import { listItem } from "../lib/motion";

export function Background() {
  return (
    <Card className="glass w-full">
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Card.Title className="font-display">Background</Card.Title>
          <Card.Description>Experience, education, and certifications.</Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        <Tabs defaultSelectedKey="experience">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Background views">
              <Tabs.Tab id="experience">
                Experience
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="education">
                Education
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="certifications">
                Certifications
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="experience" className="pt-3">
            <ol className="flex flex-col">
              {experience.map((entry, i) => (
                <motion.li
                  key={entry.org}
                  {...listItem(i)}
                  className="relative flex flex-col gap-1.5 border-l border-border py-4 pl-5 last:pb-0"
                >
                  <span
                    className="absolute top-[1.6rem] -left-[5px] size-2.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-accent">{entry.period}</span>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h4 className="font-display text-sm font-semibold text-foreground">{entry.role}</h4>
                    <span className="text-xs text-muted">{entry.org}</span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {entry.points.map((point) => (
                      <li key={point} className="text-xs text-muted">
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ol>
          </Tabs.Panel>

          <Tabs.Panel id="education" className="pt-3">
            <ol className="flex flex-col">
              {education.map((entry, i) => (
                <motion.li
                  key={entry.degree}
                  {...listItem(i)}
                  className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0"
                >
                  <span className="font-mono text-xs text-accent">{entry.period}</span>
                  <h4 className="font-display text-sm font-semibold text-foreground">{entry.degree}</h4>
                  <span className="text-xs text-muted">{entry.org}</span>
                </motion.li>
              ))}
            </ol>
          </Tabs.Panel>

          <Tabs.Panel id="certifications" className="pt-3">
            <ul className="flex flex-wrap gap-2">
              {certificates.map((cert, i) => (
                <motion.li key={cert} {...listItem(i)}>
                  <Chip size="sm" color="default">
                    <Chip.Label>{cert}</Chip.Label>
                  </Chip>
                </motion.li>
              ))}
            </ul>
          </Tabs.Panel>
        </Tabs>
      </Card.Content>
    </Card>
  );
}
