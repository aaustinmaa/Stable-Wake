import type { AlarmSettings } from "../../domain/models/AlarmSettings";

export type RootStackParamList = {
  AlarmSettings: undefined;
  SleepSession: { settings: AlarmSettings };
};
