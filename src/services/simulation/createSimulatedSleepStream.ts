import type { AlarmSettings } from "../../domain/models/AlarmSettings";
import type { ClockTime } from "../../domain/models/ClockTime";
import type { SleepSample } from "../../domain/models/SleepSample";
import { addMinutesToClockTime } from "../../shared/utils/time";

const TICK_MINUTES = 1;
const MS_PER_MINUTE = 60 * 1000;
const PRE_WAKE_WINDOW_MINUTES = 10;
const POST_LATEST_WAKE_MINUTES = 5;
const DEFAULT_INTERVAL_MS = 1000;
const SIMULATED_MS_PER_REAL_MS = MS_PER_MINUTE / DEFAULT_INTERVAL_MS;

export type SimulatedSessionPlan = {
  startClockTime: ClockTime;
  wakeWindowStartClockTime: ClockTime;
  latestWakeTime: ClockTime;
  tickMinutes: number;
  totalDurationMinutes: number;
};

type CreateSimulatedSleepStreamOptions = {
  settings: AlarmSettings;
  intervalMs?: number;
  onSample: (sample: SleepSample) => void;
  onComplete: () => void;
};

export function createSimulatedSessionPlan(settings: AlarmSettings): SimulatedSessionPlan {
  const wakeWindowStartClockTime = addMinutesToClockTime(
    settings.latestWakeTime,
    -settings.wakeWindowMinutes
  );

  return {
    startClockTime: addMinutesToClockTime(wakeWindowStartClockTime, -PRE_WAKE_WINDOW_MINUTES),
    wakeWindowStartClockTime,
    latestWakeTime: settings.latestWakeTime,
    tickMinutes: TICK_MINUTES,
    totalDurationMinutes:
      PRE_WAKE_WINDOW_MINUTES + settings.wakeWindowMinutes + POST_LATEST_WAKE_MINUTES
  };
}

export function isWakeWindowActive(simulatedMinute: number): boolean {
  return simulatedMinute >= PRE_WAKE_WINDOW_MINUTES;
}

export function getSimulatedMinute(sample: SleepSample): number {
  return Math.floor(sample.timestampMs / MS_PER_MINUTE);
}

export function createSimulatedSleepSample(simulatedMinute: number): SleepSample {
  if (simulatedMinute < PRE_WAKE_WINDOW_MINUTES) {
    return {
      timestampMs: simulatedMinute * MS_PER_MINUTE,
      motionScore: 0.18,
      soundScore: 0.22
    };
  }

  const minutesIntoWakeWindow = simulatedMinute - PRE_WAKE_WINDOW_MINUTES;
  const wakeableRise = Math.min(minutesIntoWakeWindow, 4) * 0.04;
  const gentleVariation = (minutesIntoWakeWindow % 3) * 0.01;

  return {
    timestampMs: simulatedMinute * MS_PER_MINUTE,
    motionScore: Number((0.64 + wakeableRise + gentleVariation).toFixed(2)),
    soundScore: Number((0.62 + wakeableRise).toFixed(2))
  };
}

export function createSimulatedSleepStream({
  settings,
  intervalMs = DEFAULT_INTERVAL_MS,
  onSample,
  onComplete
}: CreateSimulatedSleepStreamOptions) {
  const plan = createSimulatedSessionPlan(settings);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let startRealTimeMs = 0;
  let lastEmittedMinute = -1;

  const emitNextSample = () => {
    const elapsedRealMs = Date.now() - startRealTimeMs;
    const elapsedMinute = Math.floor((elapsedRealMs * SIMULATED_MS_PER_REAL_MS) / MS_PER_MINUTE);

    if (elapsedMinute === lastEmittedMinute) {
      return;
    }

    lastEmittedMinute = elapsedMinute;
    onSample(createSimulatedSleepSample(elapsedMinute));

    if (elapsedMinute >= plan.totalDurationMinutes) {
      stop();
      onComplete();
    }
  };

  const start = () => {
    if (intervalId !== null) {
      return;
    }

    startRealTimeMs = Date.now();
    lastEmittedMinute = -1;
    intervalId = setInterval(emitNextSample, intervalMs);
    emitNextSample();
  };

  const stop = () => {
    if (intervalId === null) {
      return;
    }

    clearInterval(intervalId);
    intervalId = null;
  };

  return {
    plan,
    start,
    stop
  };
}
