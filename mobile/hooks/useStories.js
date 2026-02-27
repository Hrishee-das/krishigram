import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeedStories,
  createStory,
  markStoryViewed,
  deleteStory,
} from "../services/story.api";

// ─── Query Keys ───────────────────────────────────────────────
export const storyKeys = {
  all: ["stories"],
  feed: () => [...storyKeys.all, "feed"],
};

// ─── Fetch Feed Stories ───────────────────────────────────────
export const useFeedStories = () => {
  return useQuery({
    queryKey: storyKeys.feed(),
    queryFn: fetchFeedStories,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ─── Create Story ─────────────────────────────────────────────
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.feed() });
    },
  });
};

// ─── Mark Story Viewed ────────────────────────────────────────
export const useMarkStoryViewed = () => {
  return useMutation({
    mutationFn: markStoryViewed,
  });
};

// ─── Delete Story ─────────────────────────────────────────────
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.feed() });
    },
  });
};
