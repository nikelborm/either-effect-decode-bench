import { Schema } from "effect";
import * as Effect from "effect/Effect";
import { TelemetryEvent, SAMPLES, N, REPS, warmupCpu } from "./schema";

let totalTime = 0;

const decodeEffect = Schema.decode(TelemetryEvent);

// Ramp CPU clocks before measuring (see schema.ts).
warmupCpu();

Effect.runSync(
  Effect.gen(function* () {
    for (let rep = 0; rep < REPS; rep++) {
      for (const obj of SAMPLES) {
        const start = performance.now();
        yield* decodeEffect(obj);
        const end = performance.now();
        totalTime += end - start;
      }
    }
  }),
);

const ops = N * REPS;

console.log(JSON.stringify({ decodeEffect: { totalTime, perOp: totalTime / ops } }))
