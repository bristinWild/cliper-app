import React from "react";
import { Text, View } from "react-native";
import { colors, mono, radius } from "../lib/theme";

/** Terminal-styled empty state — the CLI is the product's front door. */
export function EmptyState() {
  return (
    <View style={{ alignItems: "center", paddingTop: 48, paddingHorizontal: 24, gap: 20 }}>
      <View
        style={{
          width: "100%",
          backgroundColor: "#0D0D10",
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
          {[colors.danger, colors.warning, colors.success].map((c) => (
            <View key={c} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c, opacity: 0.85 }} />
          ))}
        </View>
        <Text style={[mono, { color: colors.textSecondary, fontSize: 13 }]}>
          <Text style={{ color: colors.accent }}>$ </Text>cliper init
        </Text>
        <Text style={[mono, { color: colors.textFaint, fontSize: 13 }]}>▌</Text>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>No repositories connected yet</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 21 }}>
          Run <Text style={[mono, { color: colors.accent }]}>cliper init</Text> inside a Git repository to
          connect it to Cliper, then pull to refresh.
        </Text>
      </View>
    </View>
  );
}
