import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * StoryAvatar
 * Props:
 *  - authorGroup: { author: { _id, name, profilePic }, stories: [...] }
 *  - onPress: (authorGroup) => void
 *  - isOwn: boolean  (shows "+" add button instead of ring)
 */
export default function StoryAvatar({ authorGroup, onPress, isOwn = false }) {
  const { author, stories } = authorGroup;
  const hasUnviewed = stories?.some((s) => !s.viewedByMe); // backend can send viewedByMe flag
  const preview = stories?.[0];

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => onPress?.(authorGroup)}
      activeOpacity={0.8}
    >
      {/* Card thumbnail */}
      <View style={[styles.card, isOwn && styles.ownCard]}>
        {preview?.mediaUrl ? (
          <Image
            source={{ uri: preview.mediaUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderBg}>
            <Ionicons
              name={
                preview?.mediaType === "video"
                  ? "videocam"
                  : preview?.mediaType === "voice"
                    ? "mic"
                    : "image-outline"
              }
              size={28}
              color="#bbb"
            />
          </View>
        )}

        {/* Gradient overlay at bottom */}
        <View style={styles.gradient} />

        {/* Own story: add button */}
        {isOwn ? (
          <View style={styles.addBtn}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        ) : null}

        {/* Unviewed ring indicator */}
        {!isOwn && hasUnviewed && <View style={styles.unviewedRing} />}

        {/* Author name at bottom */}
        <Text style={styles.name} numberOfLines={1}>
          {isOwn ? "Your Story" : (author?.name ?? "")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const CARD_W = 96;
const CARD_H = 152;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 4,
    alignItems: "center",
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e8e8e8",
    borderWidth: 2,
    borderColor: "#4F8EF7",
  },
  ownCard: {
    borderColor: "#ccc",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  placeholderBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: "transparent",
    // RN doesn't support CSS gradients natively; use LinearGradient if expo-linear-gradient is available
    backgroundColor: "rgba(0,0,0,0.35)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: {
    position: "absolute",
    bottom: 8,
    left: 6,
    right: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addBtn: {
    position: "absolute",
    bottom: 28,
    left: CARD_W / 2 - 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  unviewedRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: "#4F8EF7",
  },
});
