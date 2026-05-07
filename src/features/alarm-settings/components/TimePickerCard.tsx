import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ClockTime } from "../../../domain/models/ClockTime";
import { formatClockTime, shiftClockTimeByStep } from "../../../shared/utils/time";

type TimePickerCardProps = {
  value: ClockTime;
  onChange: (time: ClockTime) => void;
};

export function TimePickerCard({ value, onChange }: TimePickerCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Latest wake-up time</Text>
      <Text testID="latest-wake-time-value" style={styles.timeValue}>
        {formatClockTime(value)}
      </Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(shiftClockTimeByStep(value, "backward"))}
          style={styles.button}
          testID="latest-wake-time-decrement"
        >
          <Text style={styles.buttonText}>-15 min</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(shiftClockTimeByStep(value, "forward"))}
          style={styles.button}
          testID="latest-wake-time-increment"
        >
          <Text style={styles.buttonText}>+15 min</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#152238"
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0d3b66"
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#d9ecff",
    alignItems: "center"
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0d3b66"
  }
});
