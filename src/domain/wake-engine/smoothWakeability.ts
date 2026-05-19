export function smoothWakeability(rawWakeabilities: number[], windowSize: number): number[] {
  return rawWakeabilities.map((_, index) => {
    const windowStart = Math.max(0, index - windowSize + 1);
    const window = rawWakeabilities.slice(windowStart, index + 1);
    const average = window.reduce((sum, value) => sum + value, 0) / window.length;

    return Number(average.toFixed(4));
  });
}

