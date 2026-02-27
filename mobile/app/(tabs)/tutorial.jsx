import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

import AppText from "../../components/AppText";
import Color from "../../constants/color";
import { getAllTutorials } from "../../services/tutorial";
import { useAuthStore } from "../../utils/authStore";

const { width } = Dimensions.get("window");

const TutorialVideo = ({ videoUrl }) => {
    return (
        <Video
            style={styles.video}
            source={{ uri: videoUrl }}
            useNativeControls
            resizeMode="contain"
            isLooping={false}
            shouldPlay={false}
        />
    );
};

export default function TutorialScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const isTutor = user?.role === "tutor" || user?.role === "admin"; // Check if admin as fallback
  
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTutorials = async () => {
    try {
      const response = await getAllTutorials();
      setTutorials(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching tutorials:", err);
      setError(t("failed_load_tutorials"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTutorials();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutorials();
  };

  const renderTutorialItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.tutorAvatar}>
            <AppText style={styles.tutorInitial}>
              {item.tutor?.name?.charAt(0) || "T"}
            </AppText>
          </View>
          <View>
            <AppText variant="h3" style={styles.title} numberOfLines={2}>
              {item.title}
            </AppText>
            <AppText variant="small" style={styles.tutorName}>
              {t('by')} {item.tutor?.name || t('unknown_tutor')} • @{item.tutor?.nameId || ""}
            </AppText>
          </View>
        </View>

        <View style={styles.videoContainer}>
          <TutorialVideo videoUrl={item.videoUrl} />
        </View>

        <View style={styles.footer}>
          <AppText variant="regular" style={styles.description}>
            {item.description}
          </AppText>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Color.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTutorials}>
            <AppText style={styles.retryText}>{t('retry')}</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tutorials}
          keyExtractor={(item) => item._id}
          renderItem={renderTutorialItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={64} color="#ccc" />
              <AppText style={styles.emptyText}>{t('no_tutorials')}</AppText>
            </View>
          }
        />
      )}

      {isTutor && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/upload-tutorial")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  tutorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tutorInitial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    color: "#2c3e50",
    maxWidth: width - 110,
  },
  tutorName: {
    color: "#7f8c8d",
    marginTop: 2,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  footer: {
    padding: 16,
  },
  description: {
    color: "#34495e",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Color.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: Color.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#95a5a6",
    marginTop: 16,
    fontSize: 16,
  }
});
