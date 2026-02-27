import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IP_ADDRESS } from "../constants/ip";
import Color from "../constants/color";
import { Stack } from "expo-router";

const API_URL = `http://${IP_ADDRESS}:3000/api/v1/regions`;

export default function RegionsListScreen() {
    const router = useRouter();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();
            if (result.success) {
                setRegions(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch regions:", error);
            Alert.alert("Error Fetching Regions", `${error.message}\nAPI URL: ${API_URL}`);
        } finally {
            setLoading(false);
        }
    };

    const renderRegion = ({ item }) => (
        <TouchableOpacity
            style={styles.regionCard}
            onPress={() =>
                router.push({
                    pathname: "/community-chat",
                    params: { chatRoomId: item.chatRoomId, regionName: item.name },
                })
            }
        >
            <View style={styles.regionInfo}>
                <Ionicons name="location" size={24} color={Color.primary} />
                <Text style={styles.regionName}>{item.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "Select Region", headerBackTitle: "Back" }} />
            {loading ? (
                <ActivityIndicator size="large" color={Color.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={regions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRegion}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No regions available to join.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F6F8",
    },
    listContent: {
        padding: 16,
    },
    regionCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Color.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    regionInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    regionName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 40,
    },
});
