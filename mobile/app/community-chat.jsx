import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { useAuthStore } from "../utils/authStore";
import { IP_ADDRESS } from "../constants/ip";
import Color from "../constants/color";
import { Stack, useLocalSearchParams } from "expo-router";

const SOCKET_URL = `http://${IP_ADDRESS}:3000`;
const API_URL = `http://${IP_ADDRESS}:3000/api/v1/chat`;

export default function CommunityChatScreen() {
    const { chatRoomId, regionName } = useLocalSearchParams();
    const { user, token } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [recording, setRecording] = useState(null);
    const [recordedAudioUri, setRecordedAudioUri] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [userData, setUserData] = useState(null);

    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!chatRoomId) return;
        fetchUserProfile();
        fetchHistory();
        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`http://${IP_ADDRESS}:3000/api/v1/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (result.status === "success" && result.data) {
                setUserData(result.data.user || result.data);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/${chatRoomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (result.success && result.messages) {
                setMessages(result.messages);
            }
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = () => {
        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
            console.log("Connected to socket server");
            socketRef.current.emit("joinRoom", chatRoomId);
        });

        socketRef.current.on("receiveMessage", (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const startRecording = async () => {
        try {
            // Unload any stuck recording first
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(newRecording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecordedAudioUri(uri);
        } catch (error) {
            console.error("Failed to stop recording:", error);
        } finally {
            setRecording(null);
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        }
    };

    const removeAttachment = () => {
        setSelectedImage(null);
        setRecordedAudioUri(null);
    };

    const playAudio = async (uri) => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            await sound.playAsync();
        } catch (error) {
            console.error("Error playing audio", error);
        }
    };

    const sendMessage = async () => {
        const activeUser = user || userData;
        if ((!inputText.trim() && !selectedImage && !recordedAudioUri) || !activeUser) return;
        setIsUploading(true);

        const hasAttachment = selectedImage || recordedAudioUri;

        if (hasAttachment) {
            // Use REST API for attachments since socket only accepts text
            const formData = new FormData();
            formData.append("chatRoomId", chatRoomId);
            if (inputText.trim()) {
                formData.append("text", inputText.trim());
            }

            if (selectedImage) {
                const filename = selectedImage.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append("image", { uri: selectedImage, name: filename, type });
            }

            if (recordedAudioUri) {
                const filename = recordedAudioUri.split("/").pop();
                formData.append("audio", { uri: recordedAudioUri, name: filename || "audio.m4a", type: "audio/m4a" });
            }

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    body: formData,
                });
                const result = await response.json();

                if (result.success) {
                    // Optimistically add to UI, but other users might need to refresh unless we poll
                    setMessages((prev) => [...prev, {
                        ...result.data,
                        user: { _id: activeUser._id, name: activeUser.name }
                    }]);
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                }
            } catch (error) {
                console.error("Failed to upload media message", error);
            }
        } else {
            // Socket emission for text-only messages
            const messageData = {
                chatRoomId: chatRoomId,
                regionName: regionName || "Unknown",
                district: activeUser.district || "DefaultDistrict",
                userId: activeUser._id,
                userName: activeUser.name || "Unknown User",
                text: inputText.trim(),
            };
            console.log("Emitting message: ", messageData);
            socketRef.current.emit("sendMessage", messageData);
        }

        setInputText("");
        setSelectedImage(null);
        setRecordedAudioUri(null);
        setIsUploading(false);
    };

    const formatMediaUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        // Ensure starting slash
        const path = url.startsWith("/") ? url : `/${url}`;
        return `http://${IP_ADDRESS}:3000${path}`;
    };

    const renderMessage = ({ item }) => {
        const activeUser = user || userData;
        const senderId = typeof item.user === "object" ? item.user?._id : (item.user || item.userId);
        const isMyMessage = senderId === activeUser?._id;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessage : styles.otherMessage,
                ]}
            >
                {!isMyMessage && (
                    <Text style={styles.senderName}>{item.userName || item.user?.name}</Text>
                )}

                {item.attachments?.map((att, idx) => {
                    if (att.fileType === "image") {
                        return (
                            <Image
                                key={idx}
                                source={{ uri: formatMediaUrl(att.fileUrl) }}
                                style={styles.messageImage}
                                contentFit="cover"
                            />
                        );
                    } else if (att.fileType === "audio") {
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={styles.audioButton}
                                onPress={() => playAudio(formatMediaUrl(att.fileUrl))}
                            >
                                <Ionicons name="play-circle" size={24} color={isMyMessage ? "#fff" : Color.primary} />
                                <Text style={[styles.audioText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
                                    Play Audio
                                </Text>
                            </TouchableOpacity>
                        );
                    }
                    return null;
                })}

                {!!item.text && (
                    <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
                        {item.text}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: regionName || "Community Chat", headerBackTitle: "Back" }} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={Color.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {/* Attachment Previews */}
                {(selectedImage || recordedAudioUri) && (
                    <View style={styles.attachmentPreviewContainer}>
                        {selectedImage && (
                            <View>
                                <Image source={{ uri: selectedImage }} style={styles.previewImage} contentFit="cover" />
                                <TouchableOpacity style={styles.removeAttachmentBtn} onPress={removeAttachment}>
                                    <Ionicons name="close-circle" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {recordedAudioUri && (
                            <View style={styles.audioPreview}>
                                <Ionicons name="mic" size={20} color={Color.primary} />
                                <Text style={styles.audioPreviewText}>Audio Recorded</Text>
                                <TouchableOpacity style={styles.removeAttachmentBtn2} onPress={removeAttachment}>
                                    <Ionicons name="close-circle" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                        <Ionicons name="image" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.attachBtn}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                    >
                        <Ionicons name="mic" size={24} color={recording ? "red" : "#666"} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder={recording ? "Recording..." : "Type a message..."}
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!recording}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, isUploading && { opacity: 0.5 }]}
                        onPress={sendMessage}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color={Color.white} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F0F2F5",
    },
    container: {
        flex: 1,
        backgroundColor: "#F0F2F5",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        maxWidth: "80%",
        marginVertical: 4,
        padding: 12,
        borderRadius: 16,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: Color.primary,
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: Color.white,
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontSize: 12,
        color: "#65676B",
        marginBottom: 4,
        fontWeight: "600",
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: Color.white,
    },
    otherMessageText: {
        color: "#1c1e21",
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 4,
    },
    audioButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 8,
    },
    audioText: {
        fontSize: 14,
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        padding: 12,
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        backgroundColor: Color.white,
        alignItems: "flex-end",
        borderTopWidth: 1,
        borderColor: "#E5E5E5",
    },
    input: {
        flex: 1,
        backgroundColor: "#F0F2F5",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 16,
        maxHeight: 100,
        minHeight: 40,
    },
    sendButton: {
        backgroundColor: Color.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    attachBtn: {
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    attachmentPreviewContainer: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#E5E5E5",
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    removeAttachmentBtn: {
        position: "absolute",
        top: -8,
        right: 4,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    audioPreview: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F2F5",
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    audioPreviewText: {
        color: "#333",
        fontWeight: "500",
    },
    removeAttachmentBtn2: {
        marginLeft: 8,
    }
});
