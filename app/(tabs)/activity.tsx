import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui";
import { useCliper } from "../../lib/store";
import { colors, mono } from "../../lib/theme";
import { ActivityItem } from "../../lib/types";

const kindGlyph: Record<ActivityItem["kind"], { glyph: string; color: string }> = {
  sync: { glyph: "⟳", color: colors.accent },
  agent: { glyph: "●", color: colors.success },
  task: { glyph: "✓", color: colors.success },
  push: { glyph: "↑", color: colors.accent },
  pr: { glyph: "⑂", color: colors.warning },
  issue: { glyph: "!", color: colors.warning },
};

function timeAgo(at: number) {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function Activity() {
  const activity = useCliper((s) => s.activity);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <FlatList
        data={activity}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 32 }}
        ListHeaderComponent={
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.4, marginBottom: 10 }}>
            Activity
          </Text>
        }
        renderItem={({ item }) => {
          const meta = kindGlyph[item.kind];
          return (
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  backgroundColor: colors.cardRaised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: meta.color, fontSize: 15 }}>{meta.glyph}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.text, fontSize: 14.5 }} numberOfLines={1}>
                  {item.message}
                </Text>
                <Text style={[mono, { color: colors.textFaint, fontSize: 11.5 }]}>
                  {item.repoName} · {timeAgo(item.at)}
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}
