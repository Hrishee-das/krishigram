import { Ionicons } from "@expo/vector-icons";
import { Audio, ResizeMode, Video } from "expo-av";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import AppText from "../../components/AppText";
import Color from "../../constants/color";
import { useVoiceSearch } from "../../hooks/useVoiceSearch";
import { getAllTutorials, searchTutorialsWithAudio } from "../../services/tutorial";
import { useAuthStore } from "../../utils/authStore";

const { width, height } = Dimensions.get("window");

export default function TutorialScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isTutor = user?.role === "tutor" || user?.role === "admin";
  
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Voice Search states
  const { isRecording, startRecording, stopRecording, audioUri } = useVoiceSearch();
  const [isSearching, setIsSearching] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  // Pulse Animation for recording state
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const fetchTutorials = async () => {
    try {
      const response = await getAllTutorials();
      setTutorials(response.data || []);
      setError(null);
      // Fade in list
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    } catch (err) {
      console.error("Error fetching tutorials:", err);
      setError("Failed to load tutorials. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      fetchTutorials();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutorials(); // Re-fetch all to reset search
  };

  const handleVoiceSearch = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        setIsSearching(true);
        try {
          const response = await searchTutorialsWithAudio(uri);
          setTutorials(response.data || []);
          // Reset opacity for new results
          listOpacity.setValue(0);
          Animated.timing(listOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        } catch (err) {
          console.error("Voice search error:", err);
          // Fallback or show error
          setError("Failed to analyze voice search.");
        } finally {
          setIsSearching(false);
        }
      }
    } else {
      await startRecording();
    }
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
              By {item.tutor?.name || "Unknown"}
            </AppText>
          </View>
        </View>

        <View style={styles.videoContainer}>
          <Video
            source={{ uri: item.videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
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
    <View style={[styles.container, { backgroundColor: "#F6F8FD" }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
          <Text style={styles.searchText}>
            {isRecording ? "Listening to your problem..." : "Ask your farming questions..."}
          </Text>
          
          <TouchableOpacity 
            style={[styles.micButton, isRecording && styles.micButtonRecording]} 
            onPress={handleVoiceSearch}
            disabled={isSearching}
          >
            {isRecording && (
              <Animated.View style={[
                StyleSheet.absoluteFillObject, 
                styles.pulseRing, 
                { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.5],
                  outputRange: [0.6, 0]
                }) }
              ]} />
            )}
            {isSearching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={22} 
                color={isRecording ? "#fff" : Color.primary} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTutorials}>
            <AppText style={styles.retryText}>Retry & Show All</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={tutorials}
          keyExtractor={(item) => item._id}
          renderItem={renderTutorialItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={{ opacity: listOpacity }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Color.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={64} color="#ccc" />
              <AppText style={styles.emptyText}>No tutorials found.</AppText>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      {isTutor && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/upload-tutorial")}
          activeOpacity={0.8}
        >
          <View style={[styles.fabGradient, { backgroundColor: Color.primary }]}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FD"
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Glassmorphism base
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)"
  },
  searchIcon: {
    marginRight: 12,
  },
  searchText: {
    flex: 1,
    color: "#7f8c8d",
    fontSize: 16,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonRecording: {
    backgroundColor: "#e74c3c",
  },
  pulseRing: {
    borderRadius: 22,
    backgroundColor: "#e74c3c",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#2c3e50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tutorInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  title: {
    color: "#2c3e50",
    maxWidth: width - 120,
    fontSize: 18,
    fontFamily: "NotoSans-SemiBold", // Assuming this font is available per package.json
  },
  tutorName: {
    color: "#7f8c8d",
    marginTop: 4,
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
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 6,
    shadowColor: Color.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: Color.primary,
    borderRadius: 12,
    elevation: 2,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    color: "#95a5a6",
    marginTop: 16,
    fontSize: 16,
  }
});
