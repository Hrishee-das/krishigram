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

// ✅ Update Current User Profile
export const updateUserProfile = async (profileData) => {
    const token = getAuthToken();
    const formData = new FormData();

    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.district) formData.append("district", profileData.district);
    if (profileData.state) formData.append("state", profileData.state);

    if (profileData.image?.uri) {
        const filename = profileData.image.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", {
            uri: profileData.image.uri,
            type: type,
            name: filename || "avatar.jpg",
        });
    }

    const response = await fetch(`${BASE_URL}/updateMe`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update profile");
    }

    return data.data;
};
