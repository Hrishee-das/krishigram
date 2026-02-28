import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";

import AppButton from "../../components/AppButton";
import AppText from "../../components/AppText";
import { useAuthStore } from "../../utils/authStore";
import { useUserPosts, useUserStories } from "../../hooks/usePosts";
import { updateUserProfile } from "../../services/user.api";
import Color from "../../constants/color";

const { width, height } = Dimensions.get("window");
const GRID_ITEM_SIZE = (width - 4) / 3;

export default function ProfileScreen() {
  const { logOut, user, setUser } = useAuthStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editDistrict, setEditDistrict] = useState(user?.district || "");
  const [editState, setEditState] = useState(user?.state || "");
  const [editImage, setEditImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Story viewer state
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useUserPosts(user?._id);
  const { data: stories, isLoading: storiesLoading, refetch: refetchStories } = useUserStories();

  useFocusEffect(
    useCallback(() => {
      refetchPosts();
      refetchStories();
    }, [refetchPosts, refetchStories])
  );

  const openStory = (index) => {
    setCurrentStoryIndex(index);
    setStoryViewerVisible(true);
  };

  /* ─── Grid cell renderer (Posts tab) ─── */
  const renderGridItem = ({ item }) => {
    const hasImage = !!item.media && item.mediaType === "image";
    const hasVideo = !!item.media && item.mediaType === "video";
    const hasAudio = item.mediaType === "audio";
    return (
      <View style={styles.gridCell}>
        {hasImage ? (
          <Image source={{ uri: item.media }} style={styles.gridImage} contentFit="cover" />
        ) : hasVideo ? (
          <View style={[styles.gridImage, styles.gridPlaceholder]}>
            <Ionicons name="play-circle" size={32} color="#fff" />
          </View>
        ) : hasAudio ? (
          <View style={[styles.gridImage, styles.gridPlaceholder, { backgroundColor: "#e8f5e9" }]}>
            <Ionicons name="musical-notes" size={32} color={Color.primary} />
          </View>
        ) : (
          <View style={[styles.gridImage, styles.gridPlaceholder]}>
            <Ionicons name="document-text-outline" size={28} color="#aaa" />
          </View>
        )}
        {hasVideo && (
          <View style={styles.gridOverlayBadge}>
            <Ionicons name="videocam" size={12} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  /* ─── Story circle renderer (horizontal row) ─── */
  const renderStoryCircle = ({ item, index }) => (
    <TouchableOpacity
      style={styles.storyCircleWrap}
      onPress={() => openStory(index)}
      activeOpacity={0.85}
    >
      {/* Gradient-border ring */}
      <View style={styles.storyRing}>
        <View style={styles.storyRingInner}>
          <Image
            source={{ uri: item.mediaUrl || "https://fakeimg.pl/200x200" }}
            style={styles.storyThumb}
            contentFit="cover"
          />
          {/* Video badge */}
          {item.mediaType === "video" && (
            <View style={styles.storyVideoBadge}>
              <Ionicons name="play" size={9} color="#fff" />
            </View>
          )}
        </View>
      </View>
      <AppText style={styles.storyLabel} numberOfLines={1}>
        {item.caption ? item.caption.slice(0, 10) : "Story"}
      </AppText>
    </TouchableOpacity>
  );

  const postsCount = posts?.length ?? 0;
  const storiesCount = stories?.length ?? 0;
  const isActiveData = activeTab === "posts" ? posts : stories;
  const isActiveLoading = activeTab === "posts" ? postsLoading : storiesLoading;

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setEditImage(result.assets[0]);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedData = await updateUserProfile({
        name: editName,
        district: editDistrict,
        state: editState,
        image: editImage,
      });
      if (updatedData?.user) setUser({ ...user, ...updatedData.user });
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStory = stories?.[currentStoryIndex];

  return (
    <View style={styles.container}>
      {/* ════════════════════════  STORY VIEWER MODAL  ════════════════════════ */}
      <Modal
        visible={storyViewerVisible}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setStoryViewerVisible(false)}
      >
        <View style={styles.viewerContainer}>
          <StatusBar hidden />

          {/* Close button */}
          <TouchableOpacity
            style={styles.viewerClose}
            onPress={() => setStoryViewerVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Story counter dots */}
          <View style={styles.viewerDots}>
            {(stories ?? []).map((_, i) => (
              <View
                key={i}
                style={[styles.viewerDot, i === currentStoryIndex && styles.viewerDotActive]}
              />
            ))}
          </View>

          {/* Author strip */}
          <View style={styles.viewerAuthor}>
            <View style={styles.viewerAvatarRing}>
              <Image
                source={{
                  uri:
                    user?.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Me")}&background=60ba8a&color=fff`,
                }}
                style={styles.viewerAvatar}
                contentFit="cover"
              />
            </View>
            <View>
              <AppText style={styles.viewerAuthorName}>{user?.name || "Me"}</AppText>
              <AppText style={styles.viewerStoryCaption} numberOfLines={1}>
                {currentStory?.caption || ""}
              </AppText>
            </View>
          </View>

          {/* Media — image or video */}
          {currentStory?.mediaType === "video" ? (
            <Video
              source={{ uri: currentStory?.mediaUrl }}
              style={styles.viewerMedia}
              resizeMode="contain"
              shouldPlay
              isLooping={false}
              useNativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: currentStory?.mediaUrl }}
              style={styles.viewerMedia}
              contentFit="contain"
            />
          )}

          {/* Left / Right tap zones */}
          <View style={styles.viewerNavRow}>
            <TouchableOpacity
              style={styles.viewerNavZone}
              onPress={() =>
                setCurrentStoryIndex((i) => Math.max(0, i - 1))
              }
            />
            <TouchableOpacity
              style={styles.viewerNavZone}
              onPress={() => {
                if (currentStoryIndex < (stories?.length ?? 1) - 1) {
                  setCurrentStoryIndex((i) => i + 1);
                } else {
                  setStoryViewerVisible(false);
                }
              }}
            />
          </View>

          {/* Views */}
          <View style={styles.viewerFooter}>
            <Ionicons name="eye-outline" size={16} color="rgba(255,255,255,0.7)" />
            <AppText style={styles.viewerViews}>
              {currentStory?.viewers?.length ?? 0} views
            </AppText>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════  MAIN CONTENT  ════════════════════════ */}
      <FlatList
        key={activeTab}
        data={activeTab === "posts" ? (posts ?? []) : []}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        numColumns={3}
        renderItem={renderGridItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View>
            {/* ── Avatar + Stats + Logout ── */}
            <View style={styles.header}>
              <View style={styles.avatarRing}>
                <Image
                  source={{
                    uri:
                      user?.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Farmer")}&background=60ba8a&color=fff&size=200`,
                  }}
                  style={styles.profilePic}
                  contentFit="cover"
                />
              </View>
              <View style={styles.statStrip}>
                <View style={styles.statBlock}>
                  <AppText style={styles.statNumber}>{postsCount}</AppText>
                  <AppText style={styles.statLabel}>Posts</AppText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                  <AppText style={styles.statNumber}>{storiesCount}</AppText>
                  <AppText style={styles.statLabel}>Stories</AppText>
                </View>
              </View>
            </View>

            {/* ── Bio ── */}
            <View style={styles.bioSection}>
              <AppText style={styles.nameText}>{user?.name || t("farmer")}</AppText>
              {(user?.district || user?.state) && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color="#7f8c8d" />
                  <AppText style={styles.locationText}>
                    {[user.district, user.state].filter(Boolean).join(", ")}
                  </AppText>
                </View>
              )}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setIsEditModalVisible(true)}
              >
                <AppText style={styles.editProfileText}>Edit Profile</AppText>
              </TouchableOpacity>
            </View>

            {/* ── STORIES ROW (always visible, like Instagram) ── */}
            <View style={styles.storiesSection}>
              <View style={styles.storiesSectionHeader}>
                <AppText style={styles.storiesSectionTitle}>Your Stories</AppText>
                <AppText style={styles.storiesSectionCount}>
                  {storiesCount > 0 ? `${storiesCount} active` : "Tap to post"}
                </AppText>
              </View>

              {storiesLoading ? (
                <ActivityIndicator size="small" color={Color.primary} style={{ margin: 16 }} />
              ) : storiesCount > 0 ? (
                <FlatList
                  data={stories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(s) => s._id || Math.random().toString()}
                  renderItem={renderStoryCircle}
                  contentContainerStyle={styles.storiesRow}
                />
              ) : (
                <View style={styles.storiesEmpty}>
                  <Ionicons name="add-circle-outline" size={36} color="#d0d7de" />
                  <AppText style={styles.storiesEmptyText}>No stories yet</AppText>
                </View>
              )}
            </View>

            {/* ── Tab switcher (Posts grid only) ── */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "posts" && styles.tabBtnActive]}
                onPress={() => setActiveTab("posts")}
              >
                <Ionicons
                  name="grid"
                  size={22}
                  color={activeTab === "posts" ? Color.primary : "#aaa"}
                />
              </TouchableOpacity>
            </View>

            {/* Loading / empty state for grid */}
            {postsLoading && (
              <ActivityIndicator size="large" color={Color.primary} style={{ marginTop: 40 }} />
            )}
            {!postsLoading && postsCount === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="images-outline" size={56} color="#d0d7de" />
                <AppText style={styles.emptyTitle}>No posts yet</AppText>
                <AppText style={styles.emptySubtitle}>
                  Your posts will appear here after you share them.
                </AppText>
              </View>
            )}
          </View>
        }
      />

      {/* ════════════════════════  EDIT PROFILE MODAL  ════════════════════════ */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} disabled={isSaving}>
              <AppText style={styles.modalCancelText}>Cancel</AppText>
            </TouchableOpacity>
            <AppText variant="h3">Edit Profile</AppText>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color={Color.primary} />
              ) : (
                <AppText style={styles.modalSaveText}>Save</AppText>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TouchableOpacity style={styles.modalImageContainer} onPress={handlePickImage} disabled={isSaving}>
              <Image
                source={{
                  uri:
                    editImage?.uri ||
                    user?.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Farmer")}&background=60ba8a&color=fff&size=200`,
                }}
                style={styles.modalProfilePic}
                contentFit="cover"
              />
              <View style={styles.modalImageOverlay}>
                <Ionicons name="camera" size={24} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>Name</AppText>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your Name"
                editable={!isSaving}
              />
            </View>
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>District</AppText>
              <TextInput
                style={styles.input}
                value={editDistrict}
                onChangeText={setEditDistrict}
                placeholder="E.g. Pune"
                editable={!isSaving}
              />
            </View>
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>State</AppText>
              <TextInput
                style={styles.input}
                value={editState}
                onChangeText={setEditState}
                placeholder="E.g. Maharashtra"
                editable={!isSaving}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    borderColor: Color.primary,
    padding: 2,
    marginRight: 20,
  },
  profilePic: { width: "100%", height: "100%", borderRadius: 40 },

  /* ── Stat strip ── */
  statStrip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#f8faf8",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statBlock: { alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "800", color: "#1a2027" },
  statLabel: { fontSize: 11, color: "#7f8c8d", fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: "#e5e9ec" },

  /* ── Bio ── */
  bioSection: { paddingHorizontal: 20, paddingBottom: 14 },
  nameText: { fontSize: 17, fontWeight: "800", color: "#1a2027", marginBottom: 3 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 10 },
  locationText: { fontSize: 13, color: "#7f8c8d" },
  editProfileBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f0f2f5",
    borderWidth: 1,
    borderColor: "#e0e4e8",
  },
  editProfileText: { fontSize: 13, fontWeight: "700", color: "#1a2027" },

  /* ── Stories section ── */
  storiesSection: {
    borderTopWidth: 1,
    borderTopColor: "#f0f2f5",
    paddingTop: 14,
    paddingBottom: 6,
  },
  storiesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  storiesSectionTitle: { fontSize: 14, fontWeight: "700", color: "#1a2027" },
  storiesSectionCount: { fontSize: 12, color: Color.primary, fontWeight: "600" },
  storiesRow: { paddingHorizontal: 12, gap: 4 },
  storiesEmpty: { alignItems: "center", paddingVertical: 16, gap: 6 },
  storiesEmptyText: { fontSize: 12, color: "#b0b8c1" },

  /* ── Story circle ── */
  storyCircleWrap: { alignItems: "center", marginHorizontal: 6 },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 2.5,
    // Simulated gradient border using a green ring
    backgroundColor: Color.primary,
  },
  storyRingInner: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    position: "relative",
  },
  storyThumb: { width: "100%", height: "100%" },
  storyVideoBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  storyLabel: {
    fontSize: 10,
    color: "#4a5568",
    marginTop: 5,
    maxWidth: 68,
    textAlign: "center",
  },

  /* ── Tab row ── */
  tabRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f2f5",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    backgroundColor: "#fff",
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Color.primary },

  /* ── Post grid ── */
  gridContent: { paddingBottom: 100 },
  gridRow: { gap: 2 },
  gridCell: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, marginBottom: 2, position: "relative" },
  gridImage: { width: "100%", height: "100%" },
  gridPlaceholder: { backgroundColor: "#2c3e50", alignItems: "center", justifyContent: "center" },
  gridOverlayBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    padding: 2,
  },

  /* ── Empty state ── */
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#4a5568", marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: "#95a5a6", marginTop: 6, textAlign: "center", lineHeight: 19 },

  /* ── Logout icon ── */
  logoutBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  /* ══════════  STORY VIEWER  ══════════ */
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  viewerMedia: {
    width,
    height: height * 0.78,
    alignSelf: "center",
  },
  viewerClose: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 20,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  viewerDots: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    zIndex: 10,
  },
  viewerDot: {
    height: 3,
    flex: 1,
    marginHorizontal: 2,
    maxWidth: 40,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  viewerDotActive: { backgroundColor: "#fff" },
  viewerAuthor: {
    position: "absolute",
    top: 70,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 10,
  },
  viewerAvatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Color.primary,
    overflow: "hidden",
  },
  viewerAvatar: { width: "100%", height: "100%" },
  viewerAuthorName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  viewerStoryCaption: { fontSize: 12, color: "rgba(255,255,255,0.75)", maxWidth: 220 },
  viewerNavRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 5,
  },
  viewerNavZone: { flex: 1 },
  viewerFooter: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  viewerViews: { color: "rgba(255,255,255,0.7)", fontSize: 13 },

  /* ══════════  EDIT PROFILE MODAL  ══════════ */
  modalContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#fff",
  },
  modalCancelText: { color: "#7F8C8D", fontSize: 16 },
  modalSaveText: { color: Color.primary, fontWeight: "bold", fontSize: 16 },
  modalBody: { padding: 20 },
  modalImageContainer: { alignSelf: "center", marginBottom: 30, position: "relative" },
  modalProfilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Color.primary,
  },
  modalImageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Color.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8F9FA",
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { marginBottom: 8, color: "#2C3E50", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2C3E50",
  },
});
