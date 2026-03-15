/**
 * API 后端切换组件
 * 允许用户在 OrionTV 和 LunaTV 后端之间切换
 */

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { StyledButton } from "@/components/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { 
  ApiBackendManager, 
  ApiBackendConfig,
  ApiBackendType 
} from "@/services/apiConfig";
import Toast from "react-native-toast-message";

export function BackendSwitcherSection() {
  const [currentBackend, setCurrentBackend] = useState<ApiBackendConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cardBackground");

  useEffect(() => {
    loadCurrentBackend();
  }, []);

  const loadCurrentBackend = async () => {
    try {
      const backend = await ApiBackendManager.getCurrentBackend();
      setCurrentBackend(backend);
    } catch (error) {
      console.error("Load backend failed:", error);
    }
  };

  const handleSwitchBackend = async (type: ApiBackendType) => {
    if (type === currentBackend?.type) {
      return;
    }

    setIsLoading(true);
    try {
      // 提示用户输入后端地址
      Alert.prompt(
        "设置后端地址",
        `请输入 ${type === "lunatv" ? "LunaTV" : "OrionTV"} 后端地址`,
        [
          {
            text: "取消",
            style: "cancel",
          },
          {
            text: "确定",
            onPress: async (baseURL) => {
              if (!baseURL) {
                Alert.alert("错误", "后端地址不能为空");
                return;
              }

              try {
                // 测试连接
                await testConnection(baseURL);
                
                // 切换后端
                await ApiBackendManager.switchBackend(type, baseURL);
                await loadCurrentBackend();
                
                Toast.show({
                  type: "success",
                  text1: "切换成功",
                  text2: `已切换到 ${type === "lunatv" ? "LunaTV" : "OrionTV"} 后端`,
                });

                // 重启应用以应用新配置
                Alert.alert(
                  "提示",
                  "需要重启应用以应用新配置，是否立即重启？",
                  [
                    {
                      text: "稍后",
                      style: "cancel",
                    },
                    {
                      text: "重启",
                      onPress: () => {
                        // 使用 Platform.OS 检查平台并重启
                        if (Platform.OS === "android") {
                          // Android: 使用 NativeModules 重启
                          try {
                            // @ts-ignore - React Native 可能有重启方法
                            global.nativeRestart?.();
                          } catch (e) {
                            Alert.alert("提示", "请手动重启应用");
                          }
                        } else {
                          Alert.alert("提示", "请手动重启应用");
                        }
                      },
                    },
                  ]
                );
              } catch (error: any) {
                Alert.alert("连接失败", error.message || "无法连接到后端服务器");
              }
            },
          },
        ],
        "plain-text",
        type === "lunatv" ? "http://localhost:3000" : currentBackend?.baseURL || "http://localhost:3000"
      );
    } catch (error: any) {
      Alert.alert("切换失败", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (baseURL: string) => {
    try {
      const response = await fetch(`${baseURL}/api/server-config`, {
        method: "GET",
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error: any) {
      throw new Error(`无法连接到服务器：${error.message}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <ThemedText style={styles.title}>API 后端</ThemedText>
      
      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoLabel}>当前后端:</ThemedText>
        <ThemedText style={[styles.infoValue, { 
          color: currentBackend?.type === "lunatv" ? "#4CAF50" : "#2196F3" 
        }]}>
          {currentBackend?.name || "未设置"}
        </ThemedText>
        {currentBackend?.baseURL && (
          <ThemedText style={styles.infoURL}>{currentBackend.baseURL}</ThemedText>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <StyledButton
          title="切换到 OrionTV"
          onPress={() => handleSwitchBackend("oriontv")}
          disabled={isLoading || currentBackend?.type === "oriontv"}
          variant={currentBackend?.type === "oriontv" ? "secondary" : "primary"}
        />
        
        <StyledButton
          title="切换到 LunaTV"
          onPress={() => handleSwitchBackend("lunatv")}
          disabled={isLoading || currentBackend?.type === "lunatv"}
          variant={currentBackend?.type === "lunatv" ? "secondary" : "primary"}
        />
      </View>

      <ThemedText style={styles.description}>
        💡 LunaTV 是基于 Next.js 14 的现代化后端，支持多资源搜索、在线播放、收藏同步等功能
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoURL: {
    fontSize: 12,
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
});
