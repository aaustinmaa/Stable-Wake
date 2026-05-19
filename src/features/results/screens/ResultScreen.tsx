import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../../app/navigation/routeTypes";
import { ExplanationList } from "../components/ExplanationList";
import { WakeabilityTimeline } from "../components/WakeabilityTimeline";
import { WakeSummaryCard } from "../components/WakeSummaryCard";
import { colors, spacing } from "../../../shared/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

export function ResultScreen({ route }: Props) {
  const { result } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView alwaysBounceVertical contentContainerStyle={styles.content}>
        <Text style={styles.title}>Session Result</Text>
        <Text style={styles.subtitle}>
          StableWake estimated a wakeable moment from simulated samples. This is not medical sleep staging.
        </Text>
        <WakeSummaryCard result={result} />
        <ExplanationList items={result.explanationItems} />
        <WakeabilityTimeline
          wakeScores={result.wakeScores}
          triggerTimestampMs={result.triggerTimestampMs}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    gap: spacing.gap,
    padding: spacing.screen,
    paddingBottom: 32
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  }
});
