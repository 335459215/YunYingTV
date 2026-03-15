import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import { StyledButton } from "@/components/StyledButton";
import { Account } from "@/services/storage";
interface AccountManagerSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

export const AccountManagerSection: React.FC<AccountManagerSectionProps> = ({ onChanged, onFocus }) => {
  const { servers, currentServer, accounts, addAccount, deleteAccount, setActiveAccount } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [selectedServerId, setSelectedServerId] = useState(currentServer?.id || "");

  // 获取当前服务器的账号列表
  const currentServerAccounts = accounts.filter(account => account.serverId === currentServer?.id);

  const handleAddAccount = async () => {
    if (!selectedServerId) {
      Alert.alert("错误", "请选择服务器");
      return;
    }
    if (!newAccountUsername.trim() || !newAccountPassword.trim()) {
      Alert.alert("错误", "请输入用户名和密码");
      return;
    }

    await addAccount({
      serverId: selectedServerId,
      username: newAccountUsername.trim(),
      password: newAccountPassword.trim(),
      name: newAccountName.trim() || `${newAccountUsername.trim()}@${servers.find(s => s.id === selectedServerId)?.name}`,
    });
    setNewAccountName("");
    setNewAccountUsername("");
    setNewAccountPassword("");
    setShowAddModal(false);
    onChanged();
  };

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      "确认删除",
      `确定要删除账号 "${account.name || account.username}" 吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            await deleteAccount(account.id);
            onChanged();
          },
        },
      ]
    );
  };

  const handleSetActiveAccount = async (accountId: string) => {
    await setActiveAccount(accountId);
    onChanged();
  };

  const renderAccountItem = ({ item }: { item: Account }) => (
    <View style={styles.accountItem}>
      <View style={styles.accountInfo}>
        <ThemedText style={styles.accountName}>{item.name || item.username}</ThemedText>
        <ThemedText style={styles.accountUsername}>{item.username}</ThemedText>
      </View>
      <View style={styles.accountActions}>
        <StyledButton
          text={item.isActive ? "当前" : "切换"}
          onPress={() => !item.isActive && handleSetActiveAccount(item.id)}
          variant={item.isActive ? "secondary" : "primary"}
          style={styles.actionButton}
          disabled={item.isActive}
        />
        <StyledButton
          text="删除"
          onPress={() => handleDeleteAccount(item)}
          variant="danger"
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <SettingsSection focusable onFocus={onFocus}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.sectionTitle}>账号管理</ThemedText>
          {servers.length > 0 && (
            <StyledButton
              text="添加账号"
              onPress={() => setShowAddModal(true)}
              variant="primary"
              style={styles.addButton}
            />
          )}
        </View>

        {servers.length === 0 ? (
          <ThemedText style={styles.emptyText}>请先添加服务器</ThemedText>
        ) : currentServerAccounts.length === 0 ? (
          <ThemedText style={styles.emptyText}>暂无账号，请添加账号</ThemedText>
        ) : (
          <FlatList
            data={currentServerAccounts}
            renderItem={renderAccountItem}
            keyExtractor={(item) => item.id}
            style={styles.accountList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {showAddModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>添加账号</ThemedText>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>服务器</ThemedText>
                <View style={styles.serverSelector}>
                  {servers.map((server) => (
                    <StyledButton
                      key={server.id}
                      text={server.name}
                      onPress={() => setSelectedServerId(server.id)}
                      variant={selectedServerId === server.id ? "primary" : "secondary"}
                      style={[
                        styles.serverButton,
                        selectedServerId === server.id && styles.selectedServerButton,
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>账号名称（可选）</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="账号名称"
                  placeholderTextColor="#888"
                  value={newAccountName}
                  onChangeText={setNewAccountName}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>用户名</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="用户名"
                  placeholderTextColor="#888"
                  value={newAccountUsername}
                  onChangeText={setNewAccountUsername}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>密码</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="密码"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={newAccountPassword}
                  onChangeText={setNewAccountPassword}
                />
              </View>
              <View style={styles.modalButtons}>
                <StyledButton
                  text="取消"
                  onPress={() => {
                    setShowAddModal(false);
                    setNewAccountName("");
                    setNewAccountUsername("");
                    setNewAccountPassword("");
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <StyledButton
                  text="添加"
                  onPress={handleAddAccount}
                  variant="primary"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </SettingsSection>
  );
};

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
  accountList: {
    maxHeight: 300,
  },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 10,
  },
  accountInfo: {
    flex: 1,
    marginRight: 10,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  accountUsername: {
    fontSize: 12,
    color: "#ccc",
  },
  accountActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 12,
    height: 36,
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  modalContent: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#ccc",
  },
  input: {
    height: 48,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "white",
  },
  serverSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  serverButton: {
    margin: 4,
    paddingHorizontal: 12,
    height: 36,
  },
  selectedServerButton: {
    backgroundColor: "#3b82f6",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});
