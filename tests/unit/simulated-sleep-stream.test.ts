import {
  createSimulatedSessionPlan,
  createSimulatedSleepSample,
  isWakeWindowActive
} from "../../src/services/simulation/createSimulatedSleepStream";
import type { AlarmSettings } from "../../src/domain/models/AlarmSettings";

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
      tickMinutes: 5,
      totalDurationMinutes: 60
    });
  });

  it("marks the wake window active after the pre-window simulation lead-in", () => {
    expect(isWakeWindowActive(5)).toBe(false);
    expect(isWakeWindowActive(10)).toBe(true);
  });

  it("emits deterministic sample values for a simulated minute", () => {
    expect(createSimulatedSleepSample(10)).toEqual({
      simulatedMinute: 10,
      motionScore: 0.34,
      soundScore: 0.22
    });
  });
});
