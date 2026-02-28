import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../utils/authStore';

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

const TutorialHeaderTitle = () => (
  <View style={styles.tutorialHeader}>
    <View style={styles.tutorialHeaderBadge}>
      <Text style={styles.tutorialHeaderBadgeText}>▶</Text>
    </View>
    <View>
      <Text style={styles.tutorialHeaderTitle}>Farm Tutorials</Text>
      <Text style={styles.tutorialHeaderSub}>Expert agri-guides</Text>
    </View>
  </View>
);

const TabsLayout = () => {
  const { logOut } = useAuthStore();
  const { t, i18n } = useTranslation();
  return (
    <Tabs
      key={i18n.language}
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
          title: t("app_name"),
          tabBarLabel: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Krishigram",
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
          tabBarLabel: t("tutorial"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
          headerTitle: () => <TutorialHeaderTitle />,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarLabel: t("profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={logOut} style={styles.headerLogoutBtn}>
              <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
            </TouchableOpacity>
          ),
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
  },
  /* ── Tutorial header ── */
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tutorialHeaderBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#60ba8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialHeaderBadgeText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 2,
  },
  tutorialHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2027',
    lineHeight: 19,
  },
  tutorialHeaderSub: {
    fontSize: 11,
    color: '#60ba8a',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerLogoutBtn: {
    marginRight: 14,
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
});

export default TabsLayout;
