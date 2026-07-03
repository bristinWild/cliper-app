import React from "react";
import { Text, View } from "react-native";
import { colors, mono } from "../lib/theme";
import { Repository } from "../lib/types";
import { Card, Pill, ProgressBar, StatusDot } from "./ui";

export function RepoCard({ repo, onPress }: { repo: Repository; onPress: () => void }) {
  const agentLabel =
    repo.agentStatus === "online" ? "Agent online" : repo.agentStatus === "busy" ? "Agent busy" : "Agent offline";

  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[mono, { color: colors.text, fontSize: 17, fontWeight: "700" }]}>{repo.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <StatusDot status={repo.agentStatus} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{agentLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pill label={repo.language} tone="accent" />
        <Pill label={repo.framework} />
        <Pill
          label={repo.memoryStatus === "building" ? "Syncing…" : `Synced ${repo.lastSync}`}
          tone={repo.memoryStatus === "stale" ? "warning" : "neutral"}
        />
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.textFaint, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Memory coverage
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
            {Math.round(repo.memoryCoverage * 100)}%
          </Text>
        </View>
        <ProgressBar value={repo.memoryCoverage} />
      </View>
    </Card>
  );
}
