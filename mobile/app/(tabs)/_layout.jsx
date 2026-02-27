import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#60ba8a" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 100,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Krisheegram",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Krisheegram",
          tabBarLabel: "Post",
        }}
      />
      <Tabs.Screen name="ask" options={{ title: "Ask Question" }} />
      <Tabs.Screen name="tutorial" options={{ title: "Video Tutorial" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default TabsLayout;
