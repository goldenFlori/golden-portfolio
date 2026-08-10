/**
 * Decorative field of small gold particles drifting slowly behind the page.
 *
 * The field is generated once from a seeded PRNG, so every visitor sees the
 * exact same constellation on every visit (deterministic, testable, no
 * hydration drift). Motion itself is pure CSS driven by per-particle custom
 * properties (see index.css §4) and animates `transform` only, so the work
 * stays on the compositor.
 */

const PARTICLE_COUNT = 56;
const SEED = 0xf10;

/** Gold tones particles are drawn from, light to deep. */
const TONES = ["#f8dc94", "#f0b341", "#c9871c"] as const;

/** Small, fast, deterministic PRNG (mulberry32). */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand: () => number, min: number, max: number) =>
  min + rand() * (max - min);

interface Particle {
  left: string;
  top: string;
  size: number;
  opacity: number;
  tone: string;
  driftX: string;
  driftY: string;
  duration: string;
  delay: string;
}

function buildField(count: number, seed: number): Particle[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const duration = between(rand, 40, 90); // very slow: 40–90s per drift
    return {
      left: `${between(rand, 0, 100)}%`,
      top: `${between(rand, 0, 100)}%`,
      size: between(rand, 2, 7),
      opacity: between(rand, 0.15, 0.55),
      tone: TONES[Math.floor(rand() * TONES.length)],
      driftX: `${between(rand, -60, 60)}px`,
      driftY: `${between(rand, -80, 40)}px`,
      duration: `${duration}s`,
      delay: `-${between(rand, 0, duration)}s`, // negative: start mid-drift, desynced
    };
  });
}

const FIELD = buildField(PARTICLE_COUNT, SEED);

type ParticleStyle = React.CSSProperties &
  Record<"--tone" | "--drift-x" | "--drift-y" | "--duration" | "--delay", string>;

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-wash" />
      {FIELD.map((p, i) => {
        const style: ParticleStyle = {
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          opacity: p.opacity,
          "--tone": p.tone,
          "--drift-x": p.driftX,
          "--drift-y": p.driftY,
          "--duration": p.duration,
          "--delay": p.delay,
        };
        return <span key={i} className="particle" style={style} />;
      })}
    </div>
  );
}
