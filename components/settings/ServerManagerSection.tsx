import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Alert, FlatList, Pressable, ActivityIndicator, Keyboard, Modal } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import useAuthStore from "@/stores/authStore";
import useHomeStore from "@/stores/homeStore";
import { StyledButton } from "@/components/StyledButton";
import { Server } from "@/services/storage";
import { api } from "@/services/api";
import Toast from "react-native-toast-message";
import { Check, ChevronRight, Plus, X, LogIn, Trash2, Pencil } from 'lucide-react-native';

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
  const [showLoginInline, setShowLoginInline] = useState(false);

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
        api.setBaseUrl(serverUrl.trim());

        const newServer = await addServer({
          name: finalName,
          url: serverUrl.trim()
        });

        if (username.trim() && password.trim()) {
          await addAccount({
            serverId: newServer.id,
            username: username.trim(),
            password: password.trim(),
            name: accountName.trim() || undefined,
          });
        }

        await setActiveServer(newServer.id);
        await fetchServerConfig();

        if (username.trim() && password.trim()) {
          try {
            const isLocalStorage = useSettingsStore.getState().serverConfig?.StorageType === "localstorage";
            await api.login(isLocalStorage ? undefined : username, password);

            const authState = useAuthStore.getState();
            await authState.checkLoginStatus(newServer.url);

            if (useAuthStore.getState().isLoggedIn) {
              await refreshPlayRecords();
              Toast.show({ type: "success", text1: "服务器添加并登录成功" });
            } else {
              Toast.show({ type: "warning", text1: "服务器已添加，但登录失败", text2: "请检查账号密码" });
            }
          } catch {
            Toast.show({ type: "warning", text1: "服务器已添加", text2: "登录失败，可稍后重试" });
          }
        } else {
          Toast.show({ type: "success", text1: "服务器添加成功" });
        }
      } else if (editingServer) {
        if (editingServer.url !== serverUrl.trim()) {
          api.setBaseUrl(serverUrl.trim());
        }

        await updateServer(editingServer.id, {
          name: finalName,
          url: serverUrl.trim(),
        });

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

          try {
            const isLocalStorage = useSettingsStore.getState().serverConfig?.StorageType === "localstorage";
            await api.login(isLocalStorage ? undefined : username, password);

            const authState = useAuthStore.getState();
            await authState.checkLoginStatus(serverUrl.trim());

            if (useAuthStore.getState().isLoggedIn) {
              await refreshPlayRecords();
              Toast.show({ type: "success", text1: "服务器更新并登录成功" });
            } else {
              Toast.show({ type: "success", text1: "服务器更新成功" });
            }
          } catch {
            Toast.show({ type: "success", text1: "服务器更新成功" });
          }
        } else {
          Toast.show({ type: "success", text1: "服务器更新成功" });
        }

        await fetchServerConfig();
      }

      setShowEditModal(false);
      setEditingServer(null);
      onChanged();

    } catch (error) {
      Alert.alert("错误", error instanceof Error ? error.message : "操作失败");
    }
  };

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

    setIsLoggingIn(true);
    try {
      await api.login(isLocalStorage ? undefined : username, password);

      const authState = useAuthStore.getState();
      await authState.checkLoginStatus(currentServer.url);

      if (useAuthStore.getState().isLoggedIn) {
        await refreshPlayRecords();
        Toast.show({ type: "success", text1: "登录成功" });
        Keyboard.dismiss();
        setPassword("");
        setShowLoginInline(false);
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
    const targetServer = servers.find(s => s.id === serverId);
    if (targetServer) {
      api.setBaseUrl(targetServer.url);
    }

    await setActiveServer(serverId);

    try {
      await fetchServerConfig();
    } catch {
      Toast.show({ type: "warning", text1: "获取服务器配置失败" });
    }

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
      <View style={styles.listRow}>
        <Pressable
          style={styles.listRowContent}
          onPress={() => !isActive && handleSetActiveServer(item.id)}
        >
          <View style={styles.rowMain}>
            <View style={[styles.rowIndicator, isActive && styles.rowIndicatorActive]} />
            <View style={styles.rowText}>
              <ThemedText style={styles.rowTitle} numberOfLines={1}>{item.name}</ThemedText>
              <ThemedText style={styles.rowSubtitle} numberOfLines={1}>{item.url}</ThemedText>
            </View>
          </View>

          <View style={styles.rowTrailing}>
            {hasAccount && (
              <ThemedText style={styles.accountBadge}>
                {isLoggedIn && isActive ? "已登录" : `${serverAccounts[0]?.username}`}
              </ThemedText>
            )}
            {isActive ? (
              <View style={styles.checkCircle}>
                <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            ) : (
              <ChevronRight size={16} color="#5C6270" />
            )}
          </View>
        </Pressable>

        <View style={styles.rowActions}>
          <Pressable onPress={() => handleEditServer(item)} style={styles.iconBtn}>
            <Pencil size={15} color="#8B919A" />
          </Pressable>
          {!isActive && (
            <Pressable onPress={() => handleDeleteServer(item)} style={styles.iconBtn}>
              <Trash2 size={15} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderListItemSeparator = () => <View style={styles.separator} />;

  return (
    <SettingsSection focusable onFocus={onFocus}>
      <View style={styles.container}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>服务器</ThemedText>
          <Pressable onPress={handleAddServer} style={styles.addBtn}>
            <Plus size={18} color="#00C96B" strokeWidth={2} />
            <ThemedText style={styles.addBtnText}>添加</ThemedText>
          </Pressable>
        </View>

        {/* Server List */}
        {servers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>暂无服务器</ThemedText>
            <Pressable onPress={handleAddServer} style={styles.emptyAddBtn}>
              <Plus size={16} color="#00C96B" />
              <ThemedText style={styles.emptyAddText}>添加第一个服务器</ThemedText>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={servers}
            renderItem={renderServerItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={renderListItemSeparator}
            scrollEnabled={true}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Inline Login - shown when server selected and not logged in */}
        {currentServer && !isLoggedIn && (
          <View style={styles.loginInline}>
            <Pressable
              onPress={() => setShowLoginInline(!showLoginInline)}
              style={styles.loginHeader}
            >
              <LogIn size={15} color="#00C96B" />
              <ThemedText style={styles.loginHeaderText}>登录到 {currentServer.name}</ThemedText>
              <ChevronRight size={14} color="#5C6270"
                style={{ transform: [{ rotate: showLoginInline ? '90deg' : '0deg' }] }}
              />
            </Pressable>

            {showLoginInline && (
              <View style={styles.loginForm}>
                {serverConfig?.StorageType !== "localstorage" && (
                  <TextInput
                    style={styles.input}
                    placeholder="用户名"
                    placeholderTextColor="#5C6270"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="密码"
                  placeholderTextColor="#5C6270"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="go"
                />
                <StyledButton
                  text={isLoggingIn ? "" : "登录"}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                  variant="primary"
                  style={styles.loginBtn}
                >
                  {isLoggingIn && <ActivityIndicator color="#fff" />}
                </StyledButton>
              </View>
            )}
          </View>
        )}

        {/* Logged in indicator */}
        {currentServer && isLoggedIn && (
          <View style={styles.loggedInBar}>
            <View style={styles.loggedInDot} />
            <ThemedText style={styles.loggedInText}>
              已登录 · {currentServer.name}
            </ThemedText>
          </View>
        )}

        {/* Edit/Add Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal}>
            <Pressable style={styles.modalCard} onStartShouldSetResponder={() => true}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {isAddingNew ? '添加服务器' : '编辑服务器'}
                </ThemedText>
                <Pressable onPress={handleCloseModal} style={styles.modalCloseBtn}>
                  <X size={20} color="#8B919A" />
                </Pressable>
              </View>

              {/* Server URL */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>服务器地址</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://example.com"
                  placeholderTextColor="#4A4E56"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Server Name (optional) */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>名称（可选）</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder={`自动使用: ${extractNameFromUrl(serverUrl)}`}
                  placeholderTextColor="#4A4E56"
                  value={serverName}
                  onChangeText={setServerName}
                />
              </View>

              {/* Divider */}
              <View style={styles.modalDivider} />

              {/* Account section */}
              <ThemedText style={styles.subHeader}>账号配置</ThemedText>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>用户名{serverConfig?.StorageType === "localstorage" ? "" : ""}</ThemedText>
                {serverConfig?.StorageType !== "localstorage" ? (
                  <TextInput
                    style={styles.modalInput}
                    placeholder="请输入用户名"
                    placeholderTextColor="#4A4E56"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                ) : (
                  <ThemedText style={styles.fieldHint}>当前使用本地存储模式，无需用户名</ThemedText>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>密码</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="请输入密码"
                  placeholderTextColor="#4A4E56"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                />
              </View>

              {/* Status */}
              {(editingServer || currentServer) && isLoggedIn && (
                <View style={styles.statusBadge}>
                  <Check size={13} color="#22C55E" />
                  <ThemedText style={styles.statusText}>当前已登录</ThemedText>
                </View>
              )}

              {/* Buttons */}
              <View style={styles.modalActions}>
                <Pressable onPress={handleCloseModal} style={styles.cancelBtn}>
                  <ThemedText style={styles.cancelBtnText}>取消</ThemedText>
                </Pressable>
                <StyledButton
                  text={isAddingNew ? "添加" : "保存"}
                  onPress={handleSaveServer}
                  disabled={!serverUrl.trim()}
                  variant="primary"
                  style={styles.confirmBtn}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SettingsSection>
  );
});

ServerManagerSection.displayName = 'ServerManagerSection';

const styles = StyleSheet.create({
  container: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B919A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00C96B",
  },
  list: {},
  listRow: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  listRowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIndicator: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginRight: 12,
  },
  rowIndicatorActive: {
    backgroundColor: "#00C96B",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F0F2F5",
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#5C6270",
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accountBadge: {
    fontSize: 11,
    color: "#00C96B",
    backgroundColor: "rgba(0, 201, 107, 0.10)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00C96B",
    justifyContent: "center",
    alignItems: "center",
  },
  rowActions: {
    flexDirection: "row",
    marginLeft: 8,
    gap: 4,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginLeft: 48,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#5C6270",
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 201, 107, 0.08)",
  },
  emptyAddText: {
    fontSize: 13,
    color: "#00C96B",
    fontWeight: "500",
  },

  loginInline: {
    marginTop: 4,
    marginHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0, 201, 107, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 201, 107, 0.12)",
    overflow: "hidden",
  },
  loginHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  loginHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#F0F2F5",
  },
  loginForm: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  input: {
    height: 42,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 9,
    paddingHorizontal: 14,
    color: "#F0F2F5",
    fontSize: 15,
  },
  loginBtn: {
    marginTop: 4,
  },
  loggedInBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: "rgba(34, 197, 94, 0.07)",
  },
  loggedInDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  loggedInText: {
    fontSize: 13,
    color: "#22C55E",
    fontWeight: "500",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#16171A",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#F0F2F5",
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B919A",
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 13,
    color: "#5C6270",
  },
  modalInput: {
    height: 46,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 11,
    paddingHorizontal: 16,
    color: "#F0F2F5",
    fontSize: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 20,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F0F2F5",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 13,
    color: "#22C55E",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F0F2F5",
  },
  confirmBtn: {
    flex: 1,
  },
});
