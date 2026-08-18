import { Button, Chip } from "@heroui/react";
import { motion } from "motion/react";
import { profile } from "../data/content";
import { pressable, rise } from "../lib/motion";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./icons";

const openExternal = (url: string) => window.open(url, "_blank", "noopener");

export function Hero() {
  return (
    <header className="flex flex-col items-start gap-5">
      <motion.div {...rise(0)}>
        <Chip color="accent" variant="soft" size="sm">
          <span className="pulse-dot" aria-hidden="true" />
          <Chip.Label>{profile.status}</Chip.Label>
        </Chip>
      </motion.div>
      <motion.h1
        {...rise(0.08)}
        className="gold-text font-display text-5xl font-bold tracking-tight sm:text-6xl"
      >
        Florjan Mema
      </motion.h1>
      <motion.p {...rise(0.16)} className="font-mono text-sm text-accent">
        &gt; full-stack + data · banking systems &amp; lakehouse pipelines ·{" "}
        {profile.location}
      </motion.p>
      <motion.p {...rise(0.24)} className="max-w-lg text-sm leading-relaxed text-muted">
        {profile.about}
      </motion.p>
      <motion.div {...rise(0.32)} className="flex flex-wrap gap-2.5">
        <motion.div {...pressable}>
          <Button
            variant="primary"
            onPress={() => {
              window.location.href = `mailto:${profile.email}`;
            }}
          >
            <MailIcon />
            Email me
          </Button>
        </motion.div>
        <motion.div {...pressable}>
          <Button variant="outline" onPress={() => openExternal(profile.github)}>
            <GitHubIcon />
            GitHub
          </Button>
        </motion.div>
        <motion.div {...pressable}>
          <Button variant="ghost" onPress={() => openExternal(profile.linkedin)}>
            <LinkedInIcon />
            LinkedIn
          </Button>
        </motion.div>
      </motion.div>
    </header>
  );
}
