import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../components/AppText";
import Color from "../constants/color";
import { createPost } from "../services/post.api";
import { createStory } from "../services/story.api";

export default function CreatePostModal() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  
  // Audio state
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loading, setLoading] = useState(false);

  // Toggle state
  const [postType, setPostType] = useState("post");

  // User details placeholder
  const myName = "John Doe";
  const myProfilePic = "https://via.placeholder.com/150";

  // Hide the standard tab header to give a full-screen modal feel
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Handle auto-focusing via routing params
  useEffect(() => {
    if (params?.focusMedia && !image) pickImage();
    if (params?.focusTag || params?.focusLocation) {
      // Implement logic for opening these pickers later
    }
  }, [params]);

  const isPostDisabled = description.trim() === "" && !image && !audioUri;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      // Clear audio if image selected
      if (audioUri) clearAudio();
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      // Clear image if recording
      if (image) setImage(null);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Permission Error", "Please grant microphone permissions to record audio.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    setRecording(undefined);
    setAudioUri(uri);
  };

  const playAudioPreview = async () => {
    if (!audioUri) return;
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        });
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error playing audio', error);
    }
  };

  const clearAudio = () => {
    setAudioUri(null);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleSubmit = async () => {
    if (isPostDisabled) return;

    if (postType === "successStory" && !image) {
      Alert.alert("Error", "Success Story requires an image");
      return;
    }

    try {
      setLoading(true);

      if (postType === "successStory") {
        // Create a story instead of a post
        const fileExt = image.uri.split(".").pop() || "jpg";
        const fileType = image.type === "video" ? "mp4" : fileExt;

        await createStory({
          fileUri: image.uri,
          fileType: fileType,
          mimeType: image.mimeType || "image/jpeg",
          caption: description,
          language: "en",
        });
      } else {
        // Create a standard post
        const derivedTitle =
          description.length > 30
            ? description.substring(0, 27) + "..."
            : description || "My Post";

        let mediaPayload = image;
        let pType = postType;

        if (audioUri) {
          mediaPayload = {
            uri: audioUri,
            name: "audio_post.m4a",
            mimeType: "audio/m4a"
          };
          pType = "audio";
        }

        await createPost({
          title: derivedTitle,
          description,
          location: "",
          postType: pType,
          mediaType: pType === "audio" ? "audio" : undefined,
          media: mediaPayload,
        });
      }

      // Clear the form on success and route back
      setDescription("");
      setImage(null);
      clearAudio();
      setPostType("post");

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── Modern Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#1c1e21" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Create Post</AppText>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPostDisabled || loading}
            style={[
              styles.postButton,
              (isPostDisabled || loading) && styles.postButtonDisabled,
            ]}
          >
            {loading ? (
              <AppText style={styles.postButtonText}>...</AppText>
            ) : (
              <AppText
                style={[
                  styles.postButtonText,
                  (isPostDisabled || loading) && styles.postButtonTextDisabled,
                ]}
              >
                Post
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── User Profile Area ── */}
          <View style={styles.userSection}>
            <Image source={{ uri: myProfilePic }} style={styles.profilePic} />
            <View>
              <AppText style={styles.userName}>{myName}</AppText>
              <View style={styles.selectorsRow}>
                <TouchableOpacity style={styles.audienceSelector}>
                  <Ionicons name="earth" size={12} color="#8E8E93" />
                  <AppText style={styles.audienceText}>Public</AppText>
                  <Ionicons name="chevron-down" size={12} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Modern Segmented Control for Post Type ── */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentSegment,
                postType === "post" && styles.segmentSegmentActive,
              ]}
              onPress={() => setPostType("post")}
              activeOpacity={0.8}
            >
              <AppText
                style={[
                  styles.segmentText,
                  postType === "post" && styles.segmentTextActive,
                ]}
              >
                Standard Post
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentSegment,
                postType === "successStory" && styles.segmentSegmentActiveGreen,
              ]}
              onPress={() => setPostType("successStory")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="star"
                size={14}
                color={postType === "successStory" ? "#fff" : "#8E8E93"}
                style={{ marginRight: 4 }}
              />
              <AppText
                style={[
                  styles.segmentText,
                  postType === "successStory" && styles.segmentTextActive,
                ]}
              >
                Success Story
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Premium Large Text Input ── */}
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#A1A1AA"
            multiline
            autoFocus
            value={description}
            onChangeText={setDescription}
          />

          {/* ── Modern Media Preview Card ── */}
          {image && (
            <View style={styles.mediaContainer}>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => setImage(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <Image source={{ uri: image.uri }} style={styles.mediaPreview} />
            </View>
          )}

          {/* ── Recording Indicator and Audio Preview ── */}
          {isRecording && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingDot} />
              <AppText style={styles.recordingText}>Recording...</AppText>
            </View>
          )}

          {audioUri && !isRecording && (
            <View style={styles.audioPreviewContainer}>
              <View style={styles.audioPreviewInner}>
                <TouchableOpacity onPress={playAudioPreview} style={styles.playPauseBtn}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.audioPreviewLabel}>Voice Recording</AppText>
              </View>
              <TouchableOpacity onPress={clearAudio} style={styles.audioClearBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ── Premium Bottom Action Cards ── */}
        <View style={styles.bottomActionsArea}>
          <AppText style={styles.actionSectionTitle}>Add to your post</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsScroll}
          >
            <TouchableOpacity
              style={styles.actionCard}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, { backgroundColor: "#e8f5e9" }]}>
                <Ionicons name="image" size={24} color="#4CAF50" />
              </View>
              <AppText style={styles.actionCardText}>Photo/Video</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, isRecording && styles.actionCardRecording]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, { backgroundColor: isRecording ? "#FFCDD2" : "#FFF3E0" }]}>
                <Ionicons name={isRecording ? "stop" : "mic"} size={24} color={isRecording ? "#B71C1C" : "#FF9800"} />
              </View>
              <AppText style={styles.actionCardText}>{isRecording ? "Stop" : "Audio"}</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: "#e3f2fd" }]}>
                <Ionicons name="person" size={24} color="#2196F3" />
              </View>
              <AppText style={styles.actionCardText}>Tag People</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: "#ffebee" }]}>
                <Ionicons name="location" size={24} color="#F44336" />
              </View>
              <AppText style={styles.actionCardText}>Location</AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.white,
  },
  keyboardView: {
    flex: 1,
  },
  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.white,
    // Modern soft bottom shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1e21",
  },
  postButton: {
    backgroundColor: "#60ba8a", // Krishigram Theme active
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20, // Modern pill
  },
  postButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  postButtonTextDisabled: {
    color: "#A1A1AA",
  },
  // ── Scroll Content
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  // ── User Area
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#e0ece0",
  },
  userName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1c1e21",
    marginBottom: 4,
  },
  selectorsRow: {
    flexDirection: "row",
  },
  audienceSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  audienceText: {
    fontSize: 12,
    color: "#3F3F46",
    marginHorizontal: 4,
    fontWeight: "600",
  },
  // ── Segmented Control
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentSegment: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  segmentSegmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentSegmentActiveGreen: {
    backgroundColor: "#60ba8a", // Krishigram green active for success story
    shadowColor: "#60ba8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: "#71717A",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#1c1e21",
  },
  // ── Input
  textInput: {
    fontSize: 24,
    fontWeight: "300",
    color: "#1c1e21",
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 32,
  },
  // ── Media
  mediaContainer: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mediaPreview: {
    width: "100%",
    height: 400,
    borderRadius: 20,
  },
  removeMediaButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  // ── Bottom Action Area
  bottomActionsArea: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
  },
  actionSectionTitle: {
    marginLeft: 20,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#A1A1AA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    width: 104,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3F3F46",
    textAlign: "center",
  },
  actionCardRecording: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  // ── Audio Preview
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  recordingText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 15,
  },
  audioPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  audioPreviewInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  playPauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#60ba8a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  audioPreviewLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1e21",
  },
  audioClearBtn: {
    padding: 8,
  }
});
