import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, PlayRecord as ApiPlayRecord, Favorite as ApiFavorite } from "./api";
import { storageConfig } from "./storageConfig";
import Logger from '@/utils/Logger';

const logger = Logger.withTag('Storage');

// --- Storage Keys ---  
const STORAGE_KEYS = {
  SETTINGS: "mytv_settings",
  PLAYER_SETTINGS: "mytv_player_settings",
  FAVORITES: "mytv_favorites",
  PLAY_RECORDS: "mytv_play_records",
  SEARCH_HISTORY: "mytv_search_history",
  LOGIN_CREDENTIALS: "mytv_login_credentials",
  SERVERS: "mytv_servers",
  ACCOUNTS: "mytv_accounts",
} as const;

// --- Type Definitions (aligned with api.ts) ---
// Re-exporting for consistency, though they are now primarily API types
export type PlayRecord = ApiPlayRecord & {
  introEndTime?: number;
  outroStartTime?: number;
};
export type Favorite = ApiFavorite;

export interface PlayerSettings {
  introEndTime?: number;
  outroStartTime?: number;
  playbackRate?: number;
}

export interface AppSettings {
  apiBaseUrl: string;
  remoteInputEnabled: boolean;
  videoSource: {
    enabledAll: boolean;
    sources: {
      [key: string]: boolean;
    };
  };
  m3uUrl: string;
  autoContinuePlayback?: boolean;
  autoSpeedTest?: boolean;
  autoSwitchSource?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Server {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
}

export interface Account {
  id: string;
  serverId: string;
  username: string;
  password: string;
  isActive: boolean;
  name?: string;
}

// --- Helper ---
const generateKey = (source: string, id: string) => `${source}+${id}`;

// --- PlayerSettingsManager (Uses AsyncStorage) ---
export class PlayerSettingsManager {
  static async getAll(): Promise<Record<string, PlayerSettings>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.info("Failed to get all player settings:", error);
      return {};
    }
  }

  static async get(source: string, id: string): Promise<PlayerSettings | null> {
    const perfStart = performance.now();
    logger.debug(`[PERF] PlayerSettingsManager.get START - source: ${source}, id: ${id}`);
    
    const allSettings = await this.getAll();
    const result = allSettings[generateKey(source, id)] || null;
    
    const perfEnd = performance.now();
    logger.debug(`[PERF] PlayerSettingsManager.get END - took ${(perfEnd - perfStart).toFixed(2)}ms, found: ${!!result}`);
    
    return result;
  }

  static async save(source: string, id: string, settings: PlayerSettings): Promise<void> {
    const allSettings = await this.getAll();
    const key = generateKey(source, id);
    // Only save if there are actual values to save
    if (settings.introEndTime !== undefined || settings.outroStartTime !== undefined || settings.playbackRate !== undefined) {
      allSettings[key] = { ...allSettings[key], ...settings };
    } else {
      // If all are undefined, remove the key
      delete allSettings[key];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_SETTINGS, JSON.stringify(allSettings));
  }

  static async remove(source: string, id: string): Promise<void> {
    const allSettings = await this.getAll();
    delete allSettings[generateKey(source, id)];
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_SETTINGS, JSON.stringify(allSettings));
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PLAYER_SETTINGS);
  }
}

// --- FavoriteManager (Dynamic: API or LocalStorage) ---
export class FavoriteManager {
  private static getStorageType() {
    return storageConfig.getStorageType();
  }

  static async getAll(): Promise<Record<string, Favorite>> {
    if (this.getStorageType() === "localstorage") {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
        return data ? JSON.parse(data) : {};
      } catch (error) {
        logger.info("Failed to get all local favorites:", error);
        return {};
      }
    }
    return (await api.getFavorites()) as Record<string, Favorite>;
  }

  static async save(source: string, id: string, item: Favorite): Promise<void> {
    const key = generateKey(source, id);
    if (this.getStorageType() === "localstorage") {
      const allFavorites = await this.getAll();
      allFavorites[key] = { ...item, save_time: Date.now() };
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(allFavorites));
      return;
    }
    await api.addFavorite(key, item);
  }

  static async remove(source: string, id: string): Promise<void> {
    const key = generateKey(source, id);
    if (this.getStorageType() === "localstorage") {
      const allFavorites = await this.getAll();
      delete allFavorites[key];
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(allFavorites));
      return;
    }
    await api.deleteFavorite(key);
  }

  static async isFavorited(source: string, id: string): Promise<boolean> {
    const key = generateKey(source, id);
    if (this.getStorageType() === "localstorage") {
      const allFavorites = await this.getAll();
      return !!allFavorites[key];
    }
    const favorite = await api.getFavorites(key);
    return favorite !== null;
  }

  static async toggle(source: string, id: string, item: Favorite): Promise<boolean> {
    const isFav = await this.isFavorited(source, id);
    if (isFav) {
      await this.remove(source, id);
      return false;
    } else {
      await this.save(source, id, item);
      return true;
    }
  }

  static async clearAll(): Promise<void> {
    if (this.getStorageType() === "localstorage") {
      await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES);
      return;
    }
    await api.deleteFavorite();
  }
}

// --- PlayRecordManager (Dynamic: API or LocalStorage) ---
export class PlayRecordManager {
  private static getStorageType() {
    return storageConfig.getStorageType();
  }

  static async getAll(): Promise<Record<string, PlayRecord>> {
    const perfStart = performance.now();
    const storageType = this.getStorageType();
    logger.debug(`[PERF] PlayRecordManager.getAll START - storageType: ${storageType}`);
    
    let apiRecords: Record<string, PlayRecord> = {};
    if (storageType === "localstorage") {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAY_RECORDS);
        apiRecords = data ? JSON.parse(data) : {};
      } catch (error) {
        logger.info("Failed to get all local play records:", error);
        return {};
      }
    } else {
      const apiStart = performance.now();
      logger.debug(`[PERF] API getPlayRecords START`);
      
      apiRecords = await api.getPlayRecords();
      
      const apiEnd = performance.now();
      logger.debug(`[PERF] API getPlayRecords END - took ${(apiEnd - apiStart).toFixed(2)}ms, records: ${Object.keys(apiRecords).length}`);
    }

    const localSettings = await PlayerSettingsManager.getAll();
    const mergedRecords: Record<string, PlayRecord> = {};
    for (const key in apiRecords) {
      mergedRecords[key] = {
        ...apiRecords[key],
        ...localSettings[key],
      };
    }
    
    const perfEnd = performance.now();
    logger.debug(`[PERF] PlayRecordManager.getAll END - took ${(perfEnd - perfStart).toFixed(2)}ms, total records: ${Object.keys(mergedRecords).length}`);
    
    return mergedRecords;
  }

  static async save(source: string, id: string, record: Omit<PlayRecord, "save_time">): Promise<void> {
    const key = generateKey(source, id);
    const { introEndTime, outroStartTime, ...apiRecord } = record;

    // Player settings are always saved locally
    await PlayerSettingsManager.save(source, id, { introEndTime, outroStartTime });

    if (this.getStorageType() === "localstorage") {
      const allRecords = await this.getAll();
      const fullRecord = { ...apiRecord, save_time: Date.now() };
      allRecords[key] = { ...allRecords[key], ...fullRecord };
      await AsyncStorage.setItem(STORAGE_KEYS.PLAY_RECORDS, JSON.stringify(allRecords));
    } else {
      await api.savePlayRecord(key, apiRecord);
    }
  }

  static async get(source: string, id: string): Promise<PlayRecord | null> {
    const perfStart = performance.now();
    const key = generateKey(source, id);
    const storageType = this.getStorageType();
    logger.debug(`[PERF] PlayRecordManager.get START - source: ${source}, id: ${id}, storageType: ${storageType}`);
    
    const records = await this.getAll();
    const result = records[key] || null;
    
    const perfEnd = performance.now();
    logger.debug(`[PERF] PlayRecordManager.get END - took ${(perfEnd - perfStart).toFixed(2)}ms, found: ${!!result}`);
    
    return result;
  }

  static async remove(source: string, id: string): Promise<void> {
    const key = generateKey(source, id);
    await PlayerSettingsManager.remove(source, id); // Always remove local settings

    if (this.getStorageType() === "localstorage") {
      const allRecords = await this.getAll();
      delete allRecords[key];
      await AsyncStorage.setItem(STORAGE_KEYS.PLAY_RECORDS, JSON.stringify(allRecords));
    } else {
      await api.deletePlayRecord(key);
    }
  }

  static async clearAll(): Promise<void> {
    await PlayerSettingsManager.clearAll(); // Always clear local settings

    if (this.getStorageType() === "localstorage") {
      await AsyncStorage.removeItem(STORAGE_KEYS.PLAY_RECORDS);
    } else {
      await api.deletePlayRecord();
    }
  }
}

// --- SearchHistoryManager (Dynamic: API or LocalStorage) ---
export class SearchHistoryManager {
  private static getStorageType() {
    return storageConfig.getStorageType();
  }

  static async get(): Promise<string[]> {
    if (this.getStorageType() === "localstorage") {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        logger.info("Failed to get local search history:", error);
        return [];
      }
    }
    return api.getSearchHistory();
  }

  static async add(keyword: string): Promise<void> {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    if (this.getStorageType() === "localstorage") {
      let history = await this.get();
      history = [trimmed, ...history.filter((k) => k !== trimmed)].slice(0, 20); // Keep latest 20
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
      return;
    }
    await api.addSearchHistory(trimmed);
  }

  static async clear(): Promise<void> {
    if (this.getStorageType() === "localstorage") {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      return;
    }
    await api.deleteSearchHistory();
  }
}

// --- SettingsManager (Uses AsyncStorage) ---
export class SettingsManager {
  static async get(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      apiBaseUrl: "",
      remoteInputEnabled: true,
      videoSource: {
        enabledAll: true,
        sources: {},
      },
      m3uUrl: "",
    };
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      logger.info("Failed to get settings:", error);
      return defaultSettings;
    }
  }

  static async save(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  }

  static async reset(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}

// --- LoginCredentialsManager (Uses AsyncStorage) ---  
export class LoginCredentialsManager {
  static async get(): Promise<LoginCredentials | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGIN_CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.info("Failed to get login credentials:", error);
      return null;
    }
  }

  static async save(credentials: LoginCredentials): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOGIN_CREDENTIALS, JSON.stringify(credentials));
    } catch (error) {
      logger.error("Failed to save login credentials:", error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGIN_CREDENTIALS);
    } catch (error) {
      logger.error("Failed to clear login credentials:", error);
    }
  }
}

// --- ServersManager (Uses AsyncStorage) ---  
export class ServersManager {
  static async getAll(): Promise<Server[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.info("Failed to get servers:", error);
      return [];
    }
  }

  static async getActiveServer(): Promise<Server | null> {
    const servers = await this.getAll();
    return servers.find(server => server.isActive) || null;
  }

  static async save(servers: Server[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(servers));
    } catch (error) {
      logger.error("Failed to save servers:", error);
    }
  }

  static async add(server: Omit<Server, 'id' | 'isActive'>): Promise<Server> {
    const servers = await this.getAll();
    const newServer: Server = {
      ...server,
      id: Date.now().toString(),
      isActive: servers.length === 0, // First server is active by default
    };
    
    // If this is not the first server, make sure only one is active
    if (servers.length > 0) {
      newServer.isActive = false;
    }
    
    await this.save([...servers, newServer]);
    return newServer;
  }

  static async update(serverId: string, updates: Partial<Server>): Promise<void> {
    const servers = await this.getAll();
    const updatedServers = servers.map(server => {
      if (server.id === serverId) {
        // If setting isActive to true, deactivate all others
        if (updates.isActive) {
          return { ...server, ...updates, isActive: true };
        }
        return { ...server, ...updates };
      }
      // If another server is being activated, deactivate this one
      if (updates.isActive) {
        return { ...server, isActive: false };
      }
      return server;
    });
    await this.save(updatedServers);
  }

  static async delete(serverId: string): Promise<void> {
    const servers = await this.getAll();
    const filteredServers = servers.filter(server => server.id !== serverId);
    
    // If the deleted server was active, activate the first remaining server
    if (filteredServers.length > 0 && servers.some(server => server.id === serverId && server.isActive)) {
      filteredServers[0].isActive = true;
    }
    
    await this.save(filteredServers);
  }

  static async setActiveServer(serverId: string): Promise<void> {
    await this.update(serverId, { isActive: true });
  }
}

// --- AccountsManager (Uses AsyncStorage) ---  
export class AccountsManager {
  static async getAll(): Promise<Account[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.info("Failed to get accounts:", error);
      return [];
    }
  }

  static async getByServerId(serverId: string): Promise<Account[]> {
    const accounts = await this.getAll();
    return accounts.filter(account => account.serverId === serverId);
  }

  static async getActiveByServerId(serverId: string): Promise<Account | null> {
    const accounts = await this.getByServerId(serverId);
    return accounts.find(account => account.isActive) || null;
  }

  static async save(accounts: Account[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (error) {
      logger.error("Failed to save accounts:", error);
    }
  }

  static async add(account: Omit<Account, 'id' | 'isActive'>): Promise<Account> {
    const accounts = await this.getAll();
    const serverAccounts = accounts.filter(a => a.serverId === account.serverId);
    
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      isActive: serverAccounts.length === 0, // First account for server is active by default
    };
    
    await this.save([...accounts, newAccount]);
    return newAccount;
  }

  static async update(accountId: string, updates: Partial<Account>): Promise<void> {
    const accounts = await this.getAll();
    const updatedAccounts = accounts.map(account => {
      if (account.id === accountId) {
        // If setting isActive to true, deactivate all others for the same server
        if (updates.isActive) {
          return { ...account, ...updates, isActive: true };
        }
        return { ...account, ...updates };
      }
      // If another account for the same server is being activated, deactivate this one
      if (updates.isActive && account.serverId === updates.serverId) {
        return { ...account, isActive: false };
      }
      return account;
    });
    await this.save(updatedAccounts);
  }

  static async delete(accountId: string): Promise<void> {
    const accounts = await this.getAll();
    const filteredAccounts = accounts.filter(account => account.id !== accountId);
    
    // If the deleted account was active, activate the first remaining account for the same server
    const deletedAccount = accounts.find(a => a.id === accountId);
    if (deletedAccount && deletedAccount.isActive) {
      const serverAccounts = filteredAccounts.filter(a => a.serverId === deletedAccount.serverId);
      if (serverAccounts.length > 0) {
        serverAccounts[0].isActive = true;
      }
    }
    
    await this.save(filteredAccounts);
  }

  static async setActiveAccount(accountId: string): Promise<void> {
    await this.update(accountId, { isActive: true });
  }
}
