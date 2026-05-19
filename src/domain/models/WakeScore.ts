export type WakeScore = {
  timestampMs: number;
  rawWakeability: number;
  smoothedWakeability: number;
  stabilityScore: number;
  timingPressure: number;
};

