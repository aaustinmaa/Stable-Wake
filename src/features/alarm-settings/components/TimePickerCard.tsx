import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { ClockTime } from "../../../domain/models/ClockTime";
import { formatClockTime } from "../../../shared/utils/time";
import { colors } from "../../../shared/theme";

type TimePickerCardProps = {
  value: ClockTime;
  onChange: (time: ClockTime) => void;
};

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);
const WHEEL_ROW_HEIGHT = 40;

export function TimePickerCard({ value, onChange }: TimePickerCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Latest wake-up time</Text>
      <Text testID="latest-wake-time-value" style={styles.timeValue}>
        {formatClockTime(value)}
      </Text>
      <View style={styles.wheelFrame}>
        <TimeWheel
          accessibilityLabel="Hour picker"
          selectedValue={value.hour}
          testID="hour-wheel"
          values={HOURS}
          onSelect={(hour) => onChange({ ...value, hour })}
        />
        <Text style={styles.separator}>:</Text>
        <TimeWheel
          accessibilityLabel="Minute picker"
          selectedValue={value.minute}
          testID="minute-wheel"
          values={MINUTES}
          onSelect={(minute) => onChange({ ...value, minute })}
        />
      </View>
    </View>
  );
}

type TimeWheelProps = {
  accessibilityLabel: string;
  selectedValue: number;
  testID: string;
  values: number[];
  onSelect: (value: number) => void;
};

function TimeWheel({ accessibilityLabel, selectedValue, testID, values, onSelect }: TimeWheelProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const selectedIndex = values.indexOf(selectedValue);

    if (selectedIndex >= 0) {
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * WHEEL_ROW_HEIGHT,
        animated: false
      });
    }
  }, [selectedValue, values]);

  return (
    <ScrollView
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={styles.wheelContent}
      decelerationRate="fast"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ROW_HEIGHT}
      style={styles.wheel}
      testID={testID}
      ref={scrollViewRef}
      onMomentumScrollEnd={(event) => {
        const index = Math.round(event.nativeEvent.contentOffset.y / WHEEL_ROW_HEIGHT);
        const nextValue = values[Math.max(0, Math.min(values.length - 1, index))];

        onSelect(nextValue);
      }}
    >
      {values.map((wheelValue) => {
        const selected = wheelValue === selectedValue;
        const formatted = String(wheelValue).padStart(2, "0");

        return (
          <Pressable
            accessibilityRole="button"
            key={wheelValue}
            onPress={() => onSelect(wheelValue)}
            style={[styles.wheelRow, selected && styles.wheelRowSelected]}
            testID={`${testID}-option-${formatted}`}
          >
            <Text style={[styles.wheelText, selected && styles.wheelTextSelected]}>{formatted}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
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
  timeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary
  },
  wheelFrame: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8
  },
  wheel: {
    width: 92,
    height: 160,
    borderRadius: 8,
    backgroundColor: "#f7fafc"
  },
  wheelContent: {
    paddingVertical: 60
  },
  wheelRow: {
    height: WHEEL_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  wheelRowSelected: {
    backgroundColor: colors.primarySoft
  },
  wheelText: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.muted
  },
  wheelTextSelected: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary
  },
  separator: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary
  }
});
