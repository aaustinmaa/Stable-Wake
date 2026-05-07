import type { ClockTime } from "../../domain/models/ClockTime";

const MINUTES_IN_DAY = 24 * 60;
const STEP_MINUTES = 15;

export function formatClockTime(time: ClockTime): string {
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");

  return `${hour}:${minute}`;
}

export function shiftClockTimeByStep(time: ClockTime, direction: "forward" | "backward"): ClockTime {
  const currentMinutes = time.hour * 60 + time.minute;
  const delta = direction === "forward" ? STEP_MINUTES : -STEP_MINUTES;
  const nextMinutes = (currentMinutes + delta + MINUTES_IN_DAY) % MINUTES_IN_DAY;

  return {
    hour: Math.floor(nextMinutes / 60),
    minute: nextMinutes % 60
  };
}
