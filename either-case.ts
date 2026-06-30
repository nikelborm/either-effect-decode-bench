import { Schema } from "effect";
import * as Effect from "effect/Effect";
import { TelemetryEvent, SAMPLES, N, REPS } from "./schema";

let totalTime = 0;

const decodeEither = Schema.decodeEither(TelemetryEvent);

Effect.runSync(
  Effect.gen(function* () {
    for (let rep = 0; rep < REPS; rep++) {
      for (const obj of SAMPLES) {
        const start = performance.now();
        yield* decodeEither(obj);
        const end = performance.now();
        totalTime += end - start;
      }
    }
  }),
);

const ops = N * REPS;

console.log(JSON.stringify({ decodeEither: { totalTime, perOp: totalTime / ops } }))
