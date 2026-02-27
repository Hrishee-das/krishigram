import React, { useState } from "react";
import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import AppCarousel from "@/components/AppCarousel";
import Color from "@/constants/color";

import StoryRow from "@/components/stories/StoryRow";
import StoryViewer from "@/components/stories/StoryViewer";
import StoryCreator from "@/components/stories/StoryCreator";
import { useFeedStories } from "@/hooks/useStories";

export default function HomeScreen() {
  const { data: feedGroups } = useFeedStories();

  // ── Viewer state ──────────────────────────────────────────
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  // ── Creator state ─────────────────────────────────────────
  const [creatorVisible, setCreatorVisible] = useState(false);

  const handleStoryPress = (authorGroup) => {
    const idx = feedGroups?.findIndex(
      (g) => g.author._id === authorGroup.author._id,
    );
    setViewerGroupIndex(idx >= 0 ? idx : 0);
    setViewerVisible(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
