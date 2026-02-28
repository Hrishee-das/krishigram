import { IP_ADDRESS } from "../constants/ip";
import { useAuthStore } from "../utils/authStore";

const BASE_URL = `http://${IP_ADDRESS}:3000/api/v1`;

const getAuthToken = () => {
  try {
    return useAuthStore.getState().token;
  } catch (error) {
    console.error("[Auth] Failed to get token:", error);
    return null;
  }
};

// ✅ Fetch All Posts (with optional query params for user/type filtering)
export const fetchPosts = async (params = {}) => {
  const token = getAuthToken();
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${BASE_URL}/posts?${queryParams}` : `${BASE_URL}/posts`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch posts");
  }

  return data.data;
};

// ✅ Fetch MY stories from the Story model (NOT the Post model)
export const fetchMyStories = async () => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/stories/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch stories");
  }
  return data.data; // array of Story docs: { author, mediaUrl, mediaType, caption, ... }
};

// ✅ Create Post
export const createPost = async (postData) => {
  const token = getAuthToken();
  const formData = new FormData();

  formData.append("title", postData.title);
  formData.append("description", postData.description);
  formData.append("location", postData.location);
  formData.append("postType", postData.postType);

  if (postData.mediaType) {
    formData.append("mediaType", postData.mediaType);
  }

  if (postData.media?.uri) {
    const ext = postData.postType === "audio" ? "m4a" : "jpg";

    let mimeType = postData.media.mimeType;
    if (!mimeType) {
      if (postData.postType === "audio") mimeType = "audio/m4a";
      else if (postData.media.type === "video") mimeType = "video/mp4";
      else mimeType = "image/jpeg";
    }

    formData.append("media", {
      uri: postData.media.uri,
      type: mimeType,
      name: postData.media.fileName || postData.media.name || `post.${ext}`,
    });
  }

  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create post");
  }

  return data.data;
};

// ✅ Like Post
export const likePost = async (postId) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/posts/${postId}/like`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to like post");
  }
  return data.data;
};

// ✅ Unlike Post
export const unlikePost = async (postId) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/posts/${postId}/unlike`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to unlike post");
  }
  return data.data;
};

// ✅ Delete Post
export const deletePost = async (postId) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // 204 No Content means success with no body
  if (response.status === 204) {
    return true;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete post");
  }
  return true;
};

// ✅ Add Text Comment
export const addComment = async (postId, text) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to add comment");
  }
  return data.data;
};

// ✅ Add Audio Comment
export const addAudioComment = async (postId, audioData) => {
  const token = getAuthToken();
  const formData = new FormData();

  formData.append("commentType", "audio");

  if (audioData?.uri) {
    let mimeType = audioData.mimeType;
    if (!mimeType) {
      if (audioData.type && audioData.type.includes("/")) mimeType = audioData.type;
      else mimeType = "audio/m4a";
    }

    formData.append("media", {
      uri: audioData.uri,
      type: mimeType,
      name: audioData.fileName || audioData.name || "comment.m4a",
    });
  }

  const response = await fetch(`${BASE_URL}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create audio comment");
  }

  return data.data;
};