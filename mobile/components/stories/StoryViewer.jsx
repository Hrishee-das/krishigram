import { useDeleteStory, useMarkStoryViewed } from "@/hooks/useStories";
import { useAuthStore } from "@/utils/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");
const STORY_DURATION = 5000;

const StoryVideo = ({ videoUrl, paused }) => {
    return (
        <Video
            source={{ uri: videoUrl }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={!paused}
            isLooping={false}
        />
    );
};

export default function StoryViewer({
  visible,
  groups = [],
  initialGroupIndex = 0,
  onClose,
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressRef = useRef(null);

  const { mutate: markViewed } = useMarkStoryViewed();
  const { mutate: deleteStory } = useDeleteStory();
  const currentUser = useAuthStore((s) => s.user);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories?.[storyIndex];
  const totalStories = currentGroup?.stories?.length ?? 0;
  const isOwn = currentGroup?.author?._id === currentUser?._id;

  // ... (navigation logic remains)

  // ── Reset when group/story changes ──────────────────────────
  useEffect(() => {
    if (!visible || !currentStory) return;
    markViewed(currentStory._id);
    startProgress();
    return () => stopProgress();
  }, [groupIndex, storyIndex, visible]);

  useEffect(() => {
    if (!visible) return;
    setGroupIndex(initialGroupIndex);
    setStoryIndex(0);
  }, [visible, initialGroupIndex]);

  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    progressRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    progressRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
  }, [groupIndex, storyIndex]);

  const stopProgress = useCallback(() => {
    progressRef.current?.stop();
  }, []);

  // ── Navigation ───────────────────────────────────────────────
  const goNext = () => {
    if (storyIndex < totalStories - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
    } else {
      onClose?.();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      setStoryIndex(0);
    }
  };

  const handleTapLeft = () => {
    stopProgress();
    goPrev();
  };

  const handleTapRight = () => {
    stopProgress();
    goNext();
  };

  const handleLongPress = () => {
    stopProgress();
    setPaused(true);
  };

  const handlePressOut = () => {
    if (paused) {
      setPaused(false);
      startProgress();
    }
  };

  const handleDelete = () => {
    deleteStory(currentStory._id, {
      onSuccess: () => {
        if (totalStories > 1) {
          goNext();
        } else {
          onClose?.();
        }
      },
    });
  };

  if (!visible || !currentStory) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.screen}>
        {/* ── Media ── */}
        {currentStory.mediaType === "image" ? (
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />
        ) : currentStory.mediaType === "video" ? (
          <StoryVideo videoUrl={currentStory.mediaUrl} paused={paused} />
        ) : (
          // Voice story fallback
          <View style={[styles.media, styles.voiceBg]}>
            <Ionicons name="mic" size={64} color="#fff" />
            {currentStory.caption ? (
              <Text style={styles.voiceCaption}>{currentStory.caption}</Text>
            ) : null}
          </View>
        )}

        {/* ── Dark overlay (top + bottom) ── */}
        <View style={styles.topOverlay} pointerEvents="none" />
        <View style={styles.bottomOverlay} pointerEvents="none" />

        {/* ── Tap zones ── */}
        <View style={styles.tapZones} pointerEvents="box-none">
          <TouchableWithoutFeedback
            onPress={handleTapLeft}
            onLongPress={handleLongPress}
            onPressOut={handlePressOut}
          >
            <View style={styles.tapLeft} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={handleTapRight}
            onLongPress={handleLongPress}
            onPressOut={handlePressOut}
          >
            <View style={styles.tapRight} />
          </TouchableWithoutFeedback>
        </View>

        {/* ── Progress bars ── */}
        <SafeAreaView style={styles.progressRow} pointerEvents="none">
          {currentGroup.stories.map((s, i) => (
            <View key={s._id} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < storyIndex
                        ? "100%"
                        : i === storyIndex
                          ? progressWidth
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </SafeAreaView>

        {/* ── Header ── */}
        <SafeAreaView style={styles.header} pointerEvents="box-none">
          <View style={styles.headerInner}>
            {/* Avatar */}
            {currentGroup.author?.profilePic ? (
              <Image
                source={{ uri: currentGroup.author.profilePic }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={[styles.headerAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {currentGroup.author?.name?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.authorName}>
                {currentGroup.author?.name ?? ""}
              </Text>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(currentStory.createdAt)}
              </Text>
            </View>
            {/* Actions */}
            {isOwn && (
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* ── Caption ── */}
        {currentStory.caption ? (
          <View style={styles.captionRow} pointerEvents="none">
            <Text style={styles.captionText}>{currentStory.caption}</Text>
          </View>
        ) : null}

        {/* ── Pause indicator ── */}
        {paused && (
          <View style={styles.pauseIndicator} pointerEvents="none">
            <Ionicons name="pause" size={40} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </View>
    </Modal>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  voiceBg: {
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  voiceCaption: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "transparent",
    // simulate gradient — use LinearGradient for real gradient
    background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  // ── Progress ──
  progressRow: {
    position: "absolute",
    top: 44,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 3,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  // ── Header ──
  header: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarFallback: {
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  authorName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeAgo: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 1,
  },
  iconBtn: {
    padding: 8,
  },
  // ── Caption ──
  captionRow: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
  },
  captionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  pauseIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
