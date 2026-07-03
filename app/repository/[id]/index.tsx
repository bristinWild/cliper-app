import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Pill } from "../../../components/ui";
import { statusMeta, timeAgo } from "../../../lib/format";
import { useCliper } from "../../../lib/store";
import { colors, mono, radius } from "../../../lib/theme";

export default function RepoDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const repo = useCliper((s) => s.repositories.find((r) => r.id === id));

  if (!repo) {
    // e.g. deep link after the list was cleared — send the user back to the list.
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ color: colors.textSecondary }}>Repository not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.accent, fontWeight: "600" }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const status = statusMeta(repo.status);
  const rows: [string, string][] = [
    ["GitHub", `${repo.github_owner}/${repo.github_repo}`],
    ["Branch", repo.branch],
    ["Dataset", repo.cognee_dataset],
    ["Updated", timeAgo(repo.updated_at)],
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>← Repositories</Text>
        </Pressable>

        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={[mono, { color: colors.text, fontSize: 26, fontWeight: "800" }]} numberOfLines={1}>
            {repo.name}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pill label={status.label} tone={status.tone} />
            <Pill label={repo.branch} tone="accent" />
          </View>
        </View>

        <Card style={{ gap: 12 }}>
          {rows.map(([label, value]) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ color: colors.textFaint, fontSize: 13 }}>{label}</Text>
              <Text style={[mono, { color: colors.textSecondary, fontSize: 12.5, flexShrink: 1 }]} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton label="Chat" variant="primary" onPress={() => router.push(`/repository/${repo.id}/chat`)} />
          <ActionButton
            label="Run task"
            variant="ghost"
            onPress={() => router.push({ pathname: `/repository/${repo.id}/chat`, params: { mode: "Agent" } })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: "primary" | "ghost";
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: radius.lg,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: primary ? (pressed ? "#5B4DE0" : colors.accent) : pressed ? colors.cardRaised : colors.card,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.border,
      })}
    >
      <Text style={{ color: primary ? "#FFF" : colors.text, fontSize: 14.5, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
