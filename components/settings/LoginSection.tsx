import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, ActivityIndicator, Keyboard } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { StyledButton } from "@/components/StyledButton";
import { useSettingsStore } from "@/stores/settingsStore";
import useAuthStore from "@/stores/authStore";
import useHomeStore from "@/stores/homeStore";
import { api } from "@/services/api";
import Toast from "react-native-toast-message";

interface LoginSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

export const LoginSection: React.FC<LoginSectionProps> = React.memo(({ onChanged, onFocus }) => {
  const { currentServer, currentAccount, serverConfig } = useSettingsStore();
  const { checkLoginStatus } = useAuthStore();
  const { refreshPlayRecords } = useHomeStore();
  const [username, setUsername] = useState(currentAccount?.username || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!currentServer) {
      Toast.show({ type: "error", text1: "请先选择服务器" });
      return;
    }
    
    const isLocalStorage = serverConfig?.StorageType === "localstorage";
    if (!password || (!isLocalStorage && !username)) {
      Toast.show({ type: "error", text1: "请输入用户名和密码" });
      return;
    }
    setIsLoading(true);
    try {
      await api.login(isLocalStorage ? undefined : username, password);
      await checkLoginStatus(currentServer.url);
      await refreshPlayRecords();

      Toast.show({ type: "success", text1: "登录成功" });
      Keyboard.dismiss();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "登录失败",
        text2: error instanceof Error ? error.message : "用户名或密码错误",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation between inputs using returnKeyType
  const handleUsernameSubmit = () => {
    passwordInputRef.current?.focus();
  };

  if (!currentServer) {
    return (
      <SettingsSection focusable onFocus={onFocus}>
        <View style={styles.container}>
          <ThemedText style={styles.sectionTitle}>登录</ThemedText>
          <ThemedText style={styles.emptyText}>请先选择服务器</ThemedText>
        </View>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection focusable onFocus={onFocus}>
      <View style={styles.container}>
        <ThemedText style={styles.sectionTitle}>登录</ThemedText>
        <ThemedText style={styles.serverInfo}>当前服务器: {currentServer.name}</ThemedText>
        
        {serverConfig?.StorageType !== "localstorage" && (
          <TextInput
            style={styles.input}
            placeholder="请输入用户名"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            onSubmitEditing={handleUsernameSubmit}
            blurOnSubmit={false}
          />
        )}
        <TextInput
          ref={passwordInputRef}
          style={styles.input}
          placeholder="请输入密码"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        <StyledButton
          text={isLoading ? "" : "登录"}
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading && <ActivityIndicator color="#fff" />}
        </StyledButton>
      </View>
    </SettingsSection>
  );
});

LoginSection.displayName = 'LoginSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  serverInfo: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "white",
    marginBottom: 12,
  },
  button: {
    width: "100%",
    height: 48,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
});
