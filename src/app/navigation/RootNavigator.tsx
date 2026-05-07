import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./routeTypes";
import { AlarmSettingsScreen } from "../../features/alarm-settings/screens/AlarmSettingsScreen";
import { SleepSessionScreen } from "../../features/sleep-session/screens/SleepSessionScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="AlarmSettings">
      <Stack.Screen
        name="AlarmSettings"
        component={AlarmSettingsScreen}
        options={{ title: "StableWake" }}
      />
      <Stack.Screen
        name="SleepSession"
        component={SleepSessionScreen}
        options={{ title: "Session" }}
      />
    </Stack.Navigator>
  );
}
