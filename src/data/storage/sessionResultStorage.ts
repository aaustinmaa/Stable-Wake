import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SessionResultSummary } from "../../domain/models/SessionResultSummary";
import type { WakeMode } from "../../domain/models/WakeMode";
import { STORAGE_KEYS } from "./storageKeys";

const MAX_RECENT_SUMMARIES = 5;
const WAKE_MODES: WakeMode[] = ["fast", "balanced", "comfort"];
const REASON_CODES: SessionResultSummary["reasonCode"][] = [
  "stable_zone",
  "drop_protection",
  "latest_fallback"
];

export async function loadSessionResultSummaries(): Promise<SessionResultSummary[]> {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.sessionResultSummaries);

    if (storedValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(isSessionResultSummary)
      .sort((left, right) => right.completedAtMs - left.completedAtMs)
      .slice(0, MAX_RECENT_SUMMARIES);
  } catch {
    return [];
  }
}

export async function saveSessionResultSummary(summary: SessionResultSummary): Promise<void> {
  try {
    const currentSummaries = await loadSessionResultSummaries();
    const nextSummaries = [summary, ...currentSummaries.filter((item) => item.id !== summary.id)]
      .sort((left, right) => right.completedAtMs - left.completedAtMs)
      .slice(0, MAX_RECENT_SUMMARIES);

    await AsyncStorage.setItem(
      STORAGE_KEYS.sessionResultSummaries,
      JSON.stringify(nextSummaries)
    );
  } catch {
    // Session history is non-critical; never crash result rendering on storage failure.
  }
}

export async function clearSessionResultSummaries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.sessionResultSummaries);
  } catch {
    // Ignore storage failures so reset actions stay safe.
  }
}

function isSessionResultSummary(value: unknown): value is SessionResultSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.completedAtMs === "number" &&
    typeof value.triggerTimestampMs === "number" &&
    typeof value.wakeWindowMinutes === "number" &&
    isClockTime(value.latestWakeTime) &&
    typeof value.wakeMode === "string" &&
    WAKE_MODES.includes(value.wakeMode as WakeMode) &&
    typeof value.reasonCode === "string" &&
    REASON_CODES.includes(value.reasonCode as SessionResultSummary["reasonCode"])
  );
}

function isClockTime(value: unknown): value is SessionResultSummary["latestWakeTime"] {
  if (!isRecord(value)) {
    return false;
  }

  const { hour, minute } = value;

  return (
    typeof hour === "number" &&
    typeof minute === "number" &&
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
