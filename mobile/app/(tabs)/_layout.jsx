import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.customTabBarButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.customTabBarButtonInner}>
      {children}
    </View>
  </TouchableOpacity>
);

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Keep the original KrishiGram header shown
        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 100, // Original KrishiGram height
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Krisheegram",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Krisheegram", // Keep original title
          tabBarLabel: "Post", // Keep original label
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="ask" 
        options={{ 
          title: "Ask Question", // Need to keep the original header title since user asked to not change names? Wait, they said "instead of plant detection, make that middle one for universalAI as AIAssistant". I will use floating button.
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
             <MaterialCommunityIcons name="robot-outline" size={32} color="#FFF" />
          ),
          tabBarButton: (props) => (<CustomTabBarButton {...props} />),
        }} 
      />
      <Tabs.Screen 
        name="tutorial" 
        options={{ 
          title: "Video Tutorial", // Original name
          tabBarLabel: "Tutorial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profile", // Original name
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          )
        }} 
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  customTabBarButton: {
    top: -25, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#2E7D32", // theme.primaryDark equivalent
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  customTabBarButtonInner: {
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    backgroundColor: "#60ba8a", // theme.primary equivalent
    justifyContent: 'center', 
    alignItems: 'center'
  }
});

export default TabsLayout;
