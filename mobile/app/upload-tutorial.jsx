import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import Color from "../constants/color";
import { uploadTutorial } from "../services/tutorial";

const VideoPreview = ({ videoUrl }) => {
    return (
        <Video
            source={{ uri: videoUrl }}
            style={styles.videoPreview}
            resizeMode="cover"
            shouldPlay={false}
            useNativeControls
        />
    );
};

export default function UploadTutorialScreen() {
// ... (state and functions remain)

  const clearVideo = () => {
    setVideoUri(null);
  };

  const handleUpload = async () => {
    if (!title.trim() || !description.trim() || !videoUri) {
      Alert.alert("Missing Fields", "Please provide a title, description, and select a video.");
      return;
    }

    setLoading(true);

    try {
      // Create form data using the local URI
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      // Append video file payload
      const filename = videoUri.split('/').pop() || "tutorial.mp4";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : `video/mp4`;
      
      formData.append("video", {
        uri: videoUri,
        name: filename,
        type: type,
      });

      await uploadTutorial(formData);
      
      Alert.alert("Success", "Tutorial uploaded successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload tutorial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppText variant="h2" style={styles.headerTitle}>Upload Tutorial</AppText>
      
      <View style={styles.inputContainer}>
        <AppText variant="small" style={styles.label}>Title</AppText>
        <TextInput
          style={styles.input}
          placeholder="Enter tutorial title"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <AppText variant="small" style={styles.label}>Description</AppText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter tutorial description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </View>

      <View style={styles.videoSection}>
        <AppText variant="small" style={styles.label}>Video Content</AppText>
        
        {videoUri ? (
          <View style={styles.videoPreviewContainer}>
            <VideoPreview videoUrl={videoUri} />
            <TouchableOpacity 
              style={styles.removeVideoButton} 
              onPress={clearVideo}
              disabled={loading}
            >
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.videoPickerBox} 
            onPress={pickVideo}
            disabled={loading}
          >
            <Ionicons name="cloud-upload-outline" size={48} color={Color.primary} />
            <AppText style={styles.videoPickerText}>Tap to select a video</AppText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <AppButton 
          title={loading ? "Uploading..." : "Upload Tutorial"} 
          onPress={handleUpload}
          disabled={loading}
          fullWidth
        />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Color.primary} />
            <AppText style={styles.loadingText}>Uploading video... Please wait.</AppText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    marginBottom: 24,
    color: Color.primaryDark,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: "#2c3e50",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  videoSection: {
    marginBottom: 32,
  },
  videoPickerBox: {
    borderWidth: 2,
    borderColor: Color.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0Fdf4", // Light green tint
  },
  videoPickerText: {
    marginTop: 12,
    color: Color.primary,
    fontWeight: "600",
  },
  videoPreviewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  removeVideoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 15,
    padding: 2,
  },
  buttonContainer: {
    marginTop: 10,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: -60,
    left: 0,
    right: 0,
    bottom: -20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: Color.primaryDark,
    fontWeight: "bold",
  }
});
