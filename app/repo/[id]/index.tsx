import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Pill, ProgressBar, StatusDot } from "../../../components/ui";
import { useCliper } from "../../../lib/store";
import { colors, mono, radius } from "../../../lib/theme";

export default function RepoDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const repo = useCliper((s) => s.repositories.find((r) => r.id === id));
  const syncRepo = useCliper((s) => s.syncRepo);

  if (!repo) return null;

  const rows: [string, string][] = [
    ["GitHub", repo.githubUrl],
    ["Last commit", repo.lastCommit],
    ["Last sync", repo.memoryStatus === "building" ? "Syncing…" : repo.lastSync],
    ["Memory", repo.memoryStatus],
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>← Repositories</Text>
        </Pressable>

        <View style={{ gap: 8, marginTop: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[mono, { color: colors.text, fontSize: 26, fontWeight: "800" }]}>{repo.name}</Text>
            <StatusDot status={repo.agentStatus} />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pill label={repo.language} tone="accent" />
            <Pill label={repo.framework} />
            <Pill
              label={repo.agentStatus === "online" ? "Agent online" : repo.agentStatus === "busy" ? "Agent busy" : "Agent offline"}
              tone={repo.agentStatus === "offline" ? "neutral" : "success"}
            />
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
          <View style={{ gap: 6, marginTop: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.textFaint, fontSize: 13 }}>Memory coverage</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12.5, fontWeight: "600" }}>
                {Math.round(repo.memoryCoverage * 100)}%
              </Text>
            </View>
            <ProgressBar value={repo.memoryCoverage} />
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton
            label={repo.memoryStatus === "building" ? "Syncing…" : "Sync"}
            variant="ghost"
            onPress={() => syncRepo(repo.id)}
          />
          <ActionButton label="Chat" variant="primary" onPress={() => router.push(`/repo/${repo.id}/chat`)} />
          <ActionButton
            label="Run task"
            variant="ghost"
            onPress={() => router.push({ pathname: `/repo/${repo.id}/chat`, params: { mode: "Agent" } })}
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
