import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import type { SessionStatus } from "../../../domain/models/SessionStatus";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { useSleepSession } from "../hooks/useSleepSession";
import { formatClockTime } from "../../../shared/utils/time";
import { colors, spacing } from "../../../shared/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SleepSession">;

const MODE_LABELS: Record<WakeMode, string> = {
  fast: "Fast",
  balanced: "Balanced",
  comfort: "Comfort"
};

const STATUS_LABELS: Record<SessionStatus, string> = {
  configured: "Configured",
  monitoring: "Monitoring",
  wake_window_active: "Wake window active",
  completed: "Completed"
};

export function SleepSessionScreen({ navigation, route }: Props) {
  const { settings } = route.params;
  const {
    status,
    currentSample,
    currentClockTime,
    elapsedSimulatedMinutes,
    engineOutput,
    plan,
    isWakeWindowActive,
    startSimulation,
    stopSession
  } = useSleepSession(settings, {
    onResult: (result) => navigation.push("Result", { result })
  });
  const isRunning = status === "monitoring" || status === "wake_window_active";

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView alwaysBounceVertical contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Session Shell</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusLabel}>Session status</Text>
            <Text testID="session-status-value" style={styles.statusValue}>
              {STATUS_LABELS[status]}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Selected settings</Text>
          <MetricRow label="Latest wake-up time" testID="session-latest-wake-time" value={formatClockTime(settings.latestWakeTime)} />
          <MetricRow label="Wake window" testID="session-wake-window" value={`${settings.wakeWindowMinutes} min`} />
          <MetricRow label="Wake mode" testID="session-wake-mode" value={MODE_LABELS[settings.wakeMode]} />
        </View>

        <Text testID="session-placeholder-message" style={styles.placeholder}>
          This is simulated monitoring only. Real sleep detection and alarm audio are not implemented yet.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Simulation</Text>
          <MetricRow
            label="Current simulated time"
            testID="session-simulation-time"
            value={currentClockTime ? formatClockTime(currentClockTime) : "Not started"}
          />
          <MetricRow
            label="Elapsed simulated time"
            testID="session-elapsed-time"
            value={`${elapsedSimulatedMinutes} min`}
          />
          <MetricRow
            label="Wake window"
            testID="session-wake-window-active"
            value={isWakeWindowActive ? "Active" : "Not active"}
          />
          <MetricRow
            label="Current sample"
            testID="session-sample-values"
            value={
              currentSample
                ? `motion ${currentSample.motionScore.toFixed(2)}, sound ${currentSample.soundScore.toFixed(2)}`
                : "Waiting for simulation"
            }
          />
          <Text style={styles.mutedText}>
            Simulation starts at {formatClockTime(plan.startClockTime)}. Wake window starts at{" "}
            {formatClockTime(plan.wakeWindowStartClockTime)}.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Wake engine debug</Text>
          <MetricRow label="Mode" testID="engine-current-mode" value={MODE_LABELS[settings.wakeMode]} />
          <MetricRow
            label="Raw wakeability"
            testID="engine-raw-wakeability"
            value={engineOutput.score ? engineOutput.score.rawWakeability.toFixed(2) : "Waiting"}
          />
          <MetricRow
            label="Wakeability"
            testID="engine-wakeability"
            value={engineOutput.score ? engineOutput.score.smoothedWakeability.toFixed(2) : "Waiting"}
          />
          <MetricRow
            label="Stability"
            testID="engine-stability"
            value={engineOutput.score ? engineOutput.score.stabilityScore.toFixed(2) : "Waiting"}
          />
          <MetricRow
            label="Timing pressure"
            testID="engine-timing-pressure"
            value={engineOutput.score ? engineOutput.score.timingPressure.toFixed(2) : "Waiting"}
          />
          <MetricRow
            label="Stable wake zone"
            testID="engine-stable-zone"
            value={engineOutput.stableWakeZoneActive ? "Active" : "Not active"}
          />
          <MetricRow
            label="Engine would trigger"
            testID="engine-trigger-decision"
            value={engineOutput.decision.shouldTrigger ? "Yes" : "No"}
          />
          <MetricRow
            label="Trigger reason"
            testID="engine-trigger-reason"
            value={engineOutput.decision.reasonCode ?? "None"}
          />
        </View>

        {isRunning ? (
          <Pressable
            accessibilityRole="button"
            onPress={stopSession}
            style={[styles.button, styles.stopButton]}
            testID="stop-session-button"
          >
            <Text style={styles.buttonText}>Stop Session</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={startSimulation}
            style={styles.button}
            testID="start-simulation-button"
          >
            <Text style={styles.buttonText}>Start Simulation</Text>
          </Pressable>
        )}
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
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary
  },
  statusPill: {
    alignSelf: "flex-start",
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  summaryCard: {
    gap: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  summaryTitle: {
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
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  placeholder: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center"
  },
  stopButton: {
    backgroundColor: colors.danger
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff"
  }
});
