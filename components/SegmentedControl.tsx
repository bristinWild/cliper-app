import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radius } from "../lib/theme";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: radius.pill,
              backgroundColor: active ? colors.accent : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: active ? "#FFFFFF" : colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
