import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import { StyledButton } from "@/components/StyledButton";
import { Server } from "@/services/storage";
interface ServerManagerSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

export const ServerManagerSection: React.FC<ServerManagerSectionProps> = React.memo(({ onChanged, onFocus }) => {
  const { servers, addServer, deleteServer, setActiveServer } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");

  const handleAddServer = async () => {
    if (!newServerName.trim() || !newServerUrl.trim()) {
      Alert.alert("错误", "请输入服务器名称和地址");
      return;
    }

    await addServer({ name: newServerName.trim(), url: newServerUrl.trim() });
    setNewServerName("");
    setNewServerUrl("");
    setShowAddModal(false);
    onChanged();
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
    onChanged();
  };

  const renderServerItem = ({ item }: { item: Server }) => (
    <View style={styles.serverItem}>
      <View style={styles.serverInfo}>
        <ThemedText style={styles.serverName}>{item.name}</ThemedText>
        <ThemedText style={styles.serverUrl}>{item.url}</ThemedText>
      </View>
      <View style={styles.serverActions}>
        <StyledButton
          text={item.isActive ? "当前" : "切换"}
          onPress={() => !item.isActive && handleSetActiveServer(item.id)}
          variant={item.isActive ? "secondary" : "primary"}
          style={styles.actionButton}
          disabled={item.isActive}
        />
        <StyledButton
          text="删除"
          onPress={() => handleDeleteServer(item)}
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
          <ThemedText style={styles.sectionTitle}>服务器管理</ThemedText>
          <StyledButton
            text="添加服务器"
            onPress={() => setShowAddModal(true)}
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

        {showAddModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>添加服务器</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="服务器名称"
                placeholderTextColor="#888"
                value={newServerName}
                onChangeText={setNewServerName}
              />
              <TextInput
                style={styles.input}
                placeholder="服务器地址"
                placeholderTextColor="#888"
                value={newServerUrl}
                onChangeText={setNewServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <StyledButton
                  text="取消"
                  onPress={() => {
                    setShowAddModal(false);
                    setNewServerName("");
                    setNewServerUrl("");
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <StyledButton
                  text="添加"
                  onPress={handleAddServer}
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
    maxHeight: 300,
  },
  serverItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 10,
  },
  serverInfo: {
    flex: 1,
    marginRight: 10,
  },
  serverName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  serverUrl: {
    fontSize: 12,
    color: "#ccc",
  },
  serverActions: {
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
  input: {
    height: 48,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "white",
    marginBottom: 12,
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
