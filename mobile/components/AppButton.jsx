import { Pressable, StyleSheet } from "react-native";
import Color from "@/constants/color";
import AppText from "./AppText";

const AppButton = ({
  title,
  onPress,
  variant = "primary",
  disabled,
  fullWidth,
  style,
}) => {
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,

        // Handle stretching
        { width: fullWidth ? "100%" : "auto" },

        // Logical styling
        disabled
          ? styles.disabled
          : isOutline
            ? [styles.outline, pressed && styles.outlinePressed]
            : [styles.primary, pressed && styles.primaryPressed],

        style,
      ]}
    >
      <AppText
        variant="regular"
        style={[
          styles.buttonText,
          {
            color: disabled
              ? Color.textSecondary
              : isOutline
                ? Color.primaryDark
                : Color.white,
          },
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  primary: {
    backgroundColor: Color.primary,
  },
  primaryPressed: {
    backgroundColor: Color.primaryDark,
  },
  outline: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Color.primary,
  },
  outlinePressed: {
    backgroundColor: Color.lightGreen,
  },
  disabled: {
    backgroundColor: "#e0e0e0",
    borderWidth: 0,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AppButton;
