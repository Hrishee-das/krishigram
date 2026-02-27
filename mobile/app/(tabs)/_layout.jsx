import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          tabBarLabel: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Krisheegram",
          tabBarLabel: t("post"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="ask" 
        options={{ 
          title: t("ask_ai"),
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
          title: t("tutorial"),
          tabBarLabel: t("tutorial"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t("profile"),
          tabBarLabel: t("profile"),
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
