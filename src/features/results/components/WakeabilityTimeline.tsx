import { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import type { WakeScore } from "../../../domain/models/WakeScore";
import { colors } from "../../../shared/theme";

type WakeabilityTimelineProps = {
  wakeScores: WakeScore[];
  triggerTimestampMs: number;
};

export function WakeabilityTimeline({ wakeScores, triggerTimestampMs }: WakeabilityTimelineProps) {
  const [timelineWidth, setTimelineWidth] = useState(0);
  const barLayout = useMemo(
    () => getBarLayout(timelineWidth, wakeScores.length),
    [timelineWidth, wakeScores.length]
  );
  const updateTimelineWidth = (event: LayoutChangeEvent) => {
    setTimelineWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wakeability timeline</Text>
      <View
        onLayout={updateTimelineWidth}
        style={styles.timeline}
        testID="result-wakeability-timeline"
      >
        {wakeScores.map((score) => {
          const isTriggerPoint = score.timestampMs === triggerTimestampMs;

          return (
            <View
              key={score.timestampMs}
              style={[
                styles.barSlot,
                {
                  marginRight:
                    score.timestampMs === wakeScores[wakeScores.length - 1]?.timestampMs
                      ? 0
                      : barLayout.gap,
                  width: barLayout.barWidth
                }
              ]}
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

function getBarLayout(timelineWidth: number, barCount: number) {
  if (timelineWidth <= 0 || barCount <= 0) {
    return {
      barWidth: 0,
      gap: 0
    };
  }

  const gap = barCount > 1 ? 4 : 0;
  const totalGapWidth = gap * (barCount - 1);
  const availableBarWidth = Math.max(0, timelineWidth - totalGapWidth);

  return {
    barWidth: availableBarWidth / barCount,
    gap
  };
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
    overflow: "hidden",
    width: "100%"
  },
  barSlot: {
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
