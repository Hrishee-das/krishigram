import Color from '@/constants/color';
import { addAudioComment, addComment } from '@/services/post.api';
import { useAuthStore } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppText from '../AppText';

export default function CommentsModal({
  visible,
  onClose,
  post,
  onCommentAdded,
  currentComments
}) {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const myProfilePic = currentUser?.profilePic || "https://via.placeholder.com/150";
  const myName = currentUser?.name || "CurrentUser";

  // Format time utility for comments
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  // ─── Audio Recording State ───
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  // ─── Playback State ───
  const [playingCommentId, setPlayingCommentId] = useState(null);
  const [soundCache, setSoundCache] = useState({});

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordTimer(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    // Cleanup sounds on unmount
    return () => {
      Object.values(soundCache).forEach(sound => sound.unloadAsync());
    };
  }, [soundCache]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setCommentText('');
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    const uri = recording.getURI();
    setRecording(undefined);

    // Construct local payload mimicking a file selection
    const audioData = {
      uri,
      mimeType: "audio/m4a",
      name: "comment_audio.m4a"
    };

    handleAudioSubmit(audioData);
  };

  const cancelRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    setRecording(undefined);
  };

  const handleAudioSubmit = async (audioData) => {
    try {
      setLoading(true);

      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        user: { _id: currentUser?._id, name: myName, profilePic: myProfilePic },
        commentType: "audio",
        media: { uri: audioData.uri },
        createdAt: new Date().toISOString()
      };

      onCommentAdded(optimisticComment);

      if (post?._id || post?.id) {
        await addAudioComment(post._id || post.id, audioData);
      }
    } catch (error) {
      console.error("Failed to post audio comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = async (commentId, audioUri) => {
    try {
      // ── Tapping the SAME comment that is already playing → pause it
      if (playingCommentId === commentId && soundCache[commentId]) {
        await soundCache[commentId].pauseAsync();
        setPlayingCommentId(null);
        return;
      }

      // ── Playing a different comment → pause the current one first
      if (playingCommentId && soundCache[playingCommentId]) {
        await soundCache[playingCommentId].pauseAsync();
        setPlayingCommentId(null);
      }

      // ── Reuse cached sound: seek to 0 then play
      if (soundCache[commentId]) {
        await soundCache[commentId].setPositionAsync(0);
        await soundCache[commentId].playAsync();
        setPlayingCommentId(commentId);
        return;
      }

      // ── First play: load with isLooping: false
      // IMPORTANT: do NOT call any Audio API inside the callback —
      // calling stopAsync/setPositionAsync in didJustFinish restarts playback.
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: false },
        (status) => {
          if (status.didJustFinish) {
            setPlayingCommentId(null);
          }
        }
      );
      setSoundCache(prev => ({ ...prev, [commentId]: newSound }));
      setPlayingCommentId(commentId);
    } catch (err) {
      console.log("Audio playback error:", err);
    }
  };

  const formatRecordTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    Keyboard.dismiss();

    try {
      setLoading(true);

      // Optimistic UI Update locally
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        user: {
          _id: currentUser?._id,
          name: myName,
          profilePic: myProfilePic
        },
        text: commentText,
        createdAt: new Date().toISOString()
      };

      onCommentAdded(optimisticComment);
      const tempText = commentText;
      setCommentText('');

      // Send to API
      if (post?._id || post?.id) {
        await addComment(post._id || post.id, tempText);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Depending on requirement, we could remove the optimistic comment on fail
    } finally {
      setLoading(false);
    }
  };

  const renderComment = ({ item }) => {
    const authorName = item?.user?.name || item?.author?.name || 'Unknown User';
    const authorPic = item?.user?.profilePic || item?.author?.profilePic || 'https://via.placeholder.com/150';

    const isAudio = item?.commentType === "audio";
    let mediaUrl = null;
    if (isAudio && item?.media) {
      mediaUrl = item.media.url || item.media.uri || item.media;
    }

    const isCurrentlyPlaying = playingCommentId === (item._id || item.id);

    return (
      <View style={styles.commentContainer}>
        <Image source={{ uri: authorPic }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>

          {isAudio ? (
            <View style={styles.audioBubble}>
              <TouchableOpacity onPress={() => togglePlayback(item._id || item.id, mediaUrl)} style={styles.audioBubblePlay}>
                <Ionicons name={isCurrentlyPlaying ? "pause" : "play"} size={16} color="#fff" />
              </TouchableOpacity>
              <View style={styles.audioBubbleWaveform}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={[styles.waveLine, { height: isCurrentlyPlaying ? 4 + Math.random() * 8 : 4 }]} />
                ))}
              </View>
              <AppText style={styles.audioBubbleTime}>{formatTime(item.createdAt)}</AppText>
            </View>
          ) : (
            <View style={styles.commentBubble}>
              <AppText style={styles.commentAuthor}>{authorName}</AppText>
              <AppText style={styles.commentText}>{item.text}</AppText>
            </View>
          )}

          {!isAudio && <AppText style={styles.commentTime}>{formatTime(item.createdAt)}</AppText>}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayDismiss} onPress={onClose} activeOpacity={1} />

        <KeyboardAvoidingView
          style={styles.bottomSheet}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Handlebar & Title */}
          <View style={styles.sheetHeader}>
            <View style={styles.handleBar} />
            <AppText style={styles.headerTitle}>Comments</AppText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={26} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={currentComments}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>No comments yet. Be the first!</AppText>
            }
          />

          {/* Input Area */}
          <View style={styles.inputSection}>
            <Image source={{ uri: myProfilePic }} style={styles.inputAvatar} />

            {isRecording ? (
              <View style={[styles.inputWrapper, styles.recordingWrapper]}>
                <View style={styles.recordingStatus}>
                  <View style={styles.recordingDot} />
                  <AppText style={styles.recordingTime}>{formatRecordTime(recordTimer)}</AppText>
                </View>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelRecBtn}>
                  <Ionicons name="trash-outline" size={20} color="#8E8E93" />
                </TouchableOpacity>
                <TouchableOpacity onPress={stopRecordingAndSend} style={styles.sendRecBtn}>
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#8E8E93"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />

                {commentText.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    <Ionicons name="send" size={20} color="#60ba8a" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={startRecording}
                  >
                    <Ionicons name="mic" size={22} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  overlayDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: Color.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    position: 'relative',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1e21',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#e8f5e9',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  commentAuthor: {
    fontWeight: '700',
    fontSize: 13,
    color: '#1c1e21',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 8,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: Color.white,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // notch safe area
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120, // constrain tall multiline inputs
  },
  recordingWrapper: {
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingTime: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelRecBtn: {
    padding: 8,
    marginRight: 4,
  },
  sendRecBtn: {
    backgroundColor: '#60ba8a',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1c1e21',
    minHeight: 24,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
  micButton: {
    marginLeft: 8,
    padding: 4,
  },
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 24,
    alignSelf: 'flex-start',
    maxWidth: 200,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  audioBubblePlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#60ba8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBubbleWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 2,
    height: 16,
  },
  waveLine: {
    width: 2,
    backgroundColor: '#60ba8a',
    borderRadius: 1,
  },
  audioBubbleTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginRight: 8,
  }
});
