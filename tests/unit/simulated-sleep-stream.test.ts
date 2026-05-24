import { AppState } from "react-native";

import {
  createSimulatedSleepStream,
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
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    setAppState("active");
  });

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

  it("increases simulated elapsed time while AppState is active", () => {
    const { emittedMinutes, startStream } = createTestStream();

    startStream();

    expect(emittedMinutes).toEqual([0]);

    jest.advanceTimersByTime(3000);

    expect(emittedMinutes).toEqual([0, 1, 2, 3]);
  });

  it("does not increase simulated elapsed time while AppState is inactive", () => {
    const { emittedMinutes, emitAppState, startStream } = createTestStream();

    startStream();

    jest.advanceTimersByTime(2000);
    emitAppState("background");
    jest.advanceTimersByTime(30000);

    expect(emittedMinutes).toEqual([0, 1, 2]);
  });

  it("resumes simulated elapsed time from the previous active duration", () => {
    const { emittedMinutes, emitAppState, startStream } = createTestStream();

    startStream();

    jest.advanceTimersByTime(2000);
    emitAppState("background");
    jest.advanceTimersByTime(30000);
    emitAppState("active");
    jest.advanceTimersByTime(2000);

    expect(emittedMinutes).toEqual([0, 1, 2, 3, 4]);
  });

  it("does not force latest fallback from background wall-clock time", () => {
    const shortWindowSettings: AlarmSettings = {
      latestWakeTime: { hour: 7, minute: 0 },
      wakeWindowMinutes: 15,
      wakeMode: "balanced"
    };
    const { emittedMinutes, emitAppState, startStream } = createTestStream(shortWindowSettings);

    startStream();

    jest.advanceTimersByTime(2000);
    emitAppState("background");
    jest.advanceTimersByTime(120000);

    const wakeWindowStartMs = 10 * MS_PER_MINUTE;
    const latestWakeTimeMs = wakeWindowStartMs + shortWindowSettings.wakeWindowMinutes * MS_PER_MINUTE;
    const samples = emittedMinutes.map(createSimulatedSleepSample);
    const result = evaluateWakeEngine({
      samples,
      currentTimeMs: samples[samples.length - 1].timestampMs,
      wakeWindowStartMs,
      latestWakeTimeMs,
      wakeMode: shortWindowSettings.wakeMode
    });

    expect(emittedMinutes).toEqual([0, 1, 2]);
    expect(result.decision.reasonCode).not.toBe("latest_fallback");
  });
});

type AppStateListener = (state: "active" | "background" | "inactive") => void;

function createTestStream(testSettings: AlarmSettings = settings) {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 4, 22, 22, 0, 0));
  setAppState("active");

  const emittedMinutes: number[] = [];
  let appStateListener: AppStateListener | null = null;
  const remove = jest.fn();

  jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
    appStateListener = listener as AppStateListener;

    return { remove };
  });

  const stream = createSimulatedSleepStream({
    settings: testSettings,
    onSample: (sample) => {
      emittedMinutes.push(getSampleMinute(sample.timestampMs));
    },
    onComplete: jest.fn()
  });

  return {
    emittedMinutes,
    emitAppState: (state: "active" | "background" | "inactive") => {
      setAppState(state);
      appStateListener?.(state);
    },
    startStream: stream.start,
    stopStream: stream.stop
  };
}

function getSampleMinute(timestampMs: number) {
  return Math.floor(timestampMs / MS_PER_MINUTE);
}

function setAppState(state: "active" | "background" | "inactive") {
  Object.defineProperty(AppState, "currentState", {
    configurable: true,
    get: () => state
  });
}
