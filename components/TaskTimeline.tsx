import React from "react";
import { Text, View } from "react-native";
import { colors, mono } from "../lib/theme";
import { Task, TaskEventKind } from "../lib/types";

const kindMeta: Record<TaskEventKind, { glyph: string; color: string }> = {
  queued: { glyph: "◷", color: colors.textSecondary },
  planning: { glyph: "✦", color: colors.accent },
  searching: { glyph: "⌕", color: colors.accent },
  editing: { glyph: "✎", color: colors.accent },
  testing: { glyph: "▸", color: colors.warning },
  passed: { glyph: "✓", color: colors.success },
  commit: { glyph: "⑃", color: colors.accent },
  completed: { glyph: "●", color: colors.success },
  failed: { glyph: "✕", color: colors.danger },
};

export function TaskTimeline({ task }: { task: Task }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 2,
      }}
    >
      <Text style={{ color: colors.textFaint, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
        Agent · {task.status}
      </Text>
      <Text style={[mono, { color: colors.text, fontSize: 13, marginBottom: 10 }]}>{task.prompt}</Text>

      {task.events.map((ev, i) => {
        const meta = kindMeta[ev.kind];
        const last = i === task.events.length - 1;
        return (
          <View key={ev.id} style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ alignItems: "center", width: 18 }}>
              <Text style={{ color: meta.color, fontSize: 13, lineHeight: 18 }}>{meta.glyph}</Text>
              {!last && <View style={{ flex: 1, width: 1.5, backgroundColor: colors.border, marginVertical: 2 }} />}
            </View>
            <Text style={{ color: last ? colors.text : colors.textSecondary, fontSize: 14, paddingBottom: 14 }}>
              {ev.label}
            </Text>
          </View>
        );
      })}

      {task.status === "running" && (
        <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 2 }}>Streaming from your laptop…</Text>
      )}
    </View>
  );
}
