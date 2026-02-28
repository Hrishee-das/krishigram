import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef(null);

  const fetchTutorials = async (query = "") => {
    try {
      const response = await getAllTutorials(query);
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
      fetchTutorials("");
    }, [])
  );

  // Debounce search: wait 500ms after typing stops before searching
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTutorials(searchQuery);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutorials(searchQuery);
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

  /* ── Hero banner shown above list ── */
  const ListHeader = () => (
    <View style={styles.heroBanner}>
      <View style={styles.heroTextBlock}>
        <AppText style={styles.heroEyebrow}>🌾 KRISHIGRAM</AppText>
        <AppText style={styles.heroTitle}>Farm Tutorials</AppText>
        <AppText style={styles.heroSub}>Learn from expert tutors — at your own pace</AppText>
      </View>
      <Ionicons name="play-circle" size={58} color="rgba(255,255,255,0.2)" />
    </View>
  );

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
        <>
          {/* ── Search Bar ── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#7f8c8d" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tutorials..."
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={tutorials}
            keyExtractor={(item) => item._id}
            renderItem={renderTutorialItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={!searchQuery ? <ListHeader /> : null}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="videocam-outline" size={64} color="#ccc" />
                <AppText style={styles.emptyText}>
                  {searchQuery ? `No tutorials found for "${searchQuery}"` : t('no_tutorials')}
                </AppText>
              </View>
            }
          />
        </>
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
    paddingBottom: 100,
  },
  /* ── Hero banner ── */
  heroBanner: {
    borderRadius: 18,
    backgroundColor: Color.primary,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  heroTextBlock: { flex: 1, paddingRight: 8 },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },
  heroSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 17,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "#F5F7FA",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2c3e50",
    fontWeight: "400",
    paddingVertical: 0,
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
