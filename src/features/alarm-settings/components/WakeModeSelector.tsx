import { Pressable, StyleSheet, Text, View } from "react-native";

import type { WakeMode } from "../../../domain/models/WakeMode";
import { colors } from "../../../shared/theme";

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
  optionList: {
    gap: 10
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: colors.border
  },
  optionSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text
  },
  optionTextSelected: {
    color: "#ffffff"
  }
});
