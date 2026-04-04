/**
 * API 增强模块
 * 提供对 LunaTV 等第三方后端的兼容支持
 * 自动适配不同的数据格式
 */

import { SearchResult, VideoDetail, PlayRecord, Favorite } from "./api";
import Logger from "@/utils/Logger";

const logger = Logger.withTag("ApiAdapter");

/**
 * LunaTV 数据格式接口
 */
export interface LunaTVSearchResult {
  vod_id?: number | string;
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
  vod_time?: string;
}

export interface LunaTVVideoDetail {
  vod_id: number | string;
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
  vod_time?: string;
}

export interface LunaTVResponse<T> {
  code?: number;
  msg?: string;
  message?: string;
  data?: T;
  list?: T[];
  results?: T[];
}

/**
 * API 数据格式适配器
 */
export class ApiAdapter {
  /**
   * 解析 LunaTV 播放地址字符串
   * 格式：url1#name1$$url2#name2 或 url1$$url2
   */
  static parsePlayUrls(playUrl: string): string[] {
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
      logger.error("parsePlayUrls failed:", error);
      return [];
    }
  }

  /**
   * 去除 HTML 标签
   */
  static stripHtml(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  }

  /**
   * 适配 LunaTV 搜索结果到标准格式
   */
  static adaptLunaTVSearchResult(
    item: LunaTVSearchResult,
    index: number
  ): SearchResult {
    return {
      id: Number(item.vod_id || index),
      title: item.vod_name,
      poster: item.vod_pic,
      episodes: this.parsePlayUrls(item.vod_play_url),
      source: item.vod_play_from || "lunatv",
      source_name: item.vod_play_from || "LunaTV",
      class: item.vod_class || item.type_name,
      year: item.vod_year,
      desc: this.stripHtml(item.vod_content),
      type_name: item.type_name,
    };
  }

  /**
   * 适配 LunaTV 视频详情到标准格式
   */
  static adaptLunaTVVideoDetail(
    detail: LunaTVVideoDetail,
    source: string
  ): VideoDetail {
    return {
      id: String(detail.vod_id),
      title: detail.vod_name,
      poster: detail.vod_pic,
      source: source || "lunatv",
      source_name: detail.vod_play_from || "LunaTV",
      desc: this.stripHtml(detail.vod_content),
      type: detail.type_name,
      year: detail.vod_year,
      area: detail.vod_area,
      director: detail.vod_director || "",
      actor: detail.vod_actor || "",
      remarks: detail.vod_remarks,
    };
  }

  /**
   * 适配 LunaTV 响应数据
   */
  static adaptLunaTVResponse<T>(response: LunaTVResponse<T>): T | T[] | null {
    // 优先返回 data 字段
    if (response.data) {
      return response.data;
    }
    
    // 返回 list 字段
    if (response.list) {
      return response.list;
    }
    
    // 返回 results 字段
    if (response.results) {
      return response.results;
    }
    
    return null;
  }

  /**
   * 智能适配搜索结果（支持多种后端格式）
   */
  static adaptSearchResult(data: unknown, source: string): SearchResult[] {
    if (!data) return [];

    const dataObj = data as Record<string, unknown>;
    // 如果是数组，直接处理
    const rawItems = Array.isArray(data) ? data : (dataObj.results || dataObj.list);
    const items: unknown[] = Array.isArray(rawItems) ? rawItems : [];

    return items.map((item: unknown, index: number): SearchResult => {
      const record = item as Record<string, unknown>;
      // 检测是否为 LunaTV 格式
      if (record.vod_name || record.vod_id) {
        return this.adaptLunaTVSearchResult(item as LunaTVSearchResult, index);
      }

      // 否则假设已经是标准格式
      return {
        id: typeof record.id === 'number' ? record.id : index,
        title: String(record.title || record.vod_name || ""),
        poster: String(record.poster || record.vod_pic || ""),
        episodes: Array.isArray(record.episodes) ? record.episodes as string[] : this.parsePlayUrls(String(record.vod_play_url || "")),
        source: String(record.source || source),
        source_name: String(record.source_name || record.vod_play_from || source),
        class: String(record.class || record.vod_class || ""),
        year: String(record.year || record.vod_year || ""),
        desc: String(record.desc || this.stripHtml(String(record.vod_content || ""))),
        type_name: String(record.type_name || record.vod_type_name || ""),
      };
    });
  }

  /**
   * 智能适配视频详情（支持多种后端格式）
   */
  static adaptVideoDetail(data: unknown, source: string): VideoDetail | null {
    if (!data) return null;

    const record = data as Record<string, unknown>;
    // 检测是否为 LunaTV 格式
    if (record.vod_name || record.vod_id) {
      return this.adaptLunaTVVideoDetail(data as LunaTVVideoDetail, source);
    }

    // 否则假设已经是标准格式
    return {
      id: String(record.id || record.vod_id || ""),
      title: String(record.title || record.vod_name || ""),
      poster: String(record.poster || record.vod_pic || ""),
      source: source,
      source_name: String(record.source_name || record.vod_play_from || source),
      desc: String(record.desc || this.stripHtml(String(record.vod_content || ""))),
      type: String(record.type || record.type_name || ""),
      year: String(record.year || record.vod_year || ""),
      area: String(record.area || record.vod_area || ""),
      director: String(record.director || record.vod_director || ""),
      actor: String(record.actor || record.vod_actor || ""),
      remarks: String(record.remarks || record.vod_remarks || ""),
    };
  }

  /**
   * 适配播放记录（支持多种后端格式）
   */
  static adaptPlayRecord(data: unknown): Record<string, PlayRecord> {
    if (!data) return {};

    const dataObj = data as Record<string, unknown>;
    const records: Record<string, PlayRecord> = {};

    for (const [key, value] of Object.entries(dataObj)) {
      const record = value as Record<string, unknown>;
      records[key] = {
        title: String(record.title || ""),
        source_name: String(record.source_name || ""),
        cover: String(record.cover || ""),
        index: Number(record.index) || 0,
        total_episodes: Number(record.total_episodes) || 0,
        play_time: Number(record.play_time) || 0,
        total_time: Number(record.total_time) || 0,
        save_time: Number(record.save_time) || Date.now(),
        year: String(record.year || ""),
        playbackRate: Number(record.playbackRate) || 1,
      };
    }

    return records;
  }

  /**
   * 适配收藏数据（支持多种后端格式）
   */
  static adaptFavorite(data: unknown): Record<string, Favorite> {
    if (!data) return {};

    const dataObj = data as Record<string, unknown>;
    const favorites: Record<string, Favorite> = {};

    for (const [key, value] of Object.entries(dataObj)) {
      const favorite = value as Record<string, unknown>;
      favorites[key] = {
        cover: String(favorite.cover || ""),
        title: String(favorite.title || ""),
        source_name: String(favorite.source_name || ""),
        total_episodes: Number(favorite.total_episodes) || 0,
        search_title: String(favorite.search_title || favorite.title || ""),
        year: String(favorite.year || ""),
        save_time: Number(favorite.save_time) || Date.now(),
      };
    }

    return favorites;
  }
}
