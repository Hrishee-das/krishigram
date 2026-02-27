import Color from '@/constants/color';
import { deletePost, likePost, unlikePost } from '@/services/post.api';
import { useAuthStore } from '@/utils/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../AppText';
import CommentsModal from './CommentsModal';

export default function PostCard({ post, onDeleteSuccess }) {
  const authorName = post?.user?.name || post?.author?.name || 'Unknown User';
  const authorPic = post?.user?.profilePic || post?.author?.profilePic || 'https://via.placeholder.com/150';
  
  // Format createdAt securely
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const timeAgo = formatTime(post?.createdAt);
  
  // Try to safely access media depending on backend response format
  let mediaUrl = null;
  if (post?.media && Array.isArray(post.media) && post.media.length > 0) {
    mediaUrl = post.media[0].url || post.media[0].uri;
  } else if (post?.media?.url || post?.media?.uri) {
    mediaUrl = post.media.url || post.media.uri;
  } else if (typeof post?.media === 'string') {
    mediaUrl = post.media;
  }

  const isSuccessStory = post?.postType === 'successStory';

  // ─── Like System State ──────────────────────────────────────────────
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?._id || currentUser?.id;
  
  // Initialize 'isLiked' based on whether currentUserId is in 'post.likes'
  const initialIsLiked = Array.isArray(post?.likes) 
    ? post.likes.some(id => 
        id === currentUserId || 
        (typeof id === 'object' && (id._id === currentUserId || id.id === currentUserId))
      )
    : false;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(Array.isArray(post?.likes) ? post.likes.length : 0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Comment System State ───────────────────────────────────────────
  const [comments, setComments] = useState(Array.isArray(post?.comments) ? post.comments : []);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  // ─── Audio Playback State ───────────────────────────────────────────
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState("0:00");
  const isAudioPost = post?.postType === "audio" || post?.mediaType === "audio";

  const formatAudioTime = (millis) => {
    if (!millis) return "0:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleAudio = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else if (mediaUrl) {
        // Initialize sound
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: mediaUrl },
          { shouldPlay: true },
          (playStatus) => {
            if (playStatus.isLoaded && playStatus.durationMillis) {
              setAudioDuration(formatAudioTime(playStatus.durationMillis));
            }
            if (playStatus.didJustFinish) {
              setIsPlaying(false);
              newSound.setPositionAsync(0);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error playing audio in PostCard:', error);
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // Sync state if 'post' prop updates heavily
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(Array.isArray(post?.likes) ? post.likes.length : 0);
    setComments(Array.isArray(post?.comments) ? post.comments : []);
  }, [post?.likes, post?.comments, currentUserId]);

  const likeActionQueue = useRef(Promise.resolve());

  const handleLike = () => {
    // 1. Optimistic UI update INSTANTLY!
    const actionIsLike = !isLiked;
    setIsLiked(actionIsLike);
    setLikeCount(prev => actionIsLike ? prev + 1 : prev - 1);

    // Bounce animation if liking
    if (actionIsLike) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    }

    // 2. Queue the Backend API calls sequentially to prevent Race Conditions
    likeActionQueue.current = likeActionQueue.current.then(async () => {
      try {
        if (post?._id || post?.id) {
          if (actionIsLike) {
            await likePost(post._id || post.id);
          } else {
            await unlikePost(post._id || post.id);
          }
        }
      } catch (error) {
        console.log("LIKE/UNLIKE ERROR TRACE:", error);
        
        const errMsg = error?.message?.toLowerCase() || "";
        const wasAlreadyLiked = errMsg.includes("already liked");

        // If it's just "already liked", backend state is fine. Otherwise, genuine network failure.
        // We could revert the UI here for genuine failures, but for optimal smooth feel we will just log it.
        // Instagram rarely visibly reverts its heart icon on slow networks natively unless you refresh.
      }
    });
  };

  const handleCommentAdded = (newComment) => {
    // Optimistically add comment to list
    setComments(prev => [...prev, newComment]);
  };

  const currentUserIdStr = String(currentUserId || "");
  const postUserIdStr = String(post?.user?._id || post?.user?.id || post?.user || "");
  const isOwner = currentUserIdStr && currentUserIdStr !== "undefined" && currentUserIdStr === postUserIdStr;

  useEffect(() => {
    console.log("PostCard Ownership Check:", {
      postId: post?._id || post?.id,
      currentUserIdStr,
      postUserIdStr,
      isOwner,
      postUserRaw: post?.user
    });
  }, [currentUserIdStr, postUserIdStr, isOwner, post?._id]);

  const handleOptionsPress = () => {
    if (isOwner) {
      Alert.alert(
        "Post Options",
        "What would you like to do?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete Post", 
            style: "destructive",
            onPress: async () => {
              try {
                await deletePost(post._id || post.id);
                if (onDeleteSuccess) {
                  onDeleteSuccess(post._id || post.id);
                }
              } catch (error) {
                Alert.alert("Error", "Could not delete post");
              }
            }
          }
        ]
      );
    }
  };

  return (
    <>
      <View style={styles.card}>
        {/* Post Header */}
        <View style={styles.header}>
          <Image source={{ uri: authorPic }} style={styles.profilePic} />
          <View style={styles.headerText}>
            <AppText style={styles.userName}>{authorName}</AppText>
            <View style={styles.metaRow}>
              <AppText style={styles.timeText}>{timeAgo}</AppText>
              <View style={styles.dotSeparator} />
              {isSuccessStory ? (
                <MaterialCommunityIcons name="star-circle" size={14} color="#60ba8a" />
              ) : (
                <Ionicons name="earth" size={12} color="#8E8E93" />
              )}
              {post?.location && (
                <>
                  <View style={styles.dotSeparator} />
                  <AppText style={styles.timeText}>{post.location}</AppText>
                </>
              )}
            </View>
          </View>
          
          {isOwner && (
            <TouchableOpacity 
              style={styles.optionsButton} 
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={handleOptionsPress}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Content */}
        <View style={styles.content}>
          <AppText style={styles.postText}>{post?.description || post?.title || ''}</AppText>
        </View>

        {/* Post Media / Audio Player */}
        {mediaUrl && isAudioPost ? (
          <View style={styles.audioPlayerContainer}>
            <View style={styles.audioPlayerInner}>
              <TouchableOpacity onPress={toggleAudio} style={styles.audioPlayBtn}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.audioInfo}>
                <AppText style={styles.audioTitle}>Voice Note</AppText>
                <AppText style={styles.audioDuration}>{audioDuration}</AppText>
              </View>
              <View style={styles.audioWaveform}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <View 
                    key={i} 
                    style={[styles.waveLine, { height: isPlaying ? 10 + Math.random() * 15 : 6 }]} 
                  />
                ))}
              </View>
            </View>
          </View>
        ) : mediaUrl ? (
          <Image 
            source={{ uri: mediaUrl }} 
            style={styles.postMedia} 
            resizeMode="cover"
          />
        ) : null}

        {/* Interaction Counts */}
        <View style={styles.statsRow}>
          <View style={styles.likesCount}>
            <View style={styles.likeIconBg}>
              <Ionicons name="heart" size={10} color="white" />
            </View>
            <AppText style={styles.statsText}>{likeCount}</AppText>
          </View>
          <TouchableOpacity onPress={() => setIsCommentsVisible(true)}>
            <AppText style={styles.statsText}>{comments.length} comments</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? "#60ba8a" : "#65676B"} 
              />
            </Animated.View>
            <AppText style={[styles.actionText, isLiked && { color: "#60ba8a" }]}>
              Like
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={() => setIsCommentsVisible(true)}>
            <Ionicons name="chatbubble-outline" size={21} color="#65676B" />
            <AppText style={styles.actionText}>Comment</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={21} color="#65676B" />
            <AppText style={styles.actionText}>Share</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Comment Modal Below Card */}
      <CommentsModal 
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        post={post}
        currentComments={comments}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.white,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    // Modern shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#e0ece0',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1c1e21',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C7C7CC',
    marginHorizontal: 6,
  },
  optionsButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postText: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
    fontWeight: '400',
  },
  postMedia: {
    width: '100%',
    height: 320,
    backgroundColor: '#F2F2F7',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  likesCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIconBg: {
    backgroundColor: '#60ba8a', // Krishigram green
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statsText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    marginLeft: 8,
    color: '#65676B',
    fontWeight: '600',
    fontSize: 14,
  },
  audioPlayerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 12,
  },
  audioPlayerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#60ba8a', // Krishigram active color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#60ba8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1e21',
  },
  audioDuration: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 3,
    marginLeft: 10,
  },
  waveLine: {
    width: 3,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
  }
});
