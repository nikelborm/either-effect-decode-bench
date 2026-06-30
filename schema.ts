import { Arbitrary, FastCheck as fc, Schema } from "effect";


const Probability = Schema.Number.pipe(
  Schema.filter((n) => (n >= 0 && n <= 1 ? true : "expected a value in [0, 1]"), {
    arbitrary: () => (fc) => fc.double({ min: 0, max: 1, noNaN: true }),
  }),
);


const PortFromString = Schema.NumberFromString.pipe(
  Schema.filter((n) => Number.isInteger(n) && n > 0 && n < 65536, {
    message: () => "expected a valid TCP port",
    arbitrary: () => (fc) => fc.integer({ min: 1, max: 65535 }),
  }),
);


const ClickPayload = Schema.TaggedStruct("Click", {
  x: Schema.Int,
  y: Schema.Int,
  confidence: Probability,
});

const NavPayload = Schema.TaggedStruct("Navigate", {
  from: Schema.NonEmptyString,
  to: Schema.NonEmptyString,
  port: PortFromString,
});

const ErrorPayload = Schema.TaggedStruct("Error", {
  code: Schema.Int,
  fatal: Schema.Boolean,
});

const Payload = Schema.Union(ClickPayload, NavPayload, ErrorPayload);


const SessionLen = Schema.Number.pipe(
  Schema.filter((n) => (n >= 0 && n < 1e9 ? true : "sessionLen out of range"), {
    arbitrary: () => (fc) => fc.double({ min: 0, max: 1e9, noNaN: true }),
  }),
);


export const TelemetryEvent = Schema.Struct({
  id: Schema.UUID,
  emittedAt: Schema.DateFromString,
  sessionLen: SessionLen,
  payload: Payload,
});

export type TelemetryEventEncoded = Schema.Schema.Encoded<typeof TelemetryEvent>;

export const N = 10_000;



export const REPS = 50;


export const SEED = 42;

function makeSamples(): TelemetryEventEncoded[] {
  const typeArb = Arbitrary.make(TelemetryEvent);
  const decoded = fc.sample(typeArb, { numRuns: N, seed: SEED });
  const encode = Schema.encodeSync(TelemetryEvent);
  return decoded.map(e=> encode(e));
}

export const SAMPLES: ReadonlyArray<TelemetryEventEncoded> = makeSamples();

/**
 * Busy-spin for `ms` to ramp the CPU out of its idle/low-power P-state before a
 * timed region. Run inside each bench right before measuring so the core that
 * executes the timed loop is already at boosted clocks — this removes the
 * first-process "cold CPU" outlier without discarding any round.
 */
export function warmupCpu(ms = 500): void {
  const end = performance.now() + ms;
  let sink = 0;
  while (performance.now() < end) sink += Math.sqrt(sink + 1);
  // Keep `sink` observable and gate on an unpredictable Math.random() so the
  // JIT can't prove the loop is dead and elide it — but it ~never throws.
  if (Math.random() < 0.00000000000000001 && sink >= 0) throw new Error(String(sink));
}
