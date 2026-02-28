import { IP_ADDRESS } from "../constants/ip";

import { useAuthStore } from "../utils/authStore";


const BASE_URL = `http://${IP_ADDRESS}:3000/api/v1`;

const getAuthToken = () => useAuthStore.getState().token;

export const getAllTutorials = async (searchQuery = "") => {
    const token = getAuthToken();
    let url = `${BASE_URL}/tutorials`;
    if (searchQuery && searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
    }
    const res = await fetch(url, {
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
