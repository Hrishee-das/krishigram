import { View } from "react-native";
import AppButton from "../../components/AppButton";
import AppText from "../../components/AppText";
import { useAuthStore } from "../../utils/authStore";

export default function TutorialScreen() {
  const { logOut } = useAuthStore();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AppText variant="h1">Video Tutorial Screen</AppText>
      <AppButton title="Log Out" onPress={logOut} />
    </View>
  );
}
