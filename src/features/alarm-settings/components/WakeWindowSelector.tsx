import { Pressable, StyleSheet, Text, View } from "react-native";

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
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#152238"
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
    borderRadius: 10,
    backgroundColor: "#eef3f7",
    alignItems: "center"
  },
  optionSelected: {
    backgroundColor: "#0d3b66"
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#152238"
  },
  optionTextSelected: {
    color: "#ffffff"
  }
});

