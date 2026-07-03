import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { restoreSession } from "../lib/auth";
import { useCliper } from "../lib/store";
import { colors, mono } from "../lib/theme";

/**
 * Launch gate: try to restore a stored JWT session,
 * then route to tabs or sign-in.
 */
export default function Index() {
  const router = useRouter();
  const setSession = useCliper((s) => s.setSession);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await restoreSession();
      if (cancelled) return;
      if (session) {
        setSession(session);
        router.replace("/(tabs)/repositories");
      } else {
        router.replace("/sign-in");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, setSession]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={[mono, { color: colors.textFaint, fontSize: 14 }]}>{">_"} cliper</Text>
    </View>
  );
}
