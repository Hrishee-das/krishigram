import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

import AppText from "@/components/AppText";
import CreatePostCard from "@/components/home/CreatePostCard";
import PostCard from "@/components/home/PostCard";
import { useAuthStore } from "@/utils/authStore";

import { fetchPosts } from "@/services/post.api";

export default function PostTabFeedScreen() {
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Restore the normal tab header since this is now a main feed screen
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Community Feed",
    });
  }, [navigation]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchPosts();
      const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];

      // Sort posts by createdAt descending (newest first)
      const sortedPosts = postsArray.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setPosts(sortedPosts);
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleDeleteSuccess = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(p => (p._id || p.id) !== deletedPostId));
  };

  // Get real auth user data
  const currentUser = useAuthStore((state) => state.user);
  const myProfilePic = currentUser?.profilePic;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Facebook-style Create Post Entry ── */}
        <CreatePostCard userProfilePic={myProfilePic} />

        {/* ── Render Posts ── */}
        <View style={styles.feedSection}>
          {loadingPosts && !refreshing ? (
            <ActivityIndicator size="large" color="#60ba8a" style={{ marginTop: 20 }} />
          ) : posts.length === 0 ? (
            <AppText style={styles.emptyText}>No posts yet. Be the first to share!</AppText>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))
          )}
        </View>

        {/* ── Bottom padding for the tab bar ── */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9f7",
  },
  feedSection: {
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#65676B',
    marginTop: 30,
    fontSize: 16
  }
});