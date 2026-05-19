import type { AlarmSettings } from "../../domain/models/AlarmSettings";
import type { SessionResult } from "../../domain/models/SessionResult";

export type RootStackParamList = {
  AlarmSettings: undefined;
  SleepSession: { settings: AlarmSettings };
  Result: { result: SessionResult };
};
