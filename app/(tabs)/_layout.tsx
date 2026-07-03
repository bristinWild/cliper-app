import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { TabGlyph } from "../../components/ui";
import { colors } from "../../lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: "#0C0C0F",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabel: ({ color, children }) => (
          <Text style={{ color, fontSize: 11, fontWeight: "600", marginTop: 4 }}>{children}</Text>
        ),
      }}
    >
      <Tabs.Screen
        name="repositories"
        options={{
          title: "Repositories",
          tabBarIcon: ({ focused }) => <TabGlyph name="repos" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => <TabGlyph name="activity" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabGlyph name="profile" active={focused} />,
        }}
      />
    </Tabs>
  );
}
