import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui";
import { useCliper } from "../../lib/store";
import { colors, mono, radius } from "../../lib/theme";

export default function Profile() {
  const router = useRouter();
  const { user, repositories, signOut } = useCliper();
  const readyCount = repositories.filter((r) => r.status.toLowerCase() === "ready").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 }}>
          Profile
        </Text>

        <Card style={{ alignItems: "center", gap: 10, paddingVertical: 26 }}>
          <Image
            source={{ uri: user?.avatarUrl }}
            style={{ width: 76, height: 76, borderRadius: 26, backgroundColor: colors.cardRaised }}
          />
          <Text style={[mono, { color: colors.text, fontSize: 17, fontWeight: "700" }]}>
            @{user?.username ?? "developer"}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Signed in with GitHub</Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 14 }}>
          <Card style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.accent, fontSize: 26, fontWeight: "800" }}>{repositories.length}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>Repositories</Text>
          </Card>
          <Card style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.success, fontSize: 26, fontWeight: "800" }}>{readyCount}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>Ready to chat</Text>
          </Card>
        </View>

        <Pressable
          onPress={() => {
            signOut();
            router.replace("/sign-in");
          }}
          style={({ pressed }) => ({
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: pressed ? colors.card : "transparent",
            paddingVertical: 15,
            alignItems: "center",
            marginTop: 6,
          })}
        >
          <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "600" }}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
