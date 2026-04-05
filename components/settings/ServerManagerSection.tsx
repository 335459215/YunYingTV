import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Alert, FlatList, Pressable, ActivityIndicator, Keyboard } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import useAuthStore from "@/stores/authStore";
import useHomeStore from "@/stores/homeStore";
import { StyledButton } from "@/components/StyledButton";
import { Server } from "@/services/storage";
import { api } from "@/services/api";
import Toast from "react-native-toast-message";
import { Check } from 'lucide-react-native';

interface ServerManagerSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

export const ServerManagerSection: React.FC<ServerManagerSectionProps> = React.memo(({ onChanged, onFocus }) => {
  const { 
    servers, 
    currentServer,
    accounts,
    serverConfig,
    addServer, 
    updateServer,
    deleteServer, 
    setActiveServer,
    addAccount,
    updateAccount,
    fetchServerConfig
  } = useSettingsStore();
  
  const { isLoggedIn } = useAuthStore();
  const { refreshPlayRecords } = useHomeStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // 表单状态
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (editingServer && !isAddingNew) {
      setServerName(editingServer.name);
      setServerUrl(editingServer.url);
      const account = useSettingsStore.getState().accounts.find(a => a.serverId === editingServer.id);
      setAccountName(account?.name || "");
      setUsername(account?.username || "");
      setPassword("");
    }
  }, [editingServer, isAddingNew]);

  const handleAddServer = () => {
    setIsAddingNew(true);
    setEditingServer(null);
    setServerName("");
    setServerUrl("");
    setAccountName("");
    setUsername("");
    setPassword("");
    setShowEditModal(true);
  };

  const handleEditServer = (server: Server) => {
    setIsAddingNew(false);
    setEditingServer(server);
    setShowEditModal(true);
  };

  const extractNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      return urlObj.hostname;
    } catch {
      return url.split('/')[0] || url;
    }
  };

  const handleSaveServer = async () => {
    if (!serverUrl.trim()) {
      Alert.alert("错误", "请输入服务器地址");
      return;
    }

    const finalName = serverName.trim() || extractNameFromUrl(serverUrl.trim());
    
    try {
      if (isAddingNew) {
        const newServer = await addServer({ 
          name: finalName, 
          url: serverUrl.trim() 
        });
        
        // 如果填写了账号信息，自动添加账号
        if (username.trim() && password.trim()) {
          await addAccount({
            serverId: newServer.id,
            username: username.trim(),
            password: password.trim(),
            name: accountName.trim() || undefined,
          });
        }
        
        // 自动切换到新服务器
        await setActiveServer(newServer.id);
      } else if (editingServer) {
        await updateServer(editingServer.id, {
          name: finalName,
          url: serverUrl.trim(),
        });
        
        // 更新或添加账号
        if (username.trim() && password.trim()) {
          const existingAccount = accounts.find(a => a.serverId === editingServer.id);
          
          if (existingAccount) {
            await updateAccount(existingAccount.id, {
              username: username.trim(),
              password: password.trim(),
              name: accountName.trim() || undefined,
            });
          } else {
            await addAccount({
              serverId: editingServer.id,
              username: username.trim(),
              password: password.trim(),
              name: accountName.trim() || undefined,
            });
          }
        }
      }

      setShowEditModal(false);
      setEditingServer(null);
      onChanged();
      
      Toast.show({ type: "success", text1: isAddingNew ? "服务器添加成功" : "服务器更新成功" });
    } catch (error) {
      Alert.alert("错误", error instanceof Error ? error.message : "操作失败");
    }
  };

  const handleLogin = async () => {
    if (!currentServer && !editingServer) {
      Toast.show({ type: "error", text1: "请先保存服务器" });
      return;
    }

    const targetServer = editingServer || currentServer;
    if (!targetServer) return;

    const isLocalStorage = serverConfig?.StorageType === "localstorage";
    if (!password || (!isLocalStorage && !username)) {
      Toast.show({ type: "error", text1: "请输入用户名和密码" });
      return;
    }

    setIsLoggingIn(true);
    try {
      // 如果正在编辑且URL变了，先更新API base URL
      if (editingServer && editingServer.url !== serverUrl.trim()) {
        api.setBaseUrl(serverUrl.trim());
      }
      
      await api.login(isLocalStorage ? undefined : username, password);
      
      const authState = useAuthStore.getState();
      await authState.checkLoginStatus(targetServer.url);
      
      if (useAuthStore.getState().isLoggedIn) {
        await refreshPlayRecords();
        Toast.show({ type: "success", text1: "登录成功" });
        Keyboard.dismiss();
        
        // 如果在编辑模式下，保存账号信息
        if (editingServer || currentServer) {
          const serverId = editingServer?.id || currentServer?.id;
          if (serverId) {
            const accounts = useSettingsStore.getState().accounts;
            const serverAccounts = accounts.filter(a => a.serverId === serverId);
            
            if (serverAccounts.length > 0) {
              await updateAccount(serverAccounts[0].id, {
                username: username.trim(),
                password: password.trim(),
                name: accountName.trim() || undefined,
              });
            } else {
              await addAccount({
                serverId,
                username: username.trim(),
                password: password.trim(),
                name: accountName.trim() || undefined,
              });
            }
          }
        }
        
        setShowEditModal(false);
        onChanged();
      } else {
        Toast.show({ type: "error", text1: "登录失败，请检查账号密码" });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "登录失败",
        text2: error instanceof Error ? error.message : "用户名或密码错误",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDeleteServer = (server: Server) => {
    Alert.alert(
      "确认删除",
      `确定要删除服务器 "${server.name}" 吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            await deleteServer(server.id);
            onChanged();
          },
        },
      ]
    );
  };

  const handleSetActiveServer = async (serverId: string) => {
    await setActiveServer(serverId);
    await fetchServerConfig();
    onChanged();
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingServer(null);
    setServerName("");
    setServerUrl("");
    setAccountName("");
    setUsername("");
    setPassword("");
  };

  const renderServerItem = ({ item }: { item: Server }) => {
    const isActive = item.isActive;
    const serverAccounts = useSettingsStore.getState().accounts.filter(a => a.serverId === item.id);
    const hasAccount = serverAccounts.length > 0;

    return (
      <View style={[styles.serverItem, isActive && styles.activeServerItem]}>
        <Pressable
          style={styles.serverContent}
          onPress={() => !isActive && handleSetActiveServer(item.id)}
        >
          <View style={styles.serverInfo}>
            <ThemedText style={styles.serverName}>{item.name}</ThemedText>
            <ThemedText style={styles.serverUrl}>{item.url}</ThemedText>
            {hasAccount && (
              <ThemedText style={styles.accountHint}>
                已配置账号: {serverAccounts[0]?.username}
              </ThemedText>
            )}
          </View>
          
          {/* 选中标识 */}
          {isActive && (
            <View style={styles.selectedBadge}>
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </Pressable>

        <View style={styles.serverActions}>
          <StyledButton
            text="编辑"
            onPress={() => handleEditServer(item)}
            variant="primary"
            style={styles.actionButton}
          />
          {!isActive && (
            <StyledButton
              text="切换"
              onPress={() => handleSetActiveServer(item.id)}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
          <StyledButton
            text="删除"
            onPress={() => handleDeleteServer(item)}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SettingsSection focusable onFocus={onFocus}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.sectionTitle}>服务器管理</ThemedText>
          <StyledButton
            text="添加服务器"
            onPress={handleAddServer}
            variant="primary"
            style={styles.addButton}
          />
        </View>

        {servers.length === 0 ? (
          <ThemedText style={styles.emptyText}>暂无服务器，请添加服务器</ThemedText>
        ) : (
          <FlatList
            data={servers}
            renderItem={renderServerItem}
            keyExtractor={(item) => item.id}
            style={styles.serverList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 编辑/添加模态框 */}
        {showEditModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                {isAddingNew ? '添加服务器' : '编辑服务器'}
              </ThemedText>

              {/* 服务器地址 */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>服务器地址 *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="http://或 https://"
                  placeholderTextColor="#888"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* 服务器名称（可选） */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>服务器名称（可选）</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={`留空将使用: ${extractNameFromUrl(serverUrl)}`}
                  placeholderTextColor="#888"
                  value={serverName}
                  onChangeText={setServerName}
                />
              </View>

              {/* 账号配置 */}
              <View style={styles.divider} />
              <ThemedText style={styles.subTitle}>账号配置</ThemedText>

              {/* 账号名称（可选） */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>账号名称（可选）</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="自定义显示名称"
                  placeholderTextColor="#888"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              {/* 用户名 */}
              {(!serverConfig || serverConfig?.StorageType !== "localstorage") && (
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>用户名 *</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入用户名"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              )}

              {/* 密码 */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>密码 *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                />
              </View>

              {/* 当前登录状态 */}
              {(editingServer || currentServer) && isLoggedIn && (
                <View style={styles.loginStatus}>
                  <ThemedText style={styles.loginStatusText}>
                    ✓ 已登录
                  </ThemedText>
                </View>
              )}

              {/* 按钮组 */}
              <View style={styles.modalButtons}>
                <StyledButton
                  text="取消"
                  onPress={handleCloseModal}
                  variant="secondary"
                  style={styles.modalButton}
                />
                
                {isAddingNew ? (
                  <StyledButton
                    text={isLoggingIn ? "" : "添加并登录"}
                    onPress={handleSaveServer}
                    disabled={!serverUrl.trim()}
                    variant="primary"
                    style={styles.modalButton}
                  >
                    {isLoggingIn && <ActivityIndicator color="#fff" />}
                  </StyledButton>
                ) : (
                  <>
                    <StyledButton
                      text="保存"
                      onPress={handleSaveServer}
                      variant="primary"
                      style={styles.modalButtonSmall}
                    />
                    <StyledButton
                      text={isLoggingIn ? "" : "登录"}
                      onPress={handleLogin}
                      disabled={isLoggingIn || !password}
                      variant="primary"
                      style={[styles.modalButtonSmall, styles.loginButton]}
                    >
                      {isLoggingIn && <ActivityIndicator color="#fff" />}
                    </StyledButton>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </SettingsSection>
  );
});

ServerManagerSection.displayName = 'ServerManagerSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 16,
    height: 40,
  },
  serverList: {
    maxHeight: 350,
  },
  serverItem: {
    flexDirection: "column",
    padding: 14,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeServerItem: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  serverContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serverInfo: {
    flex: 1,
    marginRight: 10,
  },
  serverName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#fff",
  },
  serverUrl: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  accountHint: {
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 4,
  },
  selectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  serverActions: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  actionButton: {
    paddingHorizontal: 12,
    height: 34,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  modalContent: {
    backgroundColor: "#222",
    padding: 24,
    borderRadius: 12,
    width: "92%",
    maxWidth: 420,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    color: "#ccc",
    fontWeight: "500",
  },
  input: {
    height: 46,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "white",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 16,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  loginStatus: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  loginStatusText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 8,
  },
  modalButton: {
    flex: 1,
  },
  modalButtonSmall: {
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#22c55e',
  },
});
