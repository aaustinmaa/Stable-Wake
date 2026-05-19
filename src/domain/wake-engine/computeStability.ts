export function computeStability(
  smoothedWakeabilities: number[],
  index: number,
  wakeabilityThreshold: number,
  windowSize: number
): number {
  const windowStart = Math.max(0, index - windowSize + 1);
  const window = smoothedWakeabilities.slice(windowStart, index + 1);
  const aboveThresholdCount = window.filter((value) => value >= wakeabilityThreshold).length;

  return Number((aboveThresholdCount / window.length).toFixed(4));
}

