import Color from '@/constants/color';
import { useNavigation } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../AppText';

export default function CreatePostCard({ userProfilePic }) {
  const navigation = useNavigation();
  const hasAuthorPic = Boolean(userProfilePic && userProfilePic.trim() !== '' && userProfilePic !== 'https://via.placeholder.com/150');

  return (
    <View style={styles.card}>
      <View style={styles.inputSection}>
        {hasAuthorPic ? (
          <Image
            source={{ uri: userProfilePic }}
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <Ionicons name="person" size={24} color="#60ba8a" />
          </View>
        )}
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => navigation.navigate('create-post')}
          activeOpacity={0.8}
        >
          <AppText style={styles.inputText}>What&apos;s on your mind?</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.white,
    paddingVertical: 14,
    marginBottom: 10,
    marginHorizontal: 12,
    borderRadius: 16,
    // Modern soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e8f5e9', // Subtle green placeholder background
    borderWidth: 1.5,
    borderColor: '#c8e6c9', // Light green border
  },
  profilePicPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e8f5e9',
    borderWidth: 1.5,
    borderColor: '#c8e6c9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputButton: {
    flex: 1,
    backgroundColor: '#f5f9f5', // Very light greenish-gray background
    borderWidth: 1,
    borderColor: '#e0ece0', // Muted green border
    borderRadius: 24, // Fully rounded modern pill shape
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputText: {
    color: '#65676B',
    fontSize: 15,
    fontWeight: '500',
  }
});
