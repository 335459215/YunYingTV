import React, { forwardRef } from "react";
import { Animated, Pressable, StyleSheet, StyleProp, ViewStyle, PressableProps, TextStyle, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useButtonAnimation } from "@/hooks/useAnimation";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTextStyles } from "@/hooks/useTextStyles";

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
    
    const borderColor = useThemeColor({}, "border");
    const textColor = useThemeColor({}, "text");
    const primaryColor = useThemeColor({}, "primary");
    const backgroundColor = useThemeColor({}, "background");
    const linkColor = useThemeColor({}, "link");
    const tintColor = useThemeColor({}, "primary");
    const errorColor = useThemeColor({}, "error");

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
          backgroundColor: borderColor,
        },
        text: {
          color: textColor,
        },
        selectedButton: {
          backgroundColor: primaryColor,
        },
        focusedButton: {
          borderColor: primaryColor,
          backgroundColor: "rgba(74, 158, 255, 0.15)",
        },
        selectedText: {
          color: Colors.dark.text,
        },
      },
      primary: {
        button: {
          backgroundColor: "transparent",
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: primaryColor,
          borderColor: backgroundColor,
        },
        selectedButton: {
          backgroundColor: primaryColor,
        },
        selectedText: {
          color: linkColor,
        },
      },
      ghost: {
        button: {
          backgroundColor: "transparent",
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: "rgba(74, 158, 255, 0.2)",
          borderColor: primaryColor,
        },
        selectedButton: {},
        selectedText: {},
      },
      secondary: {
        button: {
          backgroundColor: "rgba(119, 119, 119, 0.3)",
        },
        text: {
          color: textColor,
        },
        focusedButton: {
          backgroundColor: "rgba(119, 119, 119, 0.5)",
          borderColor: primaryColor,
        },
        selectedButton: {
          backgroundColor: "rgba(119, 119, 119, 0.5)",
        },
        selectedText: {
          color: textColor,
        },
      },
      danger: {
        button: {
          backgroundColor: "rgba(220, 53, 69, 0.2)",
        },
        text: {
          color: errorColor,
        },
        focusedButton: {
          backgroundColor: "rgba(220, 53, 69, 0.3)",
          borderColor: errorColor,
        },
        selectedButton: {
          backgroundColor: "rgba(220, 53, 69, 0.3)",
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
        borderRadius: isTV ? 12 : 8,
        borderWidth: isTV ? 3 : 2,
        borderColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        minWidth: isTV ? 120 : 80,
        minHeight: isTV ? 56 : 44,
      },
      focusedButton: {
        backgroundColor: "rgba(74, 158, 255, 0.2)",
        borderColor: primaryColor,
        elevation: 8,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isTV ? 0.8 : 0.5,
        shadowRadius: isTV ? 20 : 15,
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
        color: Colors.dark.text,
      },
    });

    const androidRippleColor = isTV ? "rgba(74, 158, 255, 0.3)" : "rgba(255, 255, 255, 0.3)";

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
              opacity: 0.8,
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
                isFocused && { color: Colors.dark.text },
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
