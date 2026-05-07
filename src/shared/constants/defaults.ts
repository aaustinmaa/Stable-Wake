import type { AlarmSettings } from "../../domain/models/AlarmSettings";

export const WAKE_WINDOW_PRESETS = [15, 30, 45, 60] as const;

export const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  latestWakeTime: { hour: 7, minute: 0 },
  wakeWindowMinutes: 30,
  wakeMode: "balanced"
};
