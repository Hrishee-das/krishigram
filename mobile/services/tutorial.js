import { IP_ADDRESS } from "../constants/ip";

import { useAuthStore } from "../utils/authStore";

const BASE_URL = `http://${IP_ADDRESS}:3000/api/v1`;

const getAuthToken = () => useAuthStore.getState().token;

// Since video upload requires FormData, we might need a function to get token if auth is required
// Assuming auth token is saved in secure store, or you might need to adjust based on how authStore works
export const getAllTutorials = async () => {
  // Assuming tutorials are public or you pass auth mechanism here.
  // The backend route is currently protected: `router.get(protect, tutorialController.getAllTutorials)`
  // So we need to ensure credentials or tokens are sent if needed, using credentials: true on fetch
  // depending on the auth implementation (cookie based in your case).

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/tutorials`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tutorials");
  }

  return res.json();
};

export const uploadTutorial = async (formData) => {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/tutorials`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to upload tutorial");
  }

  return res.json();
};

export const searchTutorialsWithAudio = async (audioUri) => {
  const token = getAuthToken();
  const formData = new FormData();

  const filename = audioUri.split("/").pop() || "search-query.m4a";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `audio/${match[1]}` : `audio/m4a`;

  formData.append("audio", {
    uri: audioUri,
    name: filename,
    type: type,
  });

  // Replace with ACTUAL backend search endpoint once deployed
  // For now we assume a route like /tutorials/search/voice exists
  const res = await fetch(`${BASE_URL}/tutorials/search/voice`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to search tutorials by voice");
  }

  return res.json();
};
