import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import type { SessionResult } from "../../../domain/models/SessionResult";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { colors, spacing } from "../../../shared/theme";
import { formatClockTime } from "../../../shared/utils/time";
import { useForegroundAlarm } from "../hooks/useForegroundAlarm";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmRinging">;
type RingingState = "ringing" | "snoozing";

const DEMO_SNOOZE_DELAY_MS = 5000;

const MODE_LABELS: Record<WakeMode, string> = {
  fast: "Fast",
  balanced: "Balanced",
  comfort: "Comfort"
};

const REASON_LABELS: Record<SessionResult["reasonCode"], string> = {
  stable_zone: "Stable wake zone",
  drop_protection: "Wake opportunity degrading",
  latest_fallback: "Latest wake time fallback"
};

export function AlarmRingingScreen({ navigation, route }: Props) {
  useKeepAwake("StableWakeAlarmRinging");

  const { result } = route.params;
  const { audioStatus, startAlarm, stopAlarm } = useForegroundAlarm();
  const [ringingState, setRingingState] = useState<RingingState>("ringing");
  const isRinging = ringingState === "ringing";

  useEffect(() => {
    if (isRinging) {
      startAlarm();
    } else {
      stopAlarm();
    }
  }, [isRinging, startAlarm, stopAlarm]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", stopAlarm);

    return unsubscribe;
  }, [navigation, stopAlarm]);

  useEffect(() => {
    if (isRinging) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setRingingState("ringing");
    }, DEMO_SNOOZE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isRinging]);

  const stopAndShowResult = () => {
    stopAlarm();
    navigation.replace("Result", { result });
  };

  const snooze = () => {
    stopAlarm();
    setRingingState("snoozing");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView alwaysBounceVertical contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow} testID="alarm-ringing-state">
            {isRinging ? "Alarm ringing" : "Snoozing"}
          </Text>
          <Text style={styles.title}>{isRinging ? "Wake up" : "Demo snooze"}</Text>
          <Text testID="alarm-trigger-time" style={styles.triggerTime}>
            {formatTriggerMinute(result.triggerTimestampMs)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why StableWake rang</Text>
          <MetricRow
            label="Trigger reason"
            testID="alarm-reason-code"
            value={`${REASON_LABELS[result.reasonCode]} (${result.reasonCode})`}
          />
          <MetricRow
            label="Wake mode"
            testID="alarm-wake-mode"
            value={MODE_LABELS[result.wakeMode]}
          />
          <MetricRow
            label="Latest wake time"
            testID="alarm-latest-wake-time"
            value={formatClockTime(result.latestWakeTime)}
          />
          <MetricRow
            label="Wake window"
            testID="alarm-wake-window"
            value={`${result.wakeWindowMinutes} min`}
          />
        </View>

        {!isRinging ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Snoozed for demo testing</Text>
            <Text testID="alarm-snooze-status" style={styles.mutedText}>
              The foreground alarm will ring again in 5 seconds.
            </Text>
          </View>
        ) : null}

        <Text testID="alarm-prototype-note" style={styles.prototypeNote}>
          Foreground prototype alarm. Background alarm support is planned for a later milestone.
        </Text>
        {__DEV__ ? (
          <Text testID="alarm-audio-status" style={styles.audioStatus}>
            {audioStatus}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={stopAndShowResult}
            style={[styles.button, styles.stopButton]}
            testID="alarm-stop-button"
          >
            <Text style={styles.stopButtonText}>Stop</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!isRinging}
            onPress={snooze}
            style={[styles.button, styles.snoozeButton, !isRinging && styles.disabledButton]}
            testID="alarm-snooze-button"
          >
            <Text style={styles.snoozeButtonText}>Snooze (demo 5s)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type MetricRowProps = {
  label: string;
  testID: string;
  value: string;
};

function MetricRow({ label, testID, value }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} testID={testID}>
        {label}: {value}
      </Text>
    </View>
  );
}

function formatTriggerMinute(timestampMs: number): string {
  return `${Math.round(timestampMs / 60000)} min into simulation`;
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
    gap: 8,
    paddingTop: 16
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.danger,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text
  },
  triggerTime: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.primary
  },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  metricRow: {
    gap: 2,
    paddingVertical: 4
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.text
  },
  mutedText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  },
  prototypeNote: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  audioStatus: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  },
  actions: {
    gap: 12
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 16
  },
  stopButton: {
    backgroundColor: colors.danger
  },
  snoozeButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  disabledButton: {
    opacity: 0.55
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff"
  },
  snoozeButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary
  }
});
