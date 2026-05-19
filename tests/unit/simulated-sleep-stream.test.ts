import {
  createSimulatedSessionPlan,
  createSimulatedSleepSample,
  isWakeWindowActive
} from "../../src/services/simulation/createSimulatedSleepStream";
import type { AlarmSettings } from "../../src/domain/models/AlarmSettings";
import { evaluateWakeEngine } from "../../src/domain/wake-engine/wakeEngine";
import { MS_PER_MINUTE } from "../../src/domain/wake-engine/wakeEngine.types";

const settings: AlarmSettings = {
  latestWakeTime: { hour: 7, minute: 15 },
  wakeWindowMinutes: 45,
  wakeMode: "balanced"
};

describe("simulated sleep stream", () => {
  it("creates a deterministic plan around the selected wake window", () => {
    expect(createSimulatedSessionPlan(settings)).toEqual({
      startClockTime: { hour: 6, minute: 20 },
      wakeWindowStartClockTime: { hour: 6, minute: 30 },
      latestWakeTime: { hour: 7, minute: 15 },
      tickMinutes: 1,
      totalDurationMinutes: 60
    });
  });

  it("marks the wake window active after the pre-window simulation lead-in", () => {
    expect(isWakeWindowActive(5)).toBe(false);
    expect(isWakeWindowActive(10)).toBe(true);
  });

  it("emits deterministic sample values for a simulated minute", () => {
    expect(createSimulatedSleepSample(10)).toEqual({
      timestampMs: 600000,
      motionScore: 0.64,
      soundScore: 0.62
    });
  });

  it("exposes a default stable wakeable scenario that triggers before fallback", () => {
    const shortWindowSettings: AlarmSettings = {
      latestWakeTime: { hour: 7, minute: 0 },
      wakeWindowMinutes: 15,
      wakeMode: "balanced"
    };
    const plan = createSimulatedSessionPlan(shortWindowSettings);
    const samples = Array.from({ length: plan.totalDurationMinutes + 1 }, (_, minute) =>
      createSimulatedSleepSample(minute)
    );
    const wakeWindowStartMs = 10 * MS_PER_MINUTE;
    const latestWakeTimeMs = wakeWindowStartMs + shortWindowSettings.wakeWindowMinutes * MS_PER_MINUTE;
    const trigger = samples
      .map((sample) =>
        evaluateWakeEngine({
          samples,
          currentTimeMs: sample.timestampMs,
          wakeWindowStartMs,
          latestWakeTimeMs,
          wakeMode: shortWindowSettings.wakeMode
        })
      )
      .find((output) => output.decision.shouldTrigger);

    expect(trigger).toBeDefined();
    expect(trigger?.decision.reasonCode).toBe("stable_zone");
    expect(trigger?.score?.timestampMs).toBeLessThan(latestWakeTimeMs);
  });
});
