import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import AppText from "@/components/AppText";
import Color from "@/constants/color";
import AppCarousel from "@/components/AppCarousel";

import AIAssistantBottomSheet from "@/components/AIAssistantBottomSheet";
import PlantDetectionCarousel from "@/components/home/PlantDetectionCarousel";
import StoryCreator from "@/components/stories/StoryCreator";
import StoryRow from "@/components/stories/StoryRow";
import StoryViewer from "@/components/stories/StoryViewer";
import { useFeedStories } from "@/hooks/useStories";
import RecentDetectionsWidget from "@/components/home/RecentDetectionsWidget";
import ToolsWidget from "@/components/home/ToolsWidget";
import LibraryWidget from "@/components/home/LibraryWidget";
import WeatherWidget from "@/components/home/WeatherWidget";
import HeaderLanguagePicker from "@/components/home/HeaderLanguagePicker";

export default function HomeScreen() {
  const { data: feedGroups, refetch } = useFeedStories();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const router = useRouter();

  // 🔄 Refetch when screen focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // ── Viewer State ──────────────────────────────────────────
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  // ── Creator State ─────────────────────────────────────────
  const [creatorVisible, setCreatorVisible] = useState(false);

  // ── AI Bottom Sheet State ─────────────────────────────────
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderLanguagePicker />,
    });
  }, [navigation]);

  const handleStoryPress = (authorGroup) => {
    const idx = feedGroups?.findIndex(
      (g) => g.author._id === authorGroup.author._id
    );
    setViewerGroupIndex(idx >= 0 ? idx : 0);
    setViewerVisible(true);
  };

  const handleImageSelected = (imageAsset) => {
    setSelectedImage(imageAsset);
    setBottomSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Stories Section ── */}
        <View style={styles.storiesCard}>
          <AppText variant="h4" style={styles.sectionTitle}>
            {t("stories")}
          </AppText>
          <StoryRow
            onStoryPress={handleStoryPress}
            onAddStory={() => setCreatorVisible(true)}
          />
        </View>


        <View style={{ height: 120 }} />
      </ScrollView>

<ScrollView>
      {/* ── Story Viewer ── */}
        {/* ── Plant Detection Carousel ── */}
        <PlantDetectionCarousel onImageSelected={handleImageSelected} />
        {/* ── Recent Detections ──
        <RecentDetectionsWidget /> */}


        {/* ── Farming Tools & Calculators ── */}
        <ToolsWidget />

        {/* ── KrishiGram Library ── */}
        <LibraryWidget />

        {/* ── Real-time Weather ── */}
        <WeatherWidget />

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Story Viewer Modal ── */}
      <StoryViewer
        visible={viewerVisible}
        groups={feedGroups ?? []}
        initialGroupIndex={viewerGroupIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* ── Story Creator ── */}
      <StoryCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
      />

      {/* ── AI Assistant Bottom Sheet ── */}
      {bottomSheetVisible && (
        <AIAssistantBottomSheet
          visible={bottomSheetVisible}
          onClose={() => {
            setBottomSheetVisible(false);
            setSelectedImage(null);
          }}
          initialData={null}
          initialImage={selectedImage}
        />
      )}

      {/* ── Community Chat FAB ── */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => router.push("/regions-list")}
      >
        <Ionicons name="chatbubbles" size={28} color={Color.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  storiesCard: {
    backgroundColor: Color.white,
    marginBottom: 8,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 6,
    marginLeft: 14,
    fontWeight: "700",
    color: "#1c1e21",
  },
  chatFab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Color.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});