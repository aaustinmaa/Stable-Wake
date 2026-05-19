import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AlarmSettings } from "../../domain/models/AlarmSettings";
import type { WakeMode } from "../../domain/models/WakeMode";
import { DEFAULT_ALARM_SETTINGS, WAKE_WINDOW_PRESETS } from "../../shared/constants/defaults";
import { STORAGE_KEYS } from "./storageKeys";

const WAKE_MODES: WakeMode[] = ["fast", "balanced", "comfort"];

export async function loadAlarmSettings(): Promise<AlarmSettings> {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.alarmSettings);

    if (storedValue === null) {
      return DEFAULT_ALARM_SETTINGS;
    }

    const parsedValue = JSON.parse(storedValue);

    return isAlarmSettings(parsedValue) ? parsedValue : DEFAULT_ALARM_SETTINGS;
  } catch {
    return DEFAULT_ALARM_SETTINGS;
  }
}

export async function saveAlarmSettings(settings: AlarmSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.alarmSettings, JSON.stringify(settings));
  } catch {
    // Local persistence is helpful, but the app should keep working if storage fails.
  }
}

export async function clearAlarmSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.alarmSettings);
  } catch {
    // Ignore storage failures so reset actions do not crash the prototype.
  }
}

function isAlarmSettings(value: unknown): value is AlarmSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isClockTime(value.latestWakeTime) &&
    typeof value.wakeWindowMinutes === "number" &&
    WAKE_WINDOW_PRESETS.includes(value.wakeWindowMinutes as (typeof WAKE_WINDOW_PRESETS)[number]) &&
    typeof value.wakeMode === "string" &&
    WAKE_MODES.includes(value.wakeMode as WakeMode)
  );
}

function isClockTime(value: unknown): value is AlarmSettings["latestWakeTime"] {
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
