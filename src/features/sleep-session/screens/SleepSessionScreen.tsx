import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import type { SessionStatus } from "../../../domain/models/SessionStatus";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { useSleepSession } from "../hooks/useSleepSession";
import { formatClockTime } from "../../../shared/utils/time";

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

export function SleepSessionScreen({ route }: Props) {
  const { settings } = route.params;
  const {
    status,
    currentSample,
    currentClockTime,
    plan,
    isWakeWindowActive,
    startSimulation,
    stopSession
  } = useSleepSession(settings);
  const isRunning = status === "monitoring" || status === "wake_window_active";

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session Shell</Text>
      <Text style={styles.statusLabel}>Session status</Text>
      <Text testID="session-status-value" style={styles.statusValue}>
        {STATUS_LABELS[status]}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Selected settings</Text>
        <Text testID="session-latest-wake-time">Latest wake-up time: {formatClockTime(settings.latestWakeTime)}</Text>
        <Text testID="session-wake-window">Wake window: {settings.wakeWindowMinutes} min</Text>
        <Text testID="session-wake-mode">Wake mode: {MODE_LABELS[settings.wakeMode]}</Text>
      </View>

      <Text testID="session-placeholder-message" style={styles.placeholder}>
        Monitoring and wake engine are not implemented yet. This is simulated monitoring only.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Simulation</Text>
        <Text testID="session-simulation-time">
          Current simulated time: {currentClockTime ? formatClockTime(currentClockTime) : "Not started"}
        </Text>
        <Text testID="session-elapsed-time">
          Elapsed simulated time: {currentSample ? `${currentSample.simulatedMinute} min` : "0 min"}
        </Text>
        <Text testID="session-wake-window-active">
          Wake window: {isWakeWindowActive ? "Active" : "Not active"}
        </Text>
        <Text testID="session-sample-values">
          Current sample:{" "}
          {currentSample
            ? `motion ${currentSample.motionScore.toFixed(2)}, sound ${currentSample.soundScore.toFixed(2)}`
            : "Waiting for simulation"}
        </Text>
        <Text style={styles.mutedText}>
          Simulation starts at {formatClockTime(plan.startClockTime)}. Wake window starts at{" "}
          {formatClockTime(plan.wakeWindowStartClockTime)}.
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
    padding: 20,
    backgroundColor: "#f3f7fb"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#152238"
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#41566f"
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0d3b66"
  },
  summaryCard: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#152238"
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#61758f"
  },
  placeholder: {
    fontSize: 16,
    lineHeight: 22,
    color: "#41566f"
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#0d3b66",
    alignItems: "center"
  },
  stopButton: {
    backgroundColor: "#8f2d2d"
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff"
  }
});
