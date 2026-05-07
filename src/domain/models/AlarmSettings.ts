import type { ClockTime } from "./ClockTime";
import type { WakeMode } from "./WakeMode";

export type AlarmSettings = {
  latestWakeTime: ClockTime;
  wakeWindowMinutes: number;
  wakeMode: WakeMode;
};

