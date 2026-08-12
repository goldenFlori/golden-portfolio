export const profile = {
  name: "Florjan Mema",
  role: "Full-Stack Software Engineer · Data Engineer",
  location: "Tirana, Albania",
  email: "florjanimema@gmail.com",
  github: "https://github.com/goldenFlori",
  linkedin: "https://www.linkedin.com/in/florjan-mema-22121999v",
  status: "Open to senior IC & contract work",
  about:
    "Software engineer with 4+ years on enterprise platforms for banking and international media — designing from a blank page, building across frontend, backend, and data, and defending it in production. Part-time Assistant Professor of algorithms at the University of Tirana.",
};

export interface Project {
  slug: string;
  title: string;
  status: string;
  description: string;
  tags: string[];
  repo?: string;
  note?: string;
}

export const projects: Project[] = [
  {
    slug: "formula1-lakehouse",
    title: "Formula 1 Lakehouse — Azure Databricks",
    status: "SHIPPED",
    description:
      "Full-refresh and incremental PySpark pipelines into Delta Lake under Unity Catalog governance, analytics served through Lakeview dashboards. Engineered like production: jobs and dashboards as Databricks Asset Bundles, one-command environment rebuild, CI validation with GitHub Actions.",
    tags: ["PySpark", "Delta Lake", "Unity Catalog", "Asset Bundles", "GitHub Actions"],
    repo: "https://github.com/goldenFlori/formula1-databricks",
  },
  {
    slug: "hadoop-projects",
    title: "Hadoop Big Data Projects",
    status: "SHIPPED",
    description:
      "Six batch analytics projects — logs, sales, e-commerce, survey data — on a Dockerized Hadoop 3.3 cluster: MapReduce, Hive, and Pig over HDFS.",
    tags: ["Hadoop 3.3", "MapReduce", "Hive", "Pig", "Docker"],
    repo: "https://github.com/goldenFlori/hadoop-big-data-projects",
  },
  {
    slug: "raiffeisen-payments",
    title: "Payments Module — Raiffeisen Bank Albania",
    status: "IN PRODUCTION",
    description:
      "Designed the data model, C#/.NET services and React 19 microfrontend on Single-SPA, live across the branch network since launch. SQL Server stored procedures, event-driven .NET microservices, and on-call production support: tracing failures through distributed services and shipping the fix directly.",
    tags: [".NET", "React 19", "Single-SPA", "SQL Server", "Event-driven"],
    note: "Code private — live banking system",
  },
  {
    slug: "algorithms-lab",
    title: "Algorithms Laboratory — University of Tirana",
    status: "TEACHING",
    description:
      "The entire lab curriculum built from scratch: original Python notebooks on graphs, algorithms, and real-world modeling, taught weekly to BSc Data Science students.",
    tags: ["Python", "Graphs", "Notebooks", "Teaching"],
  },
];

export interface Experience {
  period: string;
  role: string;
  org: string;
  points: string[];
}

export const experience: Experience[] = [
  {
    period: "06/2025 — present",
    role: "Software Engineer",
    org: "Raiffeisen Bank Albania · 3i Solutions",
    points: [
      "Payments module live across the branch network: data model, C#/.NET services, React 19 microfrontend.",
      "Mentors every new engineer — pairing, reviews, unblocking until they ship on their own.",
    ],
  },
  {
    period: "02/2026 — present",
    role: "Assistant Professor (part-time)",
    org: "University of Tirana",
    points: [
      "Runs the algorithms laboratory for BSc Data Science — a weekly practice in making hard things clear.",
    ],
  },
  {
    period: "09/2022 — 06/2025",
    role: "Software Engineer",
    org: "Kineton Albania",
    points: [
      "Hired for QA automation, trusted with frontend within a year — closed the loop from testing systems to building them.",
      "Built the Selenium / Appium / Katalon regression frameworks the team still releases on.",
    ],
  },
];

export const skills: { label: string; items: string[] }[] = [
  {
    label: "Frontend",
    items: ["React 19", "TypeScript", "TanStack Query", "Redux / RTK Query", "Single-SPA"],
  },
  {
    label: "Backend",
    items: ["C#", ".NET", "ASP.NET Core", "SQL Server", "PostgreSQL", "REST", "Event-driven messaging"],
  },
  {
    label: "Data",
    items: ["PySpark", "Azure Databricks", "Delta Lake", "Unity Catalog", "Hadoop", "ETL / ELT"],
  },
  {
    label: "Quality & practice",
    items: ["Selenium", "Appium", "Katalon", "Python", "Docker", "Git", "GitHub Actions", "Agile / Scrum"],
  },
];
