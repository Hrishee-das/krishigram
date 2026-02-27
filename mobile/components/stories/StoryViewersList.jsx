import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/utils/authStore"; // adjust path

const BASE_URL = "http://10.149.177.124:3000/api/v1";

const fetchStoryViewers = async (storyId, token) => {
  const res = await fetch(`${BASE_URL}/stories/${storyId}/viewers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch viewers");
  return data.data;
};

/**
 * StoryViewersList
 * Props:
 *  - visible: boolean
 *  - storyId: string
 *  - onClose: () => void
 */
export default function StoryViewersList({ visible, storyId, onClose }) {
  const token = useAuthStore((s) => s.token);

  const { data: viewers, isLoading } = useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: () => fetchStoryViewers(storyId, token),
    enabled: visible && !!storyId,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="eye-outline" size={20} color="#333" />
            <Text style={styles.title}>
              {viewers?.length ?? 0} Viewer{viewers?.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={viewers}
              keyExtractor={(item, i) => item.user?._id ?? `v-${i}`}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 20,
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>No views yet</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.viewerRow}>
                  {item.user?.profilePic ? (
                    <Image
                      source={{ uri: item.user.profilePic }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarInitial}>
                        {item.user?.name?.[0]?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.viewerName}>
                    {item.user?.name ?? "Unknown"}
                  </Text>
                  <Text style={styles.viewedAt}>
                    {formatTimeAgo(item.viewedAt)}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

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
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginLeft: 4,
  },
  viewerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "bold",
  },
  viewerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  viewedAt: {
    fontSize: 11,
    color: "#999",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 30,
    fontSize: 14,
  },
});
