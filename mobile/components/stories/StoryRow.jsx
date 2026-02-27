import { useFeedStories } from "@/hooks/useStories"; // adjust path
import { useAuthStore } from "@/utils/authStore"; // adjust path
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import StoryAvatar from "./StoryAvatar";

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
        <View style={styles.center}>
          <ActivityIndicator color="#60ba8a" />
          <Text style={styles.loadingText}>Loading Stories...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.error} onPress={refetch}>
            Failed to load stories. Tap to retry.
          </Text>
        </View>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  loader: {
    marginLeft: 16,
  },
  error: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
