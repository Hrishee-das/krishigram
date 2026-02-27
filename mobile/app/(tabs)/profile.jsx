import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import AppButton from "../../components/AppButton";
import AppText from "../../components/AppText";
import LibraryWidget from "../../components/home/LibraryWidget";
import { useAuthStore } from "../../utils/authStore";

export default function ProfileScreen() {
  const { logOut, user } = useAuthStore();
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="h1">{t('profile')}</AppText>
        <AppText variant="body1">{user?.name || t('farmer')}</AppText>
      </View>

      <LibraryWidget />

      <View style={styles.footer}>
        <AppButton title={t('log_out')} onPress={logOut} variant="outline" color="#FF3B30" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 20,
  }
});
