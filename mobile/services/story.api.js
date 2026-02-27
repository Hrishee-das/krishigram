import { IP_ADDRESS } from "../constants/ip";
import { useAuthStore } from "../utils/authStore";

const BASE_URL = `http://${IP_ADDRESS}:3000/api/v1`;

const getAuthToken = () => useAuthStore.getState().token;

export const fetchFeedStories = async () => {
  const token = getAuthToken();

  const res = await fetch(`${BASE_URL}/stories/feed`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch stories");
  }

  return data.data;
};

export const createStory = async ({
  fileUri,
  fileType,
  mimeType,
  caption,
  language,
}) => {
  const token = getAuthToken();
  const formData = new FormData();

  formData.append("media", {
    uri: fileUri,
    type: mimeType, // image/jpeg, video/mp4, audio/m4a
    name: `story.${fileType}`,
  });

  formData.append("caption", caption || "");
  formData.append("language", language || "en");

  const res = await fetch(`${BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create story");
  }

  return data.data;
};

export const markStoryViewed = async (storyId) => {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/stories/${storyId}/view`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to mark story viewed");
  }
};

export const deleteStory = async (storyId) => {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/stories/${storyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to delete story");
  }
};
