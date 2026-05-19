import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import { clearAlarmSettings } from "../../../data/storage/alarmSettingsStorage";
import {
  clearSessionResultSummaries,
  loadSessionResultSummaries
} from "../../../data/storage/sessionResultStorage";
import type { SessionResultSummary } from "../../../domain/models/SessionResultSummary";
import { RecentSessionsCard } from "../components/RecentSessionsCard";
import { TimePickerCard } from "../components/TimePickerCard";
import { WakeModeSelector } from "../components/WakeModeSelector";
import { WakeWindowSelector } from "../components/WakeWindowSelector";
import { useAlarmSettings } from "../hooks/useAlarmSettings";
import { WAKE_WINDOW_PRESETS } from "../../../shared/constants/defaults";
import { colors, spacing } from "../../../shared/theme";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmSettings">;

export function AlarmSettingsScreen({ navigation }: Props) {
  const {
    isLoaded,
    settings,
    setLatestWakeTime,
    setWakeWindowMinutes,
    setWakeMode,
    resetToDefaultsWithoutSaving
  } = useAlarmSettings();
  const [recentSessions, setRecentSessions] = useState<SessionResultSummary[]>([]);

  const refreshRecentSessions = useCallback(() => {
    loadSessionResultSummaries().then(setRecentSessions);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", refreshRecentSessions);

    refreshRecentSessions();

    return unsubscribe;
  }, [navigation, refreshRecentSessions]);

  const clearLocalData = async () => {
    await Promise.all([clearAlarmSettings(), clearSessionResultSummaries()]);
    resetToDefaultsWithoutSaving();
    setRecentSessions([]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView alwaysBounceVertical contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Set up your alarm</Text>
          <Text style={styles.subtitle}>
            Choose the latest wake time, wake window, and comfort mode for the simulation.
          </Text>
          <Text style={styles.localStatus} testID="local-settings-status">
            {isLoaded ? "Saved locally on this device." : "Loading saved settings..."}
          </Text>
        </View>

        <TimePickerCard value={settings.latestWakeTime} onChange={setLatestWakeTime} />
        <WakeWindowSelector
          options={WAKE_WINDOW_PRESETS}
          value={settings.wakeWindowMinutes}
          onChange={setWakeWindowMinutes}
        />
        <WakeModeSelector value={settings.wakeMode} onChange={setWakeMode} />
        <RecentSessionsCard summaries={recentSessions} />

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.push("SleepSession", { settings })}
          style={styles.startButton}
          testID="start-session-button"
        >
          <Text style={styles.startButtonText}>Start Session</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={clearLocalData}
          style={styles.clearButton}
          testID="clear-local-data-button"
        >
          <Text style={styles.clearButtonText}>Clear saved data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    gap: spacing.gap,
    padding: spacing.screen,
    paddingBottom: 32
  },
  header: {
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted
  },
  localStatus: {
    fontSize: 13,
    color: colors.muted
  },
  startButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center"
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff"
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: 12
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted
  }
});
