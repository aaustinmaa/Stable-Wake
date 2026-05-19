export function computeTimingPressure(
  currentTimeMs: number,
  wakeWindowStartMs: number,
  latestWakeTimeMs: number
): number {
  if (currentTimeMs <= wakeWindowStartMs) {
    return 0;
  }

  if (currentTimeMs >= latestWakeTimeMs) {
    return 1;
  }

  const wakeWindowDurationMs = latestWakeTimeMs - wakeWindowStartMs;

  if (wakeWindowDurationMs <= 0) {
    return 1;
  }

  return Number(((currentTimeMs - wakeWindowStartMs) / wakeWindowDurationMs).toFixed(4));
}

