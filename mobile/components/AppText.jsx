import { StyleSheet, Text } from "react-native";
import { FONT_SIZES, FONT_WEIGHTS } from "../constants/typography";

import { NotoSans_400Regular } from "@expo-google-fonts/noto-sans/400Regular";
import { NotoSans_600SemiBold } from "@expo-google-fonts/noto-sans/600SemiBold";
import { NotoSans_700Bold } from "@expo-google-fonts/noto-sans/700Bold";

import { useFonts } from "@expo-google-fonts/noto-sans/useFonts";

const AppText = ({ variant = "regular", children, style, ...props }) => {
  let [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
    NotoSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Text style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "NotoSans_400Regular",
    color: "#000000",
  },
  h1: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: "NotoSans_700Bold",
    lineHeight: 38,
  },
  h2: {
    fontSize: FONT_SIZES.h2,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: "NotoSans_700Bold",
    lineHeight: 30,
  },
  h3: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: "NotoSans_600SemiBold",
    lineHeight: 26,
  },
  h4: {
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: "NotoSans_600SemiBold",
    lineHeight: 24,
  },
  regular: {
    fontSize: FONT_SIZES.regular,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 22,
  },
  small: {
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  xs: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: "#787878",
  },
});

export default AppText;
