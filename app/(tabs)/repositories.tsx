import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { RepoCard } from "../../components/RepoCard";
import { useCliper } from "../../lib/store";
import { colors } from "../../lib/theme";

export default function Repositories() {
  const router = useRouter();
  const repositories = useCliper((s) => s.repositories);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900); // GET /repositories
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <FlatList
        data={repositories}
        keyExtractor={(r) => r.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10, gap: 4 }}>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 }}>
              Repositories
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {repositories.length} synced from your laptop
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <RepoCard repo={item} onPress={() => router.push(`/repo/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}
