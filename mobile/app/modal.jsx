import { View } from "react-native";
import AppText from "../components/AppText";

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AppText variant="h1">Modal screen</AppText>
    </View>
  );
}
