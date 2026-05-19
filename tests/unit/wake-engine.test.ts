import type { SleepSample } from "../../src/domain/models/SleepSample";
import type { WakeMode } from "../../src/domain/models/WakeMode";
import { evaluateWakeEngine } from "../../src/domain/wake-engine/wakeEngine";
import { MS_PER_MINUTE } from "../../src/domain/wake-engine/wakeEngine.types";

const wakeWindowStartMs = 10 * MS_PER_MINUTE;
const latestWakeTimeMs = 60 * MS_PER_MINUTE;

function sample(minute: number, motionScore: number, soundScore: number): SleepSample {
  return {
    timestampMs: minute * MS_PER_MINUTE,
    motionScore,
    soundScore
  };
}

function evaluateAt(samples: SleepSample[], minute: number, wakeMode: WakeMode = "balanced") {
  return evaluateWakeEngine({
    samples,
    currentTimeMs: minute * MS_PER_MINUTE,
    wakeWindowStartMs,
    latestWakeTimeMs,
    wakeMode
  });
}

function firstTriggerMinute(samples: SleepSample[], wakeMode: WakeMode): number | null {
  for (const currentSample of samples) {
    const result = evaluateWakeEngine({
      samples,
      currentTimeMs: currentSample.timestampMs,
      wakeWindowStartMs,
      latestWakeTimeMs,
      wakeMode
    });

    if (result.decision.shouldTrigger) {
      return currentSample.timestampMs / MS_PER_MINUTE;
    }
  }

  return null;
}

describe("wake engine", () => {
  it("does not trigger on an isolated spike", () => {
    const result = evaluateAt(
      [sample(10, 0.15, 0.12), sample(15, 0.96, 0.96), sample(20, 0.12, 0.1)],
      20
    );

    expect(result.decision.shouldTrigger).toBe(false);
    expect(result.decision.reasonCode).toBeNull();
  });

  it("does not trigger before the wake window starts", () => {
    const result = evaluateAt([sample(0, 0.9, 0.9), sample(5, 0.9, 0.9)], 5, "fast");

    expect(result.decision.shouldTrigger).toBe(false);
  });

  it("triggers latest wake time fallback", () => {
    const result = evaluateAt([sample(10, 0.1, 0.1), sample(55, 0.1, 0.1)], 60);

    expect(result.decision.shouldTrigger).toBe(true);
    expect(result.decision.reasonCode).toBe("latest_fallback");
    expect(result.decision.explanationItems.length).toBeGreaterThan(0);
  });

  it("triggers a stable rising sequence in mode order", () => {
    const samples = [
      sample(10, 0.82, 0.82),
      sample(15, 0.82, 0.82),
      sample(20, 0.82, 0.82),
      sample(25, 0.82, 0.82),
      sample(30, 0.82, 0.82)
    ];

    const fastMinute = firstTriggerMinute(samples, "fast");
    const balancedMinute = firstTriggerMinute(samples, "balanced");
    const comfortMinute = firstTriggerMinute(samples, "comfort");

    expect(fastMinute).not.toBeNull();
    expect(balancedMinute).not.toBeNull();
    expect(comfortMinute).not.toBeNull();
    expect(fastMinute!).toBeLessThanOrEqual(balancedMinute!);
    expect(balancedMinute!).toBeLessThanOrEqual(comfortMinute!);
    expect(fastMinute!).toBeLessThan(latestWakeTimeMs / MS_PER_MINUTE);
    expect(balancedMinute!).toBeLessThan(latestWakeTimeMs / MS_PER_MINUTE);
    expect(comfortMinute!).toBeLessThan(latestWakeTimeMs / MS_PER_MINUTE);
  });

  it("includes explanation items whenever it triggers", () => {
    const result = evaluateAt(
      [sample(10, 0.85, 0.85), sample(15, 0.85, 0.85), sample(20, 0.85, 0.85)],
      20
    );

    expect(result.decision.shouldTrigger).toBe(true);
    expect(result.decision.explanationItems.length).toBeGreaterThan(0);
  });

  it("returns the same result for the same sample sequence", () => {
    const samples = [sample(10, 0.7, 0.7), sample(15, 0.72, 0.68), sample(20, 0.75, 0.73)];

    expect(evaluateAt(samples, 20)).toEqual(evaluateAt(samples, 20));
  });

  it("may trigger drop protection when a stable opportunity degrades", () => {
    const result = evaluateAt(
      [
        sample(10, 0.86, 0.86),
        sample(15, 0.86, 0.86),
        sample(20, 0.86, 0.86),
        sample(25, 0.1, 0.1)
      ],
      25
    );

    expect(result.decision.shouldTrigger).toBe(true);
    expect(result.decision.reasonCode).toBe("drop_protection");
    expect(result.decision.explanationItems.length).toBeGreaterThan(0);
  });
});
