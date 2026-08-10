import { Link } from "@heroui/react";

export function SiteFooter() {
  return (
    <footer className="mt-auto pt-6">
      <p className="font-mono text-xs text-muted">
        v0.1 · first commit — interactive project demos shipping next ·{" "}
        <Link
          href="https://github.com/goldenFlori/portfolio"
          target="_blank"
          className="text-xs"
        >
          source
        </Link>
      </p>
    </footer>
  );
}
