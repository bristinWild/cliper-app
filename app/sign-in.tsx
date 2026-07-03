import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithGitHub } from "../lib/auth";
import { useCliper } from "../lib/store";
import { colors, mono, radius } from "../lib/theme";

export default function SignIn() {
  const router = useRouter();
  const setSession = useCliper((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await signInWithGitHub();
      if (!session) {
        // User cancelled or backend didn't return a token — stay on screen.
        setLoading(false);
        return;
      }
      setSession(session);
      router.replace("/(tabs)/repositories");
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: "space-between", paddingBottom: 24 }}>
        <View style={{ flex: 1, justifyContent: "center", gap: 18 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={[mono, { color: "#FFF", fontSize: 24, fontWeight: "700" }]}>{">_"}</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: "800", letterSpacing: -0.5 }}>
              Cliper
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 16, lineHeight: 24 }}>
              Chat with your codebase.{"\n"}Run your coding agent from anywhere.
            </Text>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            {["Your laptop runs the agent", "Your phone steers it", "Code never leaves your machine"].map((line) => (
              <View key={line} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{line}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {error && (
            <Text style={{ color: colors.warning, fontSize: 13, textAlign: "center", lineHeight: 19 }}>
              {error}
            </Text>
          )}
          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#5B4DE0" : colors.accent,
              borderRadius: radius.lg,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            })}
          >
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
              {loading ? "Connecting…" : "Sign in with GitHub"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
