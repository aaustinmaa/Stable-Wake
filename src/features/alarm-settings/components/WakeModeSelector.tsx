import { Pressable, StyleSheet, Text, View } from "react-native";

import type { WakeMode } from "../../../domain/models/WakeMode";

const MODE_OPTIONS: Array<{ label: string; value: WakeMode }> = [
  { label: "Fast", value: "fast" },
  { label: "Balanced", value: "balanced" },
  { label: "Comfort", value: "comfort" }
];

type WakeModeSelectorProps = {
  value: WakeMode;
  onChange: (mode: WakeMode) => void;
};

export function WakeModeSelector({ value, onChange }: WakeModeSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wake mode</Text>
      <View style={styles.optionList}>
        {MODE_OPTIONS.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
              testID={`wake-mode-option-${option.value}`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
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
  optionList: {
    gap: 10
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#eef3f7"
  },
  optionSelected: {
    backgroundColor: "#0d3b66"
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#152238"
  },
  optionTextSelected: {
    color: "#ffffff"
  }
});
