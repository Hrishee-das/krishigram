import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchMyStories } from "../services/post.api";

export const useUserPosts = (userId) => {
    return useQuery({
        queryKey: ["userPosts", userId],
        queryFn: () => fetchPosts({ user: userId, type: "post" }),
        enabled: !!userId,
    });
};

// Stories live in their own Story model — use the /stories/my endpoint
export const useUserStories = () => {
    return useQuery({
        queryKey: ["myStories"],
        queryFn: fetchMyStories,
    });
};
