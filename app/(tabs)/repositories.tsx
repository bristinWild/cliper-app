import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { RepoCard } from "../../components/RepoCard";
import { Card } from "../../components/ui";
import { useCliper } from "../../lib/store";
import { colors } from "../../lib/theme";

export default function Repositories() {
  const router = useRouter();
  const { repositories, reposLoading, reposError, fetchRepositories } = useCliper();

  useEffect(() => {
    void fetchRepositories();
  }, [fetchRepositories]);

  const onRefresh = useCallback(() => {
    void fetchRepositories();
  }, [fetchRepositories]);

  const initialLoad = reposLoading && repositories.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <FlatList
        data={repositories}
        keyExtractor={(r) => r.id}
        refreshing={reposLoading && repositories.length > 0}
        onRefresh={onRefresh}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10, gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 }}>
                Repositories
              </Text>
              {repositories.length > 0 && (
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {repositories.length} connected with cliper init
                </Text>
              )}
            </View>
            {reposError && (
              <Pressable onPress={onRefresh}>
                <View
                  style={{
                    backgroundColor: colors.warningSoft,
                    borderRadius: 14,
                    padding: 12,
                    gap: 2,
                  }}
                >
                  <Text style={{ color: colors.warning, fontSize: 13.5, fontWeight: "600" }}>
                    {reposError}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>Tap to retry</Text>
                </View>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          initialLoad ? <RepoListSkeleton /> : reposError ? null : <EmptyState />
        }
        renderItem={({ item }) => (
          <RepoCard repo={item} onPress={() => router.push(`/repository/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}

/** Simple skeleton cards for the initial load. */
function RepoListSkeleton() {
  return (
    <View style={{ gap: 14 }}>
      {[0, 1, 2].map((i) => (
        <Card key={i} style={{ gap: 12, opacity: 0.55 - i * 0.12 }}>
          <View style={{ width: "45%", height: 16, borderRadius: 6, backgroundColor: colors.cardRaised }} />
          <View style={{ width: "70%", height: 11, borderRadius: 6, backgroundColor: colors.cardRaised }} />
          <View style={{ width: "55%", height: 11, borderRadius: 6, backgroundColor: colors.cardRaised }} />
        </Card>
      ))}
    </View>
  );
}
