import { useState } from "react";

import type { AlarmSettings } from "../../../domain/models/AlarmSettings";
import type { ClockTime } from "../../../domain/models/ClockTime";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { DEFAULT_ALARM_SETTINGS } from "../../../shared/constants/defaults";

export function useAlarmSettings() {
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_ALARM_SETTINGS);

  const setLatestWakeTime = (latestWakeTime: ClockTime) => {
    setSettings((current) => ({ ...current, latestWakeTime }));
  };

  const setWakeWindowMinutes = (wakeWindowMinutes: number) => {
    setSettings((current) => ({ ...current, wakeWindowMinutes }));
  };

  const setWakeMode = (wakeMode: WakeMode) => {
    setSettings((current) => ({ ...current, wakeMode }));
  };

  return {
    settings,
    setLatestWakeTime,
    setWakeWindowMinutes,
    setWakeMode
  };
}
