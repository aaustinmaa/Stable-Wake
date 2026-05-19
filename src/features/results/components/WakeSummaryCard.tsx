import { StyleSheet, Text, View } from "react-native";

import type { SessionResult } from "../../../domain/models/SessionResult";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { formatClockTime } from "../../../shared/utils/time";
import { colors } from "../../../shared/theme";

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

type WakeSummaryCardProps = {
  result: SessionResult;
};

export function WakeSummaryCard({ result }: WakeSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Alarm would trigger</Text>
      <Text testID="result-trigger-time" style={styles.triggerTime}>
        {formatTriggerMinute(result.triggerTimestampMs)}
      </Text>
      <Text testID="result-reason-code">
        Trigger reason: {REASON_LABELS[result.reasonCode]} ({result.reasonCode})
      </Text>
      <Text testID="result-wake-mode">Wake mode: {MODE_LABELS[result.wakeMode]}</Text>
      <Text testID="result-latest-wake-time">
        Latest wake time: {formatClockTime(result.latestWakeTime)}
      </Text>
      <Text testID="result-wake-window">Wake window: {result.wakeWindowMinutes} min</Text>
    </View>
  );
}

function formatTriggerMinute(timestampMs: number): string {
  return `${Math.round(timestampMs / 60000)} min into simulation`;
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  triggerTime: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary
  }
});
