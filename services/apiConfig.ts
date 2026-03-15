/**
 * API 配置管理器
 * 支持在 OrionTV 和 LunaTV 后端之间切换
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { lunaTV } from "./lunaTVAdapter";

export type ApiBackendType = "oriontv" | "lunatv";

export interface ApiBackendConfig {
  type: ApiBackendType;
  baseURL: string;
  name: string;
}

const BACKEND_KEY = "@api_backend_config";

// 预定义的后端配置
export const BACKENDS: Record<ApiBackendType, ApiBackendConfig> = {
  oriontv: {
    type: "oriontv",
    baseURL: "", // 由用户设置
    name: "OrionTV",
  },
  lunatv: {
    type: "lunatv",
    baseURL: "", // 由用户设置
    name: "LunaTV",
  },
};

export class ApiBackendManager {
  /**
   * 获取当前后端配置
   */
  static async getCurrentBackend(): Promise<ApiBackendConfig> {
    try {
      const configStr = await AsyncStorage.getItem(BACKEND_KEY);
      if (configStr) {
        return JSON.parse(configStr);
      }
    } catch (error) {
      console.error("Get backend config failed:", error);
    }
    
    // 默认使用 OrionTV
    return BACKENDS.oriontv;
  }

  /**
   * 设置后端配置
   */
  static async setBackendConfig(config: ApiBackendConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(BACKEND_KEY, JSON.stringify(config));
      
      // 更新 API 实例的 baseURL
      if (config.type === "lunatv") {
        lunaTV.setBaseUrl(config.baseURL);
        // 导出 lunaTV 实例
        (global as any).currentApi = lunaTV;
      } else {
        api.setBaseUrl(config.baseURL);
        // 导出 api 实例
        (global as any).currentApi = api;
      }
      
      console.log("Backend switched to:", config.name);
    } catch (error) {
      console.error("Set backend config failed:", error);
      throw error;
    }
  }

  /**
   * 获取当前 API 实例
   */
  static getCurrentApi() {
    return (global as any).currentApi || api;
  }

  /**
   * 初始化 API 实例
   */
  static async initialize(): Promise<void> {
    try {
      const config = await this.getCurrentBackend();
      
      if (config.baseURL) {
        if (config.type === "lunatv") {
          lunaTV.setBaseUrl(config.baseURL);
          (global as any).currentApi = lunaTV;
        } else {
          api.setBaseUrl(config.baseURL);
          (global as any).currentApi = api;
        }
      }
      
      console.log("API initialized with:", config.name);
    } catch (error) {
      console.error("Initialize API failed:", error);
      // 默认使用 api
      (global as any).currentApi = api;
    }
  }

  /**
   * 列出所有可用的后端
   */
  static listBackends(): ApiBackendConfig[] {
    return Object.values(BACKENDS);
  }

  /**
   * 切换后端类型
   */
  static async switchBackend(type: ApiBackendType, baseURL: string): Promise<void> {
    const config = BACKENDS[type];
    config.baseURL = baseURL;
    await this.setBackendConfig(config);
  }

  /**
   * 清除后端配置
   */
  static async clearBackend(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BACKEND_KEY);
      (global as any).currentApi = api;
      console.log("Backend config cleared");
    } catch (error) {
      console.error("Clear backend config failed:", error);
    }
  }
}

// 导出便捷方法
export const switchBackend = ApiBackendManager.switchBackend.bind(ApiBackendManager);
export const getCurrentBackend = ApiBackendManager.getCurrentBackend.bind(ApiBackendManager);
export const getCurrentApi = ApiBackendManager.getCurrentApi.bind(ApiBackendManager);
export const initializeApi = ApiBackendManager.initialize.bind(ApiBackendManager);
