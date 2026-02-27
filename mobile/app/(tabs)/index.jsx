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
  const navigation = useNavigation();
  const { t } = useTranslation();

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

      {/* ── Story Viewer modal ── */}
      <StoryViewer
        visible={viewerVisible}
        groups={feedGroups ?? []}
        initialGroupIndex={viewerGroupIndex}
        onClose={() => setViewerVisible(false)}
      />

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
});
