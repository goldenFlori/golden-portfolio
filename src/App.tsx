import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig, motion } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { Hero } from "./components/Hero";
import { SiteFooter } from "./components/SiteFooter";
import { LiveActivity } from "./components/live-activity";
import { rise } from "./lib/motion";

const queryClient = new QueryClient();

/** Composition only — sections live in `components/`, data in `data/`. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <AmbientBackground />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-10 px-5 py-16">
          <Hero />
          <motion.main {...rise(0.34)}>
            <LiveActivity />
          </motion.main>
          <SiteFooter />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
