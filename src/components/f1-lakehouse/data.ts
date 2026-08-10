/**
 * Real data for the F1 Lakehouse tile — recreates the standings pages from the
 * Databricks Lakeview dashboard in github.com/goldenFlori/formula1-databricks
 * (full-refresh pipeline), backed by real public F1 results rather than a live
 * API call, since the project's own Databricks workspace has been decommissioned.
 * Standings/wins verified against RacingNews365 and Formula1.com reporting;
 * career stats verified against Wikipedia driver/constructor infoboxes.
 */

export type Season = 2025 | 2024 | 2023;

export const seasons: Season[] = [2025, 2024, 2023];

export interface DriverStanding {
  position: number;
  driver: string;
  nationality: string;
  team: string;
  points: number;
  wins: number;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  points: number;
  wins: number;
}

export const driverStandingsBySeason: Record<Season, DriverStanding[]> = {
  2025: [
    { position: 1, driver: "Lando Norris", nationality: "British", team: "McLaren", points: 423, wins: 7 },
    { position: 2, driver: "Max Verstappen", nationality: "Dutch", team: "Red Bull", points: 421, wins: 8 },
    { position: 3, driver: "Oscar Piastri", nationality: "Australian", team: "McLaren", points: 410, wins: 7 },
    { position: 4, driver: "George Russell", nationality: "British", team: "Mercedes", points: 319, wins: 5 },
    { position: 5, driver: "Charles Leclerc", nationality: "Monégasque", team: "Ferrari", points: 242, wins: 0 },
    { position: 6, driver: "Lewis Hamilton", nationality: "British", team: "Ferrari", points: 156, wins: 0 },
    { position: 7, driver: "Andrea Kimi Antonelli", nationality: "Italian", team: "Mercedes", points: 150, wins: 0 },
    { position: 8, driver: "Alexander Albon", nationality: "Thai", team: "Williams", points: 73, wins: 0 },
    { position: 9, driver: "Carlos Sainz", nationality: "Spanish", team: "Williams", points: 64, wins: 0 },
    { position: 10, driver: "Fernando Alonso", nationality: "Spanish", team: "Aston Martin", points: 56, wins: 0 },
    { position: 11, driver: "Nico Hülkenberg", nationality: "German", team: "Stake F1", points: 51, wins: 0 },
    { position: 12, driver: "Isack Hadjar", nationality: "French", team: "Racing Bulls", points: 51, wins: 0 },
    { position: 13, driver: "Oliver Bearman", nationality: "British", team: "Haas F1 Team", points: 41, wins: 0 },
    { position: 14, driver: "Esteban Ocon", nationality: "French", team: "Haas F1 Team", points: 38, wins: 0 },
    { position: 15, driver: "Liam Lawson", nationality: "New Zealander", team: "Racing Bulls", points: 38, wins: 0 },
    { position: 16, driver: "Lance Stroll", nationality: "Canadian", team: "Aston Martin", points: 33, wins: 0 },
    { position: 17, driver: "Yuki Tsunoda", nationality: "Japanese", team: "Red Bull", points: 33, wins: 0 },
    { position: 18, driver: "Pierre Gasly", nationality: "French", team: "Alpine F1 Team", points: 22, wins: 0 },
    { position: 19, driver: "Gabriel Bortoleto", nationality: "Brazilian", team: "Stake F1", points: 19, wins: 0 },
    { position: 20, driver: "Franco Colapinto", nationality: "Argentine", team: "Alpine F1 Team", points: 0, wins: 0 },
  ],
  2024: [
    { position: 1, driver: "Max Verstappen", nationality: "Dutch", team: "Red Bull", points: 437, wins: 9 },
    { position: 2, driver: "Lando Norris", nationality: "British", team: "McLaren", points: 374, wins: 4 },
    { position: 3, driver: "Charles Leclerc", nationality: "Monégasque", team: "Ferrari", points: 356, wins: 3 },
    { position: 4, driver: "Oscar Piastri", nationality: "Australian", team: "McLaren", points: 292, wins: 2 },
    { position: 5, driver: "Carlos Sainz", nationality: "Spanish", team: "Ferrari", points: 290, wins: 2 },
    { position: 6, driver: "George Russell", nationality: "British", team: "Mercedes", points: 245, wins: 1 },
    { position: 7, driver: "Lewis Hamilton", nationality: "British", team: "Mercedes", points: 223, wins: 2 },
    { position: 8, driver: "Sergio Pérez", nationality: "Mexican", team: "Red Bull", points: 152, wins: 0 },
    { position: 9, driver: "Fernando Alonso", nationality: "Spanish", team: "Aston Martin", points: 70, wins: 0 },
    { position: 10, driver: "Pierre Gasly", nationality: "French", team: "Alpine F1 Team", points: 42, wins: 0 },
    { position: 11, driver: "Nico Hülkenberg", nationality: "German", team: "Haas F1 Team", points: 41, wins: 0 },
    { position: 12, driver: "Yuki Tsunoda", nationality: "Japanese", team: "Visa Cash App RB", points: 30, wins: 0 },
    { position: 13, driver: "Lance Stroll", nationality: "Canadian", team: "Aston Martin", points: 24, wins: 0 },
    { position: 14, driver: "Esteban Ocon", nationality: "French", team: "Alpine F1 Team", points: 23, wins: 0 },
    { position: 15, driver: "Kevin Magnussen", nationality: "Danish", team: "Haas F1 Team", points: 16, wins: 0 },
    { position: 16, driver: "Alexander Albon", nationality: "Thai", team: "Williams", points: 12, wins: 0 },
    { position: 17, driver: "Daniel Ricciardo", nationality: "Australian", team: "Visa Cash App RB", points: 12, wins: 0 },
    { position: 18, driver: "Oliver Bearman", nationality: "British", team: "Haas F1 Team", points: 7, wins: 0 },
    { position: 19, driver: "Franco Colapinto", nationality: "Argentine", team: "Williams", points: 5, wins: 0 },
    { position: 20, driver: "Zhou Guanyu", nationality: "Chinese", team: "Stake F1", points: 4, wins: 0 },
  ],
  2023: [
    { position: 1, driver: "Max Verstappen", nationality: "Dutch", team: "Red Bull", points: 575, wins: 19 },
    { position: 2, driver: "Sergio Pérez", nationality: "Mexican", team: "Red Bull", points: 285, wins: 2 },
    { position: 3, driver: "Lewis Hamilton", nationality: "British", team: "Mercedes", points: 234, wins: 0 },
    { position: 4, driver: "Fernando Alonso", nationality: "Spanish", team: "Aston Martin", points: 206, wins: 0 },
    { position: 5, driver: "Charles Leclerc", nationality: "Monégasque", team: "Ferrari", points: 206, wins: 0 },
    { position: 6, driver: "Lando Norris", nationality: "British", team: "McLaren", points: 205, wins: 0 },
    { position: 7, driver: "Carlos Sainz", nationality: "Spanish", team: "Ferrari", points: 200, wins: 1 },
    { position: 8, driver: "George Russell", nationality: "British", team: "Mercedes", points: 175, wins: 0 },
    { position: 9, driver: "Oscar Piastri", nationality: "Australian", team: "McLaren", points: 97, wins: 0 },
    { position: 10, driver: "Lance Stroll", nationality: "Canadian", team: "Aston Martin", points: 74, wins: 0 },
    { position: 11, driver: "Pierre Gasly", nationality: "French", team: "Alpine F1 Team", points: 62, wins: 0 },
    { position: 12, driver: "Esteban Ocon", nationality: "French", team: "Alpine F1 Team", points: 58, wins: 0 },
    { position: 13, driver: "Alexander Albon", nationality: "Thai", team: "Williams", points: 27, wins: 0 },
    { position: 14, driver: "Yuki Tsunoda", nationality: "Japanese", team: "AlphaTauri", points: 17, wins: 0 },
    { position: 15, driver: "Valtteri Bottas", nationality: "Finnish", team: "Alfa Romeo", points: 10, wins: 0 },
    { position: 16, driver: "Nico Hülkenberg", nationality: "German", team: "Haas F1 Team", points: 9, wins: 0 },
    { position: 17, driver: "Daniel Ricciardo", nationality: "Australian", team: "AlphaTauri", points: 6, wins: 0 },
    { position: 18, driver: "Zhou Guanyu", nationality: "Chinese", team: "Alfa Romeo", points: 6, wins: 0 },
    { position: 19, driver: "Kevin Magnussen", nationality: "Danish", team: "Haas F1 Team", points: 3, wins: 0 },
    { position: 20, driver: "Liam Lawson", nationality: "New Zealander", team: "AlphaTauri", points: 2, wins: 0 },
  ],
};

export const constructorStandingsBySeason: Record<Season, ConstructorStanding[]> = {
  2025: [
    { position: 1, team: "McLaren", points: 833, wins: 14 },
    { position: 2, team: "Mercedes", points: 469, wins: 5 },
    { position: 3, team: "Red Bull", points: 451, wins: 8 },
    { position: 4, team: "Ferrari", points: 398, wins: 0 },
    { position: 5, team: "Williams", points: 137, wins: 0 },
    { position: 6, team: "Racing Bulls", points: 92, wins: 0 },
    { position: 7, team: "Aston Martin", points: 89, wins: 0 },
    { position: 8, team: "Haas F1 Team", points: 79, wins: 0 },
    { position: 9, team: "Stake F1", points: 70, wins: 0 },
    { position: 10, team: "Alpine F1 Team", points: 22, wins: 0 },
  ],
  2024: [
    { position: 1, team: "McLaren", points: 666, wins: 6 },
    { position: 2, team: "Ferrari", points: 652, wins: 5 },
    { position: 3, team: "Red Bull", points: 589, wins: 9 },
    { position: 4, team: "Mercedes", points: 468, wins: 3 },
    { position: 5, team: "Aston Martin", points: 94, wins: 0 },
    { position: 6, team: "Alpine F1 Team", points: 65, wins: 0 },
    { position: 7, team: "Haas F1 Team", points: 58, wins: 0 },
    { position: 8, team: "Visa Cash App RB", points: 46, wins: 0 },
    { position: 9, team: "Williams", points: 17, wins: 0 },
    { position: 10, team: "Stake F1", points: 4, wins: 0 },
  ],
  2023: [
    { position: 1, team: "Red Bull", points: 860, wins: 21 },
    { position: 2, team: "Mercedes", points: 409, wins: 0 },
    { position: 3, team: "Ferrari", points: 406, wins: 1 },
    { position: 4, team: "McLaren", points: 302, wins: 0 },
    { position: 5, team: "Aston Martin", points: 280, wins: 0 },
    { position: 6, team: "Alpine F1 Team", points: 120, wins: 0 },
    { position: 7, team: "Williams", points: 28, wins: 0 },
    { position: 8, team: "AlphaTauri", points: 25, wins: 0 },
    { position: 9, team: "Alfa Romeo", points: 16, wins: 0 },
    { position: 10, team: "Haas F1 Team", points: 12, wins: 0 },
  ],
};

/** `championships × 100 + wins × 10 + podiums × 3` — the exact formula used by
 * the real Lakeview dashboard's "Dominant Drivers/Teams of All Time" pages. */
export const greatnessScore = (championships: number, wins: number, podiums: number) =>
  championships * 100 + wins * 10 + podiums * 3;

export interface LegendDriver {
  name: string;
  nationality: string;
  championships: number;
  wins: number;
  podiums: number;
  races: number;
}

/** Verified against each driver's Wikipedia infobox. */
export const dominantDrivers: LegendDriver[] = [
  { name: "Lewis Hamilton", nationality: "British", championships: 7, wins: 106, podiums: 207, races: 391 },
  { name: "Michael Schumacher", nationality: "German", championships: 7, wins: 91, podiums: 155, races: 306 },
  { name: "Max Verstappen", nationality: "Dutch", championships: 4, wins: 71, podiums: 131, races: 244 },
  { name: "Sebastian Vettel", nationality: "German", championships: 4, wins: 53, podiums: 122, races: 299 },
  { name: "Alain Prost", nationality: "French", championships: 4, wins: 51, podiums: 106, races: 199 },
  { name: "Ayrton Senna", nationality: "Brazilian", championships: 3, wins: 41, podiums: 80, races: 161 },
  { name: "Juan Manuel Fangio", nationality: "Argentine", championships: 5, wins: 24, podiums: 35, races: 51 },
];

export interface LegendTeam {
  name: string;
  championships: number;
  wins: number;
  podiums: number;
  races: number;
}

/** Verified against each constructor's Wikipedia infobox. */
export const dominantTeams: LegendTeam[] = [
  { name: "Ferrari", championships: 16, wins: 249, podiums: 840, races: 1132 },
  { name: "McLaren", championships: 10, wins: 204, podiums: 563, races: 1004 },
  { name: "Mercedes", championships: 8, wins: 139, podiums: 324, races: 352 },
  { name: "Williams", championships: 9, wins: 114, podiums: 315, races: 861 },
  { name: "Red Bull", championships: 6, wins: 130, podiums: 301, races: 428 },
];

export type PipelineLayer = "bronze" | "silver" | "gold";

export interface PipelineTask {
  key: string;
  label: string;
  layer: PipelineLayer;
  dependsOn: string[];
}

/** The real 17-task DAG from `resources/jobs/job_formula1_lakehouse_full_refresh.yml`
 * in goldenFlori/formula1-databricks — exact task names and dependencies. */
export const pipelineTasks: PipelineTask[] = [
  { key: "ingest_circuits", label: "Ingest Circuits File", layer: "bronze", dependsOn: [] },
  { key: "ingest_races", label: "Ingest Races File", layer: "bronze", dependsOn: [] },
  { key: "ingest_constructors", label: "Ingest Constructors File", layer: "bronze", dependsOn: [] },
  { key: "ingest_drivers", label: "Ingest Drivers File", layer: "bronze", dependsOn: [] },
  { key: "ingest_results", label: "Ingest Results File", layer: "bronze", dependsOn: [] },
  { key: "ingest_sprints", label: "Ingest Sprints File", layer: "bronze", dependsOn: [] },
  { key: "transform_circuits", label: "Transform Circuits Data", layer: "silver", dependsOn: ["ingest_circuits"] },
  { key: "transform_races", label: "Transform Races Data", layer: "silver", dependsOn: ["ingest_races"] },
  { key: "transform_constructors", label: "Transform Constructors Data", layer: "silver", dependsOn: ["ingest_constructors"] },
  { key: "transform_drivers", label: "Transform Drivers Data", layer: "silver", dependsOn: ["ingest_drivers"] },
  { key: "transform_results", label: "Transform Results Data", layer: "silver", dependsOn: ["ingest_results"] },
  { key: "transform_sprints", label: "Transform Sprints Data", layer: "silver", dependsOn: ["ingest_sprints"] },
  { key: "build_races_dim", label: "Build Races Dimension", layer: "gold", dependsOn: ["transform_circuits", "transform_races"] },
  { key: "build_constructors_dim", label: "Build Constructors Dimension", layer: "gold", dependsOn: ["transform_constructors"] },
  { key: "build_drivers_dim", label: "Build Drivers Dimension", layer: "gold", dependsOn: ["transform_drivers"] },
  { key: "build_results_fact", label: "Build Results Fact", layer: "gold", dependsOn: ["transform_results", "transform_sprints"] },
  { key: "build_nationality_ref", label: "Build Nationality Region Reference", layer: "gold", dependsOn: [] },
];

/** Verified facts about the pipeline, quoted for the tile's caption/footer. */
export const pipelineMeta = {
  repo: "https://github.com/goldenFlori/formula1-databricks",
  jobName: "job_formula1_lakehouse_full_refresh",
  tableCount: 19,
  cluster: "Azure Standard_D4s_v3 · single-node · DBR 17.3",
  sourceEntities: 6,
};
