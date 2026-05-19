import { StyleSheet, Text, View } from "react-native";

import type { ExplanationItem } from "../../../domain/models/ExplanationItem";
import { colors } from "../../../shared/theme";

type ExplanationListProps = {
  items: ExplanationItem[];
};

export function ExplanationList({ items }: ExplanationListProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Why it triggered</Text>
      {items.map((item) => (
        <View key={item.code} style={styles.item}>
          <Text testID={`result-explanation-title-${item.code}`} style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text testID={`result-explanation-description-${item.code}`} style={styles.itemDescription}>
            {item.description}
          </Text>
        </View>
      ))}
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
  item: {
    gap: 4
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  }
});
