import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import { TimePickerCard } from "../components/TimePickerCard";
import { WakeModeSelector } from "../components/WakeModeSelector";
import { WakeWindowSelector } from "../components/WakeWindowSelector";
import { useAlarmSettings } from "../hooks/useAlarmSettings";
import { WAKE_WINDOW_PRESETS } from "../../../shared/constants/defaults";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmSettings">;

export function AlarmSettingsScreen({ navigation }: Props) {
  const { settings, setLatestWakeTime, setWakeWindowMinutes, setWakeMode } = useAlarmSettings();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Set up your alarm</Text>
        <Text style={styles.subtitle}>
          StableWake will use these settings once session monitoring is implemented.
        </Text>
      </View>

      <TimePickerCard value={settings.latestWakeTime} onChange={setLatestWakeTime} />
      <WakeWindowSelector
        options={WAKE_WINDOW_PRESETS}
        value={settings.wakeWindowMinutes}
        onChange={setWakeWindowMinutes}
      />
      <WakeModeSelector value={settings.wakeMode} onChange={setWakeMode} />

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.push("SleepSession", { settings })}
        style={styles.startButton}
        testID="start-session-button"
      >
        <Text style={styles.startButtonText}>Start Session</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f7fb"
  },
  content: {
    gap: 16,
    padding: 20
  },
  header: {
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#152238"
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#41566f"
  },
  startButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#0d3b66",
    alignItems: "center"
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff"
  }
});
