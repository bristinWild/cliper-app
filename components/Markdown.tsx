import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, mono, radius } from "../lib/theme";

/**
 * Small markdown renderer for chat answers.
 * Handles: fenced code blocks (+copy), `inline code`, **bold**,
 * # headings, numbered lists, and - bullet lists.
 */
export function Markdown({ content }: { content: string }) {
  const parts = content.split(/```(?:\w+)?\n?/);
  return (
    <View style={{ gap: 10 }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? <CodeBlock key={i} code={part.replace(/\n$/, "")} /> : <Blocks key={i} text={part} />
      )}
    </View>
  );
}

function Blocks({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block.trim()} />
      ))}
    </>
  );
}

function Block({ block }: { block: string }) {
  const lines = block.split("\n");
  const isList = lines.every((l) => /^(\d+[.)]\s|[-*•]\s|#{1,4}\s)/.test(l.trim()) || l.trim() === "");

  // Mixed prose block — render as one paragraph.
  if (!isList) {
    // A heading followed by prose in the same block still deserves styling.
    if (/^#{1,4}\s/.test(lines[0])) {
      return (
        <View style={{ gap: 6 }}>
          <Heading line={lines[0]} />
          {lines.length > 1 && <Paragraph text={lines.slice(1).join("\n")} />}
        </View>
      );
    }
    return <Paragraph text={block} />;
  }

  // Pure list/heading block — render line by line.
  return (
    <View style={{ gap: 6 }}>
      {lines
        .filter((l) => l.trim().length > 0)
        .map((line, i) => {
          const trimmed = line.trim();
          if (/^#{1,4}\s/.test(trimmed)) return <Heading key={i} line={trimmed} />;

          const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
          if (numbered) return <ListItem key={i} marker={`${numbered[1]}.`} text={numbered[2]} />;

          const bulleted = trimmed.match(/^[-*•]\s+(.*)$/);
          if (bulleted) return <ListItem key={i} marker="•" text={bulleted[1]} />;

          return <Paragraph key={i} text={trimmed} />;
        })}
    </View>
  );
}

function Heading({ line }: { line: string }) {
  const text = line.replace(/^#{1,4}\s+/, "");
  return (
    <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 2 }}>
      {renderInline(text)}
    </Text>
  );
}

function ListItem({ marker, text }: { marker: string; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
      <Text style={{ color: colors.accent, fontSize: 14.5, lineHeight: 21, minWidth: 18 }}>{marker}</Text>
      <Text style={{ color: colors.text, fontSize: 14.5, lineHeight: 21, flex: 1 }}>
        {renderInline(text)}
      </Text>
    </View>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <Text style={{ color: colors.text, fontSize: 14.5, lineHeight: 21 }}>{renderInline(text)}</Text>
  );
}

/** Inline: `code` and **bold** (also handles bold containing code). */
function renderInline(text: string): React.ReactNode[] {
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return (
        <Text
          key={i}
          style={[mono, { color: colors.accent, backgroundColor: colors.accentSoft, fontSize: 12.5 }]}
        >
          {" " + seg.slice(1, -1) + " "}
        </Text>
      );
    }
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <Text key={i} style={{ fontWeight: "700", color: colors.text }}>
          {seg.slice(2, -2)}
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
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 10, paddingTop: 8 }}>
        <Pressable
          onPress={() => {
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
