import React from "react";
import { Text, View } from "react-native";
import { statusMeta, timeAgo } from "../lib/format";
import { colors, mono } from "../lib/theme";
import { Repository } from "../lib/types";
import { Card, Pill } from "./ui";

export function RepoCard({ repo, onPress }: { repo: Repository; onPress: () => void }) {
  const status = statusMeta(repo.status);

  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={[mono, { color: colors.text, fontSize: 17, fontWeight: "700", flexShrink: 1 }]} numberOfLines={1}>
          {repo.name}
        </Text>
        <Pill label={status.label} tone={status.tone} />
      </View>

      <Text style={[mono, { color: colors.textSecondary, fontSize: 12.5 }]} numberOfLines={1}>
        {repo.github_owner}/{repo.github_repo}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <BranchGlyph />
          <Text style={[mono, { color: colors.textSecondary, fontSize: 12 }]}>{repo.branch}</Text>
        </View>
        <Text style={{ color: colors.textFaint, fontSize: 12 }}>Updated {timeAgo(repo.updated_at)}</Text>
      </View>
    </Card>
  );
}

/** Tiny git-branch glyph built from Views. */
function BranchGlyph() {
  return (
    <View style={{ width: 12, height: 14, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Dot />
        <Dot />
      </View>
      <View style={{ alignSelf: "flex-start", marginLeft: 2.5, width: 1.5, height: 5, backgroundColor: colors.textFaint }} />
      <Dot />
    </View>
  );
}

function Dot() {
  return <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.textFaint }} />;
}
