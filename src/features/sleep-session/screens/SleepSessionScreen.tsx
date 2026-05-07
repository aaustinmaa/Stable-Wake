import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { formatClockTime } from "../../../shared/utils/time";

type Props = NativeStackScreenProps<RootStackParamList, "SleepSession">;

const MODE_LABELS: Record<WakeMode, string> = {
  fast: "Fast",
  balanced: "Balanced",
  comfort: "Comfort"
};

export function SleepSessionScreen({ route }: Props) {
  const { settings } = route.params;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session Shell</Text>
      <Text style={styles.statusLabel}>Session status</Text>
      <Text testID="session-status-value" style={styles.statusValue}>
        Configured
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Selected settings</Text>
        <Text testID="session-latest-wake-time">Latest wake-up time: {formatClockTime(settings.latestWakeTime)}</Text>
        <Text testID="session-wake-window">Wake window: {settings.wakeWindowMinutes} min</Text>
        <Text testID="session-wake-mode">Wake mode: {MODE_LABELS[settings.wakeMode]}</Text>
      </View>

      <Text testID="session-placeholder-message" style={styles.placeholder}>
        Monitoring and wake engine are not implemented yet.
      </Text>
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
  placeholder: {
    fontSize: 16,
    lineHeight: 22,
    color: "#41566f"
  }
});
