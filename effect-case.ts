import { Schema } from "effect";
import * as Effect from "effect/Effect";
import { TelemetryEvent, SAMPLES, N, REPS } from "./schema";

let totalTime = 0;

const decodeEffect = Schema.decode(TelemetryEvent);

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
console.log(`decodeEffect via Effect.gen — ${ops} ops (${N} samples x ${REPS} reps)`);
console.log(`  total: ${totalTime.toFixed(2)} ms`);
console.log(`  per op: ${(totalTime / ops).toFixed(4)} ms`);
