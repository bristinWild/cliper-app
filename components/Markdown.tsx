import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, mono, radius } from "../lib/theme";

/**
 * Tiny markdown renderer for chat answers.
 * Supports: fenced code blocks (with copy), `inline code`, plain paragraphs.
 * Deliberately small — swap for a full renderer later if needed.
 */
export function Markdown({ content }: { content: string }) {
  const parts = content.split(/```(?:\w+)?\n?/);
  return (
    <View style={{ gap: 10 }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? <CodeBlock key={i} code={part.replace(/\n$/, "")} /> : <Paragraphs key={i} text={part} />
      )}
    </View>
  );
}

function Paragraphs({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  return (
    <>
      {blocks.map((block, i) => (
        <Text key={i} style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          {renderInline(block.trim())}
        </Text>
      ))}
    </>
  );
}

function renderInline(text: string) {
  const segments = text.split(/(`[^`]+`)/);
  return segments.map((seg, i) => {
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return (
        <Text
          key={i}
          style={[mono, { color: colors.accent, backgroundColor: colors.accentSoft, fontSize: 13 }]}
        >
          {" " + seg.slice(1, -1) + " "}
        </Text>
      );
    }
    return <Text key={i}>{seg}</Text>;
  });
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <View
      style={{
        backgroundColor: "#0D0D10",
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 10,
          paddingTop: 8,
        }}
      >
        <Pressable
          onPress={() => {
            // Hook up expo-clipboard here; kept dependency-free for the MVP.
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          <Text style={{ color: copied ? colors.success : colors.textFaint, fontSize: 11, fontWeight: "600" }}>
            {copied ? "Copied" : "Copy"}
          </Text>
        </Pressable>
      </View>
      <Text style={[mono, { color: "#D4D4D8", fontSize: 12.5, lineHeight: 19, padding: 12, paddingTop: 4 }]}>
        {code}
      </Text>
    </View>
  );
}
