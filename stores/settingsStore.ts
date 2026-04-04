import { create } from "zustand";
import { SettingsManager, ServersManager, AccountsManager, Server, Account } from "@/services/storage";
import { api, ServerConfig } from "@/services/api";
import { storageConfig } from "@/services/storageConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/utils/Logger";

const logger = Logger.withTag('SettingsStore');

interface SettingsState {
  apiBaseUrl: string;
  m3uUrl: string;
  remoteInputEnabled: boolean;
  autoContinuePlayback: boolean; // 自动续播开关
  autoSpeedTest: boolean; // 自动测速开关
  autoSwitchSource: boolean; // 自动切换低延迟数据源开关
  videoSource: {
    enabledAll: boolean;
    sources: {
      [key: string]: boolean;
    };
  };
  isModalVisible: boolean;
  serverConfig: ServerConfig | null;
  isLoadingServerConfig: boolean;
  // 服务器和账号管理
  servers: Server[];
  accounts: Account[];
  currentServer: Server | null;
  currentAccount: Account | null;
  // 方法
  loadSettings: () => Promise<void>;
  fetchServerConfig: () => Promise<void>;
  setApiBaseUrl: (url: string) => void;
  setM3uUrl: (url: string) => void;
  setRemoteInputEnabled: (enabled: boolean) => void;
  setAutoContinuePlayback: (enabled: boolean) => void;
  setAutoSpeedTest: (enabled: boolean) => void;
  setAutoSwitchSource: (enabled: boolean) => void;
  saveSettings: () => Promise<void>;
  setVideoSource: (config: { enabledAll: boolean; sources: { [key: string]: boolean } }) => void;
  showModal: () => void;
  hideModal: () => void;
  // 服务器管理方法
  loadServers: () => Promise<void>;
  addServer: (server: Omit<Server, 'id' | 'isActive'>) => Promise<Server>;
  updateServer: (serverId: string, updates: Partial<Server>) => Promise<void>;
  deleteServer: (serverId: string) => Promise<void>;
  setActiveServer: (serverId: string) => Promise<void>;
  // 账号管理方法
  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'isActive'>) => Promise<Account>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  setActiveAccount: (accountId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiBaseUrl: "",
  m3uUrl: "",
  remoteInputEnabled: false,
  autoContinuePlayback: true, // 默认开启自动续播
  autoSpeedTest: true, // 默认开启自动测速
  autoSwitchSource: true, // 默认开启自动切换低延迟数据源
  isModalVisible: false,
  serverConfig: null,
  isLoadingServerConfig: false,
  videoSource: {
    enabledAll: true,
    sources: {},
  },
  // 服务器和账号管理
  servers: [],
  accounts: [],
  currentServer: null,
  currentAccount: null,
  loadSettings: async () => {
    const settings = await SettingsManager.get();
    set({
      apiBaseUrl: settings.apiBaseUrl,
      m3uUrl: settings.m3uUrl,
      remoteInputEnabled: settings.remoteInputEnabled || false,
      autoContinuePlayback: settings.autoContinuePlayback !== false, // 默认开启
      autoSpeedTest: settings.autoSpeedTest !== false, // 默认开启
      autoSwitchSource: settings.autoSwitchSource !== false, // 默认开启
      videoSource: settings.videoSource || {
        enabledAll: true,
        sources: {},
      },
    });
    
    // 加载服务器和账号
    await get().loadServers();
    await get().loadAccounts();
    
    if (settings.apiBaseUrl) {
      api.setBaseUrl(settings.apiBaseUrl);
      await get().fetchServerConfig();
    }
  },
  
  // 加载服务器列表
  loadServers: async () => {
    const servers = await ServersManager.getAll();
    const currentServer = await ServersManager.getActiveServer();
    set({ servers, currentServer });
    
    // 如果有当前服务器，更新 apiBaseUrl
    if (currentServer) {
      set({ apiBaseUrl: currentServer.url });
      api.setBaseUrl(currentServer.url);
    }
  },
  
  // 添加服务器
  addServer: async (server) => {
    const newServer = await ServersManager.add(server);
    await get().loadServers();
    return newServer;
  },
  
  // 更新服务器
  updateServer: async (serverId, updates) => {
    await ServersManager.update(serverId, updates);
    await get().loadServers();
  },
  
  // 删除服务器
  deleteServer: async (serverId) => {
    await ServersManager.delete(serverId);
    await get().loadServers();
  },
  
  // 设置活跃服务器
  setActiveServer: async (serverId) => {
    await ServersManager.setActiveServer(serverId);
    await get().loadServers();
    // 加载对应服务器的账号
    await get().loadAccounts();
  },
  
  // 加载账号列表
  loadAccounts: async () => {
    const accounts = await AccountsManager.getAll();
    const currentServer = get().currentServer;
    let currentAccount = null;
    
    if (currentServer) {
      currentAccount = await AccountsManager.getActiveByServerId(currentServer.id);
    }
    
    set({ accounts, currentAccount });
  },
  
  // 添加账号
  addAccount: async (account) => {
    const newAccount = await AccountsManager.add(account);
    await get().loadAccounts();
    return newAccount;
  },
  
  // 更新账号
  updateAccount: async (accountId, updates) => {
    await AccountsManager.update(accountId, updates);
    await get().loadAccounts();
  },
  
  // 删除账号
  deleteAccount: async (accountId) => {
    await AccountsManager.delete(accountId);
    await get().loadAccounts();
  },
  
  // 设置活跃账号
  setActiveAccount: async (accountId) => {
    await AccountsManager.setActiveAccount(accountId);
    await get().loadAccounts();
  },
  fetchServerConfig: async () => {
    set({ isLoadingServerConfig: true });
    try {
      const config = await api.getServerConfig();
      if (config) {
        storageConfig.setStorageType(config.StorageType);
        set({ serverConfig: config });
      }
    } catch (error) {
      set({ serverConfig: null });
      logger.error("Failed to fetch server config:", error);
    } finally {
      set({ isLoadingServerConfig: false });
    }
  },
  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
  setM3uUrl: (url) => set({ m3uUrl: url }),
  setRemoteInputEnabled: (enabled) => set({ remoteInputEnabled: enabled }),
  setAutoContinuePlayback: (enabled) => set({ autoContinuePlayback: enabled }),
  setAutoSpeedTest: (enabled) => set({ autoSpeedTest: enabled }),
  setAutoSwitchSource: (enabled) => set({ autoSwitchSource: enabled }),
  setVideoSource: (config) => set({ videoSource: config }),
  saveSettings: async () => {
    const { apiBaseUrl, m3uUrl, remoteInputEnabled, autoContinuePlayback, autoSpeedTest, autoSwitchSource, videoSource } = get();
    const currentSettings = await SettingsManager.get();
    const currentApiBaseUrl = currentSettings.apiBaseUrl;
    let processedApiBaseUrl = apiBaseUrl.trim();
    if (processedApiBaseUrl.endsWith("/")) {
      processedApiBaseUrl = processedApiBaseUrl.slice(0, -1);
    }

    if (!/^https?:\/\//i.test(processedApiBaseUrl)) {
      const hostPart = processedApiBaseUrl.split("/")[0];
      // Simple check for IP address format.
      const isIpAddress = /^((\d{1,3}\.){3}\d{1,3})(:\d+)?$/.test(hostPart);
      // Check if the domain includes a port.
      const hasPort = /:\d+/.test(hostPart);

      if (isIpAddress || hasPort) {
        processedApiBaseUrl = "http://" + processedApiBaseUrl;
      } else {
        processedApiBaseUrl = "https://" + processedApiBaseUrl;
      }
    }

    await SettingsManager.save({
      apiBaseUrl: processedApiBaseUrl,
      m3uUrl,
      remoteInputEnabled,
      autoContinuePlayback,
      autoSpeedTest,
      autoSwitchSource,
      videoSource,
    });
    if ( currentApiBaseUrl !== processedApiBaseUrl) {
      await AsyncStorage.setItem('authCookies', '');
    }
    api.setBaseUrl(processedApiBaseUrl);
    // Also update the URL in the state so the input field shows the processed URL
    set({ isModalVisible: false, apiBaseUrl: processedApiBaseUrl });
    await get().fetchServerConfig();
  },
  showModal: () => set({ isModalVisible: true }),
  hideModal: () => set({ isModalVisible: false }),
}));
