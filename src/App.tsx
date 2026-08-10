import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Hero } from "./components/Hero";

const queryClient = new QueryClient();

/** Composition only — sections live in `components/`, data in `data/`. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-10 px-5 py-16">
          <Hero />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
