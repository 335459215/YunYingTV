/**
 * LunaTV API Adapter
 * 适配 LunaTV (MoonTV) 后端 API 接口
 * 
 * LunaTV 项目：https://github.com/MoonTechLab/LunaTV
 * 技术栈：Next.js 14 + TypeScript + Tailwind CSS
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API, ApiSite, DoubanResponse, Favorite, PlayRecord, SearchResult, ServerConfig, VideoDetail } from "./api";

// LunaTV 特定的接口定义
export interface LunaTVSearchResult {
  id?: string | number;
  vod_id?: number;
  vod_name: string;
  type_name: string;
  vod_pic: string;
  vod_year: string;
  vod_area: string;
  vod_remarks: string;
  vod_content: string;
  vod_play_from: string;
  vod_play_url: string;
  vod_director?: string;
  vod_actor?: string;
}

export interface LunaTVVideoDetail {
  vod_id: number;
  vod_name: string;
  type_name: string;
  vod_pic: string;
  vod_year: string;
  vod_area: string;
  vod_remarks: string;
  vod_content: string;
  vod_play_from: string;
  vod_play_url: string;
  vod_director?: string;
  vod_actor?: string;
  vod_class?: string;
}

export interface LunaTVPlayUrl {
  url: string;
  play_from: string;
  episode_index: number;
  episode_name: string;
}

export interface LunaTVResponse<T> {
  code: number;
  msg: string;
  data: T;
  list?: T[];
}

export interface LunaTVServerConfig {
  SiteName: string;
  StorageType: string;
}

export class LunaTVAdapter extends API {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * 重写登录方法以适配 LunaTV
   */
  async login(username?: string, password?: string): Promise<{ ok: boolean }> {
    try {
      const response = await this._fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const cookies = response.headers.get("Set-Cookie");
      if (cookies) {
        await AsyncStorage.setItem("authCookies", cookies);
      }

      return response.json();
    } catch (error) {
      // LunaTV 可能不需要登录
      console.log("LunaTV login not required or failed:", error);
      return { ok: true };
    }
  }

  /**
   * 获取服务器配置 - 适配 LunaTV 格式
   */
  async getServerConfig(): Promise<ServerConfig> {
    try {
      const response = await this._fetch("/api/server-config");
      const data: LunaTVServerConfig = await response.json();
      
      return {
        SiteName: data.SiteName || "LunaTV",
        StorageType: data.StorageType || "localstorage",
      };
    } catch (error) {
      // 默认配置
      return {
        SiteName: "LunaTV",
        StorageType: "localstorage",
      };
    }
  }

  /**
   * 搜索视频 - 适配 LunaTV 格式
   */
  async searchVideos(query: string): Promise<{ results: SearchResult[] }> {
    try {
      const url = `/api/search?q=${encodeURIComponent(query)}`;
      const response = await this._fetch(url);
      const data: LunaTVResponse<LunaTVSearchResult[]> = await response.json();

      const results: SearchResult[] = (data.list || data.data || []).map((item, index) => ({
        id: item.vod_id || item.id || index,
        title: item.vod_name,
        poster: item.vod_pic,
        episodes: this.parsePlayUrls(item.vod_play_url),
        source: item.vod_play_from || "default",
        source_name: item.vod_play_from || "LunaTV",
        class: item.vod_class || item.type_name,
        year: item.vod_year,
        desc: this.stripHtml(item.vod_content),
        type_name: item.type_name,
      }));

      return { results };
    } catch (error) {
      console.error("LunaTV search failed:", error);
      return { results: [] };
    }
  }

  /**
   * 获取视频详情 - 适配 LunaTV 格式
   */
  async getVideoDetail(source: string, id: string): Promise<VideoDetail> {
    try {
      const url = `/api/detail?source=${source}&id=${id}`;
      const response = await this._fetch(url);
      const data: LunaTVResponse<LunaTVVideoDetail> = await response.json();
      const detail = data.data || data.list?.[0];

      if (!detail) {
        throw new Error("Video not found");
      }

      return {
        id: String(detail.vod_id),
        title: detail.vod_name,
        poster: detail.vod_pic,
        source: source,
        source_name: detail.vod_play_from || "LunaTV",
        desc: this.stripHtml(detail.vod_content),
        type: detail.type_name,
        year: detail.vod_year,
        area: detail.vod_area,
        director: detail.vod_director || "",
        actor: detail.vod_actor || "",
        remarks: detail.vod_remarks,
      };
    } catch (error) {
      console.error("LunaTV getVideoDetail failed:", error);
      throw error;
    }
  }

  /**
   * 获取播放地址 - LunaTV 特定方法
   */
  async getPlayUrl(source: string, id: string, episodeIndex: number): Promise<LunaTVPlayUrl> {
    try {
      const detail = await this.getVideoDetail(source, id);
      const episodes = this.parsePlayUrls(detail.remarks || "");
      
      if (episodeIndex >= 0 && episodeIndex < episodes.length) {
        return {
          url: episodes[episodeIndex],
          play_from: source,
          episode_index: episodeIndex,
          episode_name: `第${episodeIndex + 1}集`,
        };
      }

      throw new Error("Episode not found");
    } catch (error) {
      console.error("LunaTV getPlayUrl failed:", error);
      throw error;
    }
  }

  /**
   * 获取收藏列表 - 重写以适配 LunaTV
   */
  async getFavorites(key?: string): Promise<Record<string, Favorite> | Favorite | null> {
    try {
      const url = key ? `/api/favorites?key=${encodeURIComponent(key)}` : "/api/favorites";
      const response = await this._fetch(url);
      return response.json();
    } catch (error) {
      console.error("LunaTV getFavorites failed:", error);
      return null;
    }
  }

  /**
   * 添加收藏 - 重写以适配 LunaTV
   */
  async addFavorite(key: string, favorite: Omit<Favorite, "save_time">): Promise<{ success: boolean }> {
    try {
      const response = await this._fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, favorite }),
      });
      return response.json();
    } catch (error) {
      console.error("LunaTV addFavorite failed:", error);
      return { success: false };
    }
  }

  /**
   * 获取播放记录 - 重写以适配 LunaTV
   */
  async getPlayRecords(): Promise<Record<string, PlayRecord>> {
    try {
      const response = await this._fetch("/api/playrecords");
      return response.json();
    } catch (error) {
      console.error("LunaTV getPlayRecords failed:", error);
      return {};
    }
  }

  /**
   * 保存播放记录 - 重写以适配 LunaTV
   */
  async savePlayRecord(key: string, record: Omit<PlayRecord, "save_time">): Promise<{ success: boolean }> {
    try {
      const response = await this._fetch("/api/playrecords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, record }),
      });
      return response.json();
    } catch (error) {
      console.error("LunaTV savePlayRecord failed:", error);
      return { success: false };
    }
  }

  /**
   * 图片代理 - 适配 LunaTV
   */
  getImageProxyUrl(imageUrl: string): string {
    return `${this.baseURL}/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  /**
   * 获取资源列表 - 适配 LunaTV
   */
  async getResources(signal?: AbortSignal): Promise<ApiSite[]> {
    try {
      const url = `/api/search/resources`;
      const response = await this._fetch(url, { signal });
      return response.json();
    } catch (error) {
      console.error("LunaTV getResources failed:", error);
      return [];
    }
  }

  /**
   * 解析播放地址字符串为数组
   * LunaTV 格式： "url1#name1$$url2#name2" 或 "url1$$url2"
   */
  private parsePlayUrls(playUrl: string): string[] {
    if (!playUrl) return [];

    try {
      // 按 $$ 分割集数
      const episodes = playUrl.split(/\$\$/).filter(Boolean);
      
      return episodes.map((ep) => {
        // 处理 url#name 格式
        const parts = ep.split("#");
        const url = parts[0].trim();
        
        // 如果是 http 或 https 开头，直接返回
        if (url.startsWith("http")) {
          return url;
        }
        
        // 否则可能是相对路径或其他格式
        return url;
      });
    } catch (error) {
      console.error("parsePlayUrls failed:", error);
      return [];
    }
  }

  /**
   * 去除 HTML 标签
   */
  private stripHtml(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  }
}

// 导出 LunaTV API 实例
export let lunaTV = new LunaTVAdapter();
