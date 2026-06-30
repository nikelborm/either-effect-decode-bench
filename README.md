# `Schema.decodeEither` vs `Schema.decode` bench

Bench for Effect's discord thread [here](https://discord.com/channels/795981131316985866/1521396820499238932)

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run bench-prepare
bun run bench
```

```
=== Aggregate over 99 rounds (round 1 discarded; bench-reported numbers only) ===

decodeEffect(Effect.gen):
totalTime  avg=2180.23ms  min=2093.48ms  max=2275.30ms
perOp      avg=0.004360ms min=0.004187ms max=0.004551ms

decodeEither(Effect.gen):
totalTime  avg=2109.44ms  min=2025.82ms  max=2224.41ms
perOp      avg=0.004219ms min=0.004052ms max=0.004449ms

decodeEffect(Effect.gen) is 1.03x slower than decodeEither(Effect.gen) (avg totalTime).
```

```
=== Aggregate over 99 rounds (round 1 discarded; bench-reported numbers only) ===

decodeEffect(Effect.gen):
  totalTime  avg=2174.40ms  min=2101.51ms  max=2267.10ms
  perOp      avg=0.004349ms  min=0.004203ms  max=0.004534ms

decodeEither(Either.gen):
  totalTime  avg=1839.09ms  min=1789.44ms  max=1939.02ms
  perOp      avg=0.003678ms  min=0.003579ms  max=0.003878ms

decodeEffect(Effect.gen) is 1.18x slower than decodeEither(Either.gen) (avg totalTime).
```
