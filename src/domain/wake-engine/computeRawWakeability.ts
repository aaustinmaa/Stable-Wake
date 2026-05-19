import type { SleepSample } from "../models/SleepSample";

function clampScore(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function computeRawWakeability(sample: SleepSample): number {
  return clampScore(sample.motionScore * 0.62 + sample.soundScore * 0.38);
}

