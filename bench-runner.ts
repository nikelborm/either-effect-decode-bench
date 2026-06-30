const ROUNDS = 100;

interface Bench {
  label: string;
  file: string;
  key: string;
}

const BENCHES: Bench[] = [
  { label: "decodeEffect", file: "dist/effect-case.js", key: "decodeEffect" },
  { label: "decodeEither", file: "dist/either-case.js", key: "decodeEither" },
];

interface Sample {
  totalTime: number;
  perOp: number;
}


async function runBench(bench: Bench): Promise<Sample> {
  const proc = Bun.spawn(["bun", bench.file], {
    stdout: "pipe",
    stderr: "inherit",
  });

  const out = await new Response(proc.stdout).text();
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`${bench.file} exited with code ${code}`);
  }


  const line = out.trim().split("\n").filter(Boolean).at(-1);
  if (!line) throw new Error(`${bench.file} produced no output`);

  const parsed = JSON.parse(line) as Record<string, Sample>;
  const sample = parsed[bench.key];
  if (!sample) {
    throw new Error(`${bench.file} output missing key "${bench.key}": ${line}`);
  }
  return sample;
}


const collected = new Map<string, Sample[]>(BENCHES.map((b) => [b.label, []]));

for (let round = 1; round <= ROUNDS; round++) {

  const warmup = round === 1;
  for (const bench of BENCHES) {
    const sample = await runBench(bench);
    if (!warmup) collected.get(bench.label)!.push(sample);
    console.log(
      `round ${round}${warmup ? " (warmup, discarded)" : ""}  ${bench.label.padEnd(12)}  ` +
        `total=${sample.totalTime.toFixed(2)}ms  perOp=${sample.perOp.toFixed(6)}ms`,
    );
  }
}


const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const avg = (xs: number[]) => sum(xs) / xs.length;

console.log(`\n=== Aggregate over ${ROUNDS - 1} rounds (round 1 discarded; bench-reported numbers only) ===`);
for (const bench of BENCHES) {
  const samples = collected.get(bench.label)!;
  const totals = samples.map((s) => s.totalTime);
  const perOps = samples.map((s) => s.perOp);
  console.log(`\n${bench.label}:`);
  console.log(`  totalTime  avg=${avg(totals).toFixed(2)}ms  min=${Math.min(...totals).toFixed(2)}ms  max=${Math.max(...totals).toFixed(2)}ms`);
  console.log(`  perOp      avg=${avg(perOps).toFixed(6)}ms  min=${Math.min(...perOps).toFixed(6)}ms  max=${Math.max(...perOps).toFixed(6)}ms`);
}


const [a, b] = BENCHES;
if (a && b) {
  const avgA = avg(collected.get(a.label)!.map((s) => s.totalTime));
  const avgB = avg(collected.get(b.label)!.map((s) => s.totalTime));
  const slower = avgA >= avgB ? a : b;
  const faster = avgA >= avgB ? b : a;
  const ratio = Math.max(avgA, avgB) / Math.min(avgA, avgB);
  console.log(`\n${slower.label} is ${ratio.toFixed(2)}x slower than ${faster.label} (avg totalTime).`);
}
