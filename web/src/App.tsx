import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig, motion } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { Background } from "./components/Background";
import { F1Lakehouse } from "./components/f1-lakehouse";
import { Hero } from "./components/Hero";
import { SiteFooter } from "./components/SiteFooter";
import { LiveActivity } from "./components/live-activity";
import { hoverLift, rise } from "./lib/motion";

const queryClient = new QueryClient();

/** Composition only — sections live in `components/`, data in `data/`. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <AmbientBackground />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-10 px-5 py-16 lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
          <Hero />
          <main className="flex flex-col gap-10">
            <motion.div {...rise(0.34)} {...hoverLift}>
              <LiveActivity />
            </motion.div>
            <motion.div {...rise(0.42)} {...hoverLift}>
              <F1Lakehouse />
            </motion.div>
            <motion.div {...rise(0.5)} {...hoverLift}>
              <Background />
            </motion.div>
          </main>
          <SiteFooter />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
