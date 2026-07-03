import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View, ViewStyle } from "react-native";
import { colors, mono, radius } from "../lib/theme";
import { AgentStatus } from "../lib/types";

/** Soft pulsing status dot — the "agent pulse". */
export function StatusDot({ status }: { status: AgentStatus }) {
  const scale = useRef(new Animated.Value(1)).current;
  const live = status !== "offline";

  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.9, duration: 1100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [live, scale]);

  const color =
    status === "online" ? colors.success : status === "busy" ? colors.warning : colors.textFaint;

  return (
    <View style={{ width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
      {live && (
        <Animated.View
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            opacity: 0.25,
            transform: [{ scale }],
          }}
        />
      )}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const bg =
    tone === "accent"
      ? colors.accentSoft
      : tone === "success"
      ? colors.successSoft
      : tone === "warning"
      ? colors.warningSoft
      : colors.cardRaised;
  const fg =
    tone === "accent"
      ? colors.accent
      : tone === "success"
      ? colors.success
      : tone === "warning"
      ? colors.warning
      : colors.textSecondary;
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: fg, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, tint = colors.accent }: { value: number; tint?: string }) {
  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.cardRaised,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`,
          height: "100%",
          borderRadius: 3,
          backgroundColor: tint,
        }}
      />
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        base,
        style,
        pressed && { backgroundColor: colors.cardRaised, transform: [{ scale: 0.985 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function MonoText({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <Text style={[mono, { color: dim ? colors.textSecondary : colors.text, fontSize: 13 }]}>
      {children}
    </Text>
  );
}

/** Minimal geometric tab icons built from Views (no icon libs, no SVG). */
export function TabGlyph({ name, active }: { name: "repos" | "activity" | "profile"; active: boolean }) {
  const c = active ? colors.accent : colors.textFaint;
  if (name === "repos") {
    return (
      <View style={{ width: 20, height: 20, justifyContent: "space-between" }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              height: 4.5,
              borderRadius: 2.5,
              backgroundColor: c,
              width: i === 1 ? 14 : 20,
              opacity: active ? 1 : 0.9,
            }}
          />
        ))}
      </View>
    );
  }
  if (name === "activity") {
    return (
      <View style={{ width: 20, height: 20, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        {[10, 20, 14].map((h, i) => (
          <View key={i} style={{ width: 4.5, height: h, borderRadius: 2.5, backgroundColor: c }} />
        ))}
      </View>
    );
  }
  return (
    <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c }} />
      <View style={{ width: 18, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: c }} />
    </View>
  );
}
