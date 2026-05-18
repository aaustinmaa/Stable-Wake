import type { AlarmSettings } from "../../domain/models/AlarmSettings";
import type { ClockTime } from "../../domain/models/ClockTime";
import type { SleepSample } from "../../domain/models/SleepSample";
import { addMinutesToClockTime } from "../../shared/utils/time";

const TICK_MINUTES = 5;
const PRE_WAKE_WINDOW_MINUTES = 10;
const POST_LATEST_WAKE_MINUTES = 5;
const DEFAULT_INTERVAL_MS = 700;

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

export function createSimulatedSleepSample(simulatedMinute: number): SleepSample {
  const step = Math.floor(simulatedMinute / TICK_MINUTES);

  return {
    simulatedMinute,
    motionScore: Number((0.18 + (step % 5) * 0.08).toFixed(2)),
    soundScore: Number((0.22 + ((step + 2) % 4) * 0.07).toFixed(2))
  };
}

export function createSimulatedSleepStream({
  settings,
  intervalMs = DEFAULT_INTERVAL_MS,
  onSample,
  onComplete
}: CreateSimulatedSleepStreamOptions) {
  const plan = createSimulatedSessionPlan(settings);
  let elapsedMinute = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const emitNextSample = () => {
    onSample(createSimulatedSleepSample(elapsedMinute));

    if (elapsedMinute >= plan.totalDurationMinutes) {
      stop();
      onComplete();
      return;
    }

    elapsedMinute += plan.tickMinutes;
  };

  const start = () => {
    if (intervalId !== null) {
      return;
    }

    emitNextSample();
    intervalId = setInterval(emitNextSample, intervalMs);
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

