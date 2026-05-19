import { StyleSheet, Text, View } from "react-native";

import type { WakeScore } from "../../../domain/models/WakeScore";
import { colors } from "../../../shared/theme";

type WakeabilityTimelineProps = {
  wakeScores: WakeScore[];
  triggerTimestampMs: number;
};

export function WakeabilityTimeline({ wakeScores, triggerTimestampMs }: WakeabilityTimelineProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wakeability timeline</Text>
      <View style={styles.timeline} testID="result-wakeability-timeline">
        {wakeScores.map((score) => {
          const isTriggerPoint = score.timestampMs === triggerTimestampMs;

          return (
            <View
              key={score.timestampMs}
              style={styles.barSlot}
              testID={`timeline-bar-${score.timestampMs}`}
            >
              <View
                style={[
                  styles.bar,
                  { height: Math.max(8, score.smoothedWakeability * 80) },
                  isTriggerPoint && styles.triggerBar
                ]}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.caption}>Each bar shows estimated wakeability from simulated samples.</Text>
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
  timeline: {
    height: 96,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6
  },
  barSlot: {
    flex: 1,
    minWidth: 8,
    justifyContent: "flex-end"
  },
  bar: {
    borderRadius: 4,
    backgroundColor: "#6aa7d8"
  },
  triggerBar: {
    backgroundColor: colors.primary
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  }
});
