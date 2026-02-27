import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCreateStory } from "@/hooks/useStories"; // adjust path

const { height: SH } = Dimensions.get("window");

/**
 * StoryCreator
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 */
export default function StoryCreator({ visible, onClose }) {
  const [picked, setPicked] = useState(null); // { uri, type, mimeType }
  const [caption, setCaption] = useState("");

  const { mutate: create, isPending } = useCreateStory();

  const resetAndClose = () => {
    setPicked(null);
    setCaption("");
    onClose?.();
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow media library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPicked({
        uri: asset.uri,
        type: asset.uri.split(".").pop(),
        mimeType:
          asset.mimeType ??
          (asset.type === "video" ? "video/mp4" : "image/jpeg"),
        mediaType: asset.type, // "image" | "video"
      });
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPicked({
        uri: asset.uri,
        type: "jpg",
        mimeType: "image/jpeg",
        mediaType: "image",
      });
    }
  };

  const handlePost = () => {
    if (!picked) return;
    create(
      {
        fileUri: picked.uri,
        fileType: picked.type,
        mimeType: picked.mimeType,
        caption,
        language: "en",
      },
      {
        onSuccess: () => {
          Alert.alert("Posted!", "Your story is live.");
          resetAndClose();
        },
        onError: (err) => Alert.alert("Error", err.message),
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={resetAndClose} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add to Story</Text>
            <TouchableOpacity onPress={resetAndClose}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          {picked ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: picked.uri }}
                style={styles.preview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setPicked(null)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
              {picked.mediaType === "video" && (
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={14} color="#fff" />
                  <Text style={styles.videoBadgeText}>Video</Text>
                </View>
              )}
            </View>
          ) : (
            // Pick options
            <View style={styles.pickRow}>
              <TouchableOpacity
                style={styles.pickOption}
                onPress={pickFromCamera}
              >
                <View style={[styles.pickIcon, { backgroundColor: "#E3F2FD" }]}>
                  <Ionicons name="camera" size={26} color="#1976D2" />
                </View>
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickOption}
                onPress={pickFromLibrary}
              >
                <View style={[styles.pickIcon, { backgroundColor: "#F3E5F5" }]}>
                  <Ionicons name="images" size={26} color="#7B1FA2" />
                </View>
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Caption */}
          {picked && (
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption..."
              placeholderTextColor="#aaa"
              value={caption}
              onChangeText={setCaption}
              maxLength={200}
              multiline
            />
          )}

          {/* Post button */}
          <TouchableOpacity
            style={[
              styles.postBtn,
              (!picked || isPending) && styles.postBtnDisabled,
            ]}
            onPress={handlePost}
            disabled={!picked || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="send"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.postBtnText}>Share to Story</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    minHeight: SH * 0.5,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  pickRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginVertical: 24,
  },
  pickOption: {
    alignItems: "center",
    gap: 8,
  },
  pickIcon: {
    width: 70,
    height: 70,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  pickLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  previewContainer: {
    alignSelf: "center",
    marginBottom: 16,
  },
  preview: {
    width: 160,
    height: 260,
    borderRadius: 14,
    backgroundColor: "#eee",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  videoBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  videoBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 60,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  postBtn: {
    backgroundColor: "#4F8EF7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
