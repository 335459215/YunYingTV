import React, { forwardRef } from "react";
import { Animated, Pressable, StyleSheet, StyleProp, ViewStyle, PressableProps, TextStyle, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors, Shadows, BorderRadius } from "@/constants/Colors";
import { useButtonAnimation } from "@/hooks/useAnimation";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTextStyles } from "@/hooks/useTextStyles";
import { useSettingsStore } from "@/stores/settingsStore";

interface StyledButtonProps extends PressableProps {
  children?: React.ReactNode;
  text?: string;
  variant?: "default" | "primary" | "ghost" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const StyledButton = React.memo(forwardRef<View, StyledButtonProps>(
  ({ children, text, variant = "default", size = "medium", isSelected = false, style, textStyle, ...rest }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const animationStyle = useButtonAnimation(isFocused);
    const { deviceType } = useResponsiveLayout();
    const textStyles = useTextStyles();
    const theme = useSettingsStore((state) => state.theme);

    const textColor = useThemeColor({}, "text");
    const primaryColor = useThemeColor({}, "primary");
    const tintColor = useThemeColor({}, "primary");
    const errorColor = useThemeColor({}, "error");
    const ghostBg = useThemeColor({}, "buttonGhost");
    const surfaceElevated = Colors[theme]?.surfaceElevated ?? Colors.dark.surfaceElevated;
    const borderStrong = Colors[theme]?.borderStrong ?? Colors.dark.borderStrong;
    const borderFocus = Colors[theme]?.borderFocus ?? Colors.dark.borderFocus;
    const focusGlow = Colors[theme]?.focusGlow ?? Colors.dark.focusGlow;
    const border = Colors[theme]?.border ?? Colors.dark.border;
    const pressedOverlay = Colors[theme]?.pressedOverlay ?? Colors.dark.pressedOverlay;

    const isTV = deviceType === "tv";

    const sizeStyles = {
      small: {
        paddingHorizontal: isTV ? 16 : 12,
        paddingVertical: isTV ? 8 : 6,
        textSize: textStyles.bodySmall.fontSize,
      },
      medium: {
        paddingHorizontal: isTV ? 24 : 16,
        paddingVertical: isTV ? 14 : 10,
        textSize: isTV ? textStyles.body.fontSize + 2 : textStyles.body.fontSize,
      },
      large: {
        paddingHorizontal: isTV ? 32 : 20,
        paddingVertical: isTV ? 18 : 14,
        textSize: isTV ? textStyles.title3.fontSize + 2 : textStyles.title3.fontSize,
      },
    };

    const variantStyles = {
      default: {
        button: {
          backgroundColor: surfaceElevated,
          borderColor: borderStrong,
        },
        text: {
          color: textColor,
        },
        selectedButton: {
          backgroundColor: primaryColor,
        },
        focusedButton: {
          borderColor: borderFocus,
          backgroundColor: focusGlow,
        },
        selectedText: {
          color: "#ffffff",
        },
      },
      primary: {
        button: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          ...Shadows.dark.focus,
        },
        selectedButton: {
          backgroundColor: primaryColor,
        },
        selectedText: {
          color: "#ffffff",
        },
      },
      ghost: {
        button: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: focusGlow,
          borderColor: borderFocus,
        },
        selectedButton: {},
        selectedText: {},
      },
      secondary: {
        button: {
          backgroundColor: ghostBg,
          borderColor: border,
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: pressedOverlay,
          borderColor: borderFocus,
        },
        selectedButton: {
          backgroundColor: pressedOverlay,
        },
        selectedText: {
          color: textColor,
        },
      },
      danger: {
        button: {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderColor: "rgba(239, 68, 68, 0.20)",
        },
        text: {
          color: errorColor,
        },
        focusedButton: {
          backgroundColor: "rgba(239, 68, 68, 0.25)",
          borderColor: errorColor,
        },
        selectedButton: {
          backgroundColor: "rgba(239, 68, 68, 0.25)",
        },
        selectedText: {
          color: errorColor,
        },
      },
    };

    const styles = StyleSheet.create({
      button: {
        paddingHorizontal: sizeStyles[size].paddingHorizontal,
        paddingVertical: sizeStyles[size].paddingVertical,
        borderRadius: isTV ? BorderRadius.lg : BorderRadius.md,
        borderWidth: isTV ? 1.5 : 1,
        borderColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        minWidth: isTV ? 120 : 80,
        minHeight: isTV ? 56 : 44,
      },
      focusedButton: {
        backgroundColor: focusGlow,
        borderColor: borderFocus,
        ...Shadows.dark.focus,
      },
      selectedButton: {
        backgroundColor: tintColor,
      },
      text: {
        fontSize: sizeStyles[size].textSize,
        fontWeight: isTV ? "600" : "500",
        color: textColor,
      },
      selectedText: {
        color: "#ffffff",
      },
    });

    const androidRippleColor = isTV
      ? "rgba(0, 201, 107, 0.20)"
      : "rgba(255, 255, 255, 0.08)";

    return (
      <Animated.View style={[animationStyle, style]}>
        <Pressable
          android_ripple={{ color: androidRippleColor }}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={({ pressed }) => [
            styles.button,
            variantStyles[variant].button,
            isSelected && variantStyles[variant].selectedButton,
            isFocused && (variantStyles[variant].focusedButton || styles.focusedButton),
            pressed && {
              opacity: 0.85,
              transform: [{ scale: 0.98 }],
            },
          ]}
          {...rest}
        >
          {text ? (
            <ThemedText
              style={[
                styles.text,
                variantStyles[variant].text,
                isSelected && variantStyles[variant].selectedText,
                isFocused && { color: "#ffffff" },
                textStyle,
              ]}
            >
              {text}
            </ThemedText>
          ) : (
            children
          )}
        </Pressable>
      </Animated.View>
    );
  }
));

StyledButton.displayName = "StyledButton";
