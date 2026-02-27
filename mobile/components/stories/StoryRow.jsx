import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import StoryAvatar from "./StoryAvatar";
import { useFeedStories } from "@/hooks/useStories"; // adjust path
import Color from "@/constants/color";
import { useAuthStore } from "@/utils/authStore"; // adjust path

/**
 * StoryRow
 * Props:
 *  - onStoryPress: (authorGroup) => void
 *  - onAddStory: () => void
 */
export default function StoryRow({ onStoryPress, onAddStory }) {
  const { data: feedGroups, isLoading, isError, refetch } = useFeedStories();
  const currentUser = useAuthStore((s) => s.user);

  // Build "Your Story" placeholder group
  const myGroup = {
    author: currentUser,
    stories:
      feedGroups?.find((g) => g.author._id === currentUser?._id)?.stories ?? [],
    isOwn: true,
  };

  const otherGroups =
    feedGroups?.filter((g) => g.author._id !== currentUser?._id) ?? [];

  const listData = [myGroup, ...otherGroups];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          color={Color.primary ?? "#4F8EF7"}
          style={styles.loader}
        />
      ) : isError ? (
        <Text style={styles.error} onPress={refetch}>
          Failed to load stories. Tap to retry.
        </Text>
      ) : (
        <FlatList
          data={listData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, i) => item.author?._id ?? `own-${i}`}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <StoryAvatar
              authorGroup={item}
              isOwn={item.isOwn}
              onPress={item.isOwn ? onAddStory : onStoryPress}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 168,
    justifyContent: "center",
  },
  listPadding: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  loader: {
    marginLeft: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginLeft: 16,
  },
});
