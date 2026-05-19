import { StyleSheet, Text, View } from "react-native";

import type { SessionResultSummary } from "../../../domain/models/SessionResultSummary";
import type { WakeMode } from "../../../domain/models/WakeMode";
import { formatClockTime } from "../../../shared/utils/time";
import { colors } from "../../../shared/theme";

const MODE_LABELS: Record<WakeMode, string> = {
  fast: "Fast",
  balanced: "Balanced",
  comfort: "Comfort"
};

const REASON_LABELS: Record<SessionResultSummary["reasonCode"], string> = {
  stable_zone: "Stable wake zone",
  drop_protection: "Opportunity degrading",
  latest_fallback: "Latest wake fallback"
};

type RecentSessionsCardProps = {
  summaries: SessionResultSummary[];
};

export function RecentSessionsCard({ summaries }: RecentSessionsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recent simulated sessions</Text>
      {summaries.length === 0 ? (
        <Text style={styles.emptyText} testID="recent-sessions-empty">
          No recent sessions yet.
        </Text>
      ) : (
        summaries.slice(0, 5).map((summary) => (
          <View key={summary.id} style={styles.summaryRow} testID={`recent-session-${summary.id}`}>
            <Text style={styles.summaryTitle}>
              {MODE_LABELS[summary.wakeMode]} · {REASON_LABELS[summary.reasonCode]}
            </Text>
            <Text style={styles.summaryText}>
              Latest {formatClockTime(summary.latestWakeTime)} · window {summary.wakeWindowMinutes} min
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
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
  emptyText: {
    fontSize: 14,
    color: colors.muted
  },
  summaryRow: {
    gap: 3,
    paddingVertical: 4
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text
  },
  summaryText: {
    fontSize: 13,
    color: colors.muted
  }
});

