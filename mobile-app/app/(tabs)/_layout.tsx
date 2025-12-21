import { Tabs } from "expo-router";
import { Book, FolderSync, GraduationCapIcon } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => <GraduationCapIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: "Sync",
          tabBarIcon: ({ color, size }) => <FolderSync color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
