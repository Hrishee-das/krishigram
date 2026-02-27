<<<<<<< Updated upstream
=======
import React, { useState } from "react";
import { View, ScrollView, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> Stashed changes
import AppText from "@/components/AppText";
import Color from "@/constants/color";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import AIAssistantBottomSheet from "@/components/AIAssistantBottomSheet";
import HeaderToolsMenu from "@/components/home/HeaderToolsMenu";
import PlantDetectionCarousel from "@/components/home/PlantDetectionCarousel";
import StoryCreator from "@/components/stories/StoryCreator";
import StoryRow from "@/components/stories/StoryRow";
import StoryViewer from "@/components/stories/StoryViewer";
import { useFeedStories } from "@/hooks/useStories";

export default function HomeScreen() {
  const { data: feedGroups } = useFeedStories();
<<<<<<< Updated upstream
  const navigation = useNavigation();
  const { t } = useTranslation();
=======
  const router = useRouter();
>>>>>>> Stashed changes

  // ── Viewer state ──────────────────────────────────────────
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  // ── Creator state ─────────────────────────────────────────
  const [creatorVisible, setCreatorVisible] = useState(false);

  // ── AI State ─────────────────────────────────────────
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderToolsMenu />,
    });
  }, [navigation]);

  const handleStoryPress = (authorGroup) => {
    const idx = feedGroups?.findIndex(
      (g) => g.author._id === authorGroup.author._id,
    );
    setViewerGroupIndex(idx >= 0 ? idx : 0);
    setViewerVisible(true);
  };

  const handleImageSelected = (imageAsset) => {
      setSelectedImage(imageAsset);
      setBottomSheetVisible(true);
  }



  return (
<<<<<<< Updated upstream
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Stories section (Facebook card style) ── */}
      <View style={styles.storiesCard}>
        <AppText variant="h4" style={styles.sectionTitle}>
          {t("stories")}
        </AppText>
        <StoryRow
          onStoryPress={handleStoryPress}
          onAddStory={() => setCreatorVisible(true)}
        />
      </View>

      <PlantDetectionCarousel onImageSelected={handleImageSelected} />

      {/* ── Bottom padding for the custom tab bar ── */}
      <View style={{ height: 100 }} />
=======
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Stories section (Facebook card style) ── */}
        <View style={styles.storiesCard}>
          <AppText variant="h4" style={styles.sectionTitle}>
            Stories
          </AppText>
          <StoryRow
            onStoryPress={handleStoryPress}
            onAddStory={() => setCreatorVisible(true)}
          />
        </View>

        {/* ── Carousel ── */}
        <AppCarousel slideWidth={350} interval={4000}>
          <Pressable>
            <View style={[styles.slide, { backgroundColor: "#E8F5E9" }]}>
              <Text style={styles.slideTitle}>Take a Picture 📸</Text>
              <Text style={styles.slideSubtitle}>Scan your skin instantly</Text>
            </View>
          </Pressable>
          <View style={[styles.slide, { backgroundColor: "#FFF3E0" }]}>
            <Text style={styles.slideTitle}>See Diagnosis 🔬</Text>
            <Text style={styles.slideSubtitle}>AI powered analysis</Text>
          </View>
          <View style={[styles.slide, { backgroundColor: "#E3F2FD" }]}>
            <Text style={styles.slideTitle}>Get Medicine 💊</Text>
            <Text style={styles.slideSubtitle}>Recommended treatment</Text>
          </View>
        </AppCarousel>
>>>>>>> Stashed changes

        {/* ── Story Viewer modal ── */}
        <StoryViewer
          visible={viewerVisible}
          groups={feedGroups ?? []}
          initialGroupIndex={viewerGroupIndex}
          onClose={() => setViewerVisible(false)}
        />

<<<<<<< Updated upstream
      {/* ── Story Creator bottom sheet ── */}
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
    </ScrollView>
=======
        {/* ── Story Creator bottom sheet ── */}
        <StoryCreator
          visible={creatorVisible}
          onClose={() => setCreatorVisible(false)}
        />
      </ScrollView>

      {/* ── Community Chat FAB ── */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => router.push("/regions-list")}
      >
        <Ionicons name="chatbubbles" size={28} color={Color.white} />
      </TouchableOpacity>
    </View>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  storiesCard: {
    backgroundColor: Color.white,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 8,
    paddingTop: 12,
    paddingBottom: 8,
    // subtle card shadow
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
  slide: {
    height: 180,
    borderRadius: 10,
    padding: 20,
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  slideSubtitle: {
    marginTop: 4,
    color: "#555",
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
