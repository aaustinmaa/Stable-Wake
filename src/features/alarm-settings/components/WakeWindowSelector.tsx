import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../shared/theme";

type WakeWindowSelectorProps = {
  options: readonly number[];
  value: number;
  onChange: (minutes: number) => void;
};

export function WakeWindowSelector({ options, value, onChange }: WakeWindowSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wake window</Text>
      <View style={styles.optionList}>
        {options.map((minutes) => {
          const selected = value === minutes;

          return (
            <Pressable
              key={minutes}
              accessibilityRole="button"
              onPress={() => onChange(minutes)}
              style={[styles.option, selected && styles.optionSelected]}
              testID={`wake-window-option-${minutes}`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {minutes} min
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  option: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center"
  },
  optionSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text
  },
  optionTextSelected: {
    color: "#ffffff"
  }
});
