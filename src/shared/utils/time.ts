import type { ClockTime } from "../../domain/models/ClockTime";

const MINUTES_IN_DAY = 24 * 60;
const STEP_MINUTES = 15;

export function clockTimeToMinutes(time: ClockTime): number {
  return time.hour * 60 + time.minute;
}

export function minutesToClockTime(totalMinutes: number): ClockTime {
  const normalizedMinutes = (totalMinutes + MINUTES_IN_DAY) % MINUTES_IN_DAY;

  return {
    hour: Math.floor(normalizedMinutes / 60),
    minute: normalizedMinutes % 60
  };
}

export function formatClockTime(time: ClockTime): string {
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");

  return `${hour}:${minute}`;
}

export function addMinutesToClockTime(time: ClockTime, minutes: number): ClockTime {
  return minutesToClockTime(clockTimeToMinutes(time) + minutes);
}

export function shiftClockTimeByStep(time: ClockTime, direction: "forward" | "backward"): ClockTime {
  const delta = direction === "forward" ? STEP_MINUTES : -STEP_MINUTES;

  return addMinutesToClockTime(time, delta);
}
