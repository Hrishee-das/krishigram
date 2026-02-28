import Color from '@/constants/color';
import { deletePost, likePost, unlikePost } from '@/services/post.api';
import { useAuthStore } from '@/utils/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppText from '../AppText';
import CommentsModal from './CommentsModal';

const { width } = Dimensions.get('window');

export default function PostCard({ post, onDeleteSuccess }) {
  const authorName = post?.user?.name || post?.author?.name || 'Unknown User';
  const rawAuthorPic = post?.user?.profilePic || post?.author?.profilePic || '';
  const hasAuthorPic = Boolean(
    rawAuthorPic && rawAuthorPic.trim() !== '' && rawAuthorPic !== 'https://via.placeholder.com/150'
  );

  // Get first letter for avatar fallback
  const initials = authorName.charAt(0).toUpperCase();

  // Consistent avatar color based on name
  const avatarColors = ['#60ba8a', '#4a90d9', '#e07b54', '#9b59b6', '#e74c3c', '#f39c12'];
  const avatarColor = avatarColors[authorName.charCodeAt(0) % avatarColors.length];

  // Format time ago
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const timeAgo = formatTime(post?.createdAt);

  // Media URL resolution
  let mediaUrl = null;
  if (post?.media && Array.isArray(post.media) && post.media.length > 0) {
    mediaUrl = post.media[0].url || post.media[0].uri;
  } else if (post?.media?.url || post?.media?.uri) {
    mediaUrl = post.media.url || post.media.uri;
  } else if (typeof post?.media === 'string') {
    mediaUrl = post.media;
  }

  const isSuccessStory = post?.postType === 'successStory';
  const isAudioPost = post?.postType === 'audio' || post?.mediaType === 'audio';

  // ─── Auth ─────────────────────────────────────────────────────────────
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?._id || currentUser?.id;
  const currentUserIdStr = String(currentUserId || '');
  const postUserIdStr = String(post?.user?._id || post?.user?.id || post?.user || '');
  const isOwner = currentUserIdStr && currentUserIdStr !== 'undefined' && currentUserIdStr === postUserIdStr;

  // ─── Like state ────────────────────────────────────────────────────────
  const initialIsLiked = Array.isArray(post?.likes)
    ? post.likes.some(
      (id) =>
        id === currentUserId ||
        (typeof id === 'object' && (id._id === currentUserId || id.id === currentUserId))
    )
    : false;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(Array.isArray(post?.likes) ? post.likes.length : 0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeActionQueue = useRef(Promise.resolve());

  // ─── Comment state ─────────────────────────────────────────────────────
  const [comments, setComments] = useState(Array.isArray(post?.comments) ? post.comments : []);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  // ─── Audio state ───────────────────────────────────────────────────────
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [audioProgress, setAudioProgress] = useState(0);
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Sync on prop updates
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(Array.isArray(post?.likes) ? post.likes.length : 0);
    setComments(Array.isArray(post?.comments) ? post.comments : []);
  }, [post?.likes, post?.comments, currentUserId]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // Animate waveform when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(0);
    }
  }, [isPlaying]);

  const formatAudioTime = (millis) => {
    if (!millis) return '0:00';
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
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: mediaUrl },
          { shouldPlay: true, isLooping: false },
          (status) => {
            if (status.isLoaded && status.durationMillis) {
              setAudioDuration(formatAudioTime(status.durationMillis));
              if (status.positionMillis && status.durationMillis) {
                setAudioProgress(status.positionMillis / status.durationMillis);
              }
            }
            if (status.didJustFinish) {
              setIsPlaying(false);
              setAudioProgress(0);
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

  const handleLike = () => {
    const actionIsLike = !isLiked;
    setIsLiked(actionIsLike);
    setLikeCount((prev) => (actionIsLike ? prev + 1 : prev - 1));
    if (actionIsLike) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.35, duration: 120, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
    likeActionQueue.current = likeActionQueue.current.then(async () => {
      try {
        if (post?._id || post?.id) {
          if (actionIsLike) await likePost(post._id || post.id);
          else await unlikePost(post._id || post.id);
        }
      } catch (error) {
        console.log('LIKE ERROR:', error);
      }
    });
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleShare = async () => {
    try {
      const postText = post?.description || post?.title || 'Check out this post on KrishiGram!';
      const shareContent = mediaUrl
        ? `${postText}\n\n${mediaUrl}`
        : postText;
      await Share.share({
        message: shareContent,
        title: 'KrishiGram Post',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleOptionsPress = () => {
    if (!isOwner) return;
    Alert.alert('Post Options', 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Post',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post._id || post.id);
            if (onDeleteSuccess) onDeleteSuccess(post._id || post.id);
          } catch {
            Alert.alert('Error', 'Could not delete post');
          }
        },
      },
    ]);
  };

  // Wave bar heights (6 bars animated)
  const waveHeights = [14, 22, 18, 28, 16, 24];

  return (
    <>
      <View style={styles.card}>

        {/* ── Success Story Banner ── */}
        {isSuccessStory && (
          <View style={styles.storyBanner}>
            <MaterialCommunityIcons name="star-circle" size={14} color="#fff" />
            <AppText style={styles.storyBannerText}>Success Story</AppText>
          </View>
        )}

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Avatar */}
          {hasAuthorPic ? (
            <View style={[styles.avatarRing, { borderColor: avatarColor }]}>
              <Image source={{ uri: rawAuthorPic }} style={styles.avatar} contentFit="cover" />
            </View>
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: avatarColor }]}>
              <AppText style={styles.avatarInitial}>{initials}</AppText>
            </View>
          )}

          {/* Name + meta */}
          <View style={styles.headerText}>
            <AppText style={styles.userName}>{authorName}</AppText>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color="#9ca3af" />
              <AppText style={styles.timeText}>{timeAgo}</AppText>
              {post?.location && (
                <>
                  <View style={styles.dot} />
                  <Ionicons name="location-outline" size={12} color="#9ca3af" />
                  <AppText style={styles.timeText}>{post.location}</AppText>
                </>
              )}
            </View>
          </View>

          {isOwner && (
            <TouchableOpacity
              style={styles.optionsBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={handleOptionsPress}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Post Text ── */}
        {!!(post?.description || post?.title) && (
          <View style={styles.textBlock}>
            <AppText style={styles.postText}>{post?.description || post?.title}</AppText>
          </View>
        )}

        {/* ── Media ── */}
        {mediaUrl && !isAudioPost && (
          <Image source={{ uri: mediaUrl }} style={styles.media} contentFit="cover" />
        )}

        {/* ── Audio Player ── */}
        {mediaUrl && isAudioPost && (
          <View style={styles.audioCard}>
            <TouchableOpacity onPress={toggleAudio} style={styles.audioPlayBtn} activeOpacity={0.8}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.audioMid}>
              <AppText style={styles.audioLabel}>Voice Note</AppText>
              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${audioProgress * 100}%` }]} />
              </View>
              <AppText style={styles.audioDuration}>{audioDuration}</AppText>
            </View>

            {/* Animated waveform */}
            <View style={styles.waveform}>
              {waveHeights.map((h, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveLine,
                    {
                      height: isPlaying
                        ? waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [4, h],
                        })
                        : 4,
                      backgroundColor: isPlaying ? Color.primary : '#d1d5db',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Stats strip ── */}
        <View style={styles.statsStrip}>
          <View style={styles.statLeft}>
            <View style={styles.likesBubble}>
              <Ionicons name="heart" size={11} color="#fff" />
            </View>
            <AppText style={styles.statsText}>{likeCount}</AppText>
          </View>
          <TouchableOpacity onPress={() => setIsCommentsVisible(true)}>
            <AppText style={styles.statsText}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Action Bar ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={21}
                color={isLiked ? '#e74c3c' : '#6b7280'}
              />
            </Animated.View>
            <AppText style={[styles.actionText, isLiked && { color: '#e74c3c' }]}>Like</AppText>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsCommentsVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <AppText style={styles.actionText}>Comment</AppText>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={20} color="#6b7280" />
            <AppText style={styles.actionText}>Share</AppText>
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: '#fff',
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },

  /* ── Success story banner ── */
  storyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  storyBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    padding: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 20 },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerText: { flex: 1 },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 2,
  },
  optionsBtn: { padding: 4 },

  /* ── Text ── */
  textBlock: { paddingHorizontal: 14, paddingBottom: 12 },
  postText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 23,
    fontWeight: '400',
  },

  /* ── Media ── */
  media: {
    width: '100%',
    height: width * 0.72,
    backgroundColor: '#f3f4f6',
  },

  /* ── Audio player ── */
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 12,
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Color.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  audioMid: { flex: 1 },
  audioLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Color.primary,
    borderRadius: 2,
  },
  audioDuration: { fontSize: 11, color: '#9ca3af' },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 32,
  },
  waveLine: { width: 3, borderRadius: 2 },

  /* ── Stats ── */
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likesBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: { color: '#6b7280', fontSize: 13, fontWeight: '500' },

  /* ── Divider ── */
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 14 },

  /* ── Actions ── */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#f3f4f6',
  },
});
