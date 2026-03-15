/**
 * API 增强模块
 * 提供对 LunaTV 等第三方后端的兼容支持
 * 自动适配不同的数据格式
 */

import { SearchResult, VideoDetail, PlayRecord, Favorite } from "./api";

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
      console.error("parsePlayUrls failed:", error);
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
  static adaptSearchResult(data: any, source: string): SearchResult[] {
    if (!data) return [];

    // 如果是数组，直接处理
    const items = Array.isArray(data) ? data : (data.results || data.list || []);
    
    return items.map((item: any, index: number) => {
      // 检测是否为 LunaTV 格式
      if (item.vod_name || item.vod_id) {
        return this.adaptLunaTVSearchResult(item as LunaTVSearchResult, index);
      }
      
      // 否则假设已经是标准格式
      return {
        id: item.id || index,
        title: item.title || item.vod_name,
        poster: item.poster || item.vod_pic,
        episodes: item.episodes || this.parsePlayUrls(item.vod_play_url || ""),
        source: item.source || source,
        source_name: item.source_name || item.vod_play_from || source,
        class: item.class || item.vod_class,
        year: item.year || item.vod_year,
        desc: item.desc || this.stripHtml(item.vod_content || ""),
        type_name: item.type_name || item.vod_type_name,
      } as SearchResult;
    });
  }

  /**
   * 智能适配视频详情（支持多种后端格式）
   */
  static adaptVideoDetail(data: any, source: string): VideoDetail | null {
    if (!data) return null;

    // 检测是否为 LunaTV 格式
    if (data.vod_name || data.vod_id) {
      return this.adaptLunaTVVideoDetail(data as LunaTVVideoDetail, source);
    }
    
    // 否则假设已经是标准格式
    return {
      id: String(data.id || data.vod_id),
      title: data.title || data.vod_name,
      poster: data.poster || data.vod_pic,
      source: source,
      source_name: data.source_name || data.vod_play_from || source,
      desc: data.desc || this.stripHtml(data.vod_content || ""),
      type: data.type || data.type_name,
      year: data.year || data.vod_year,
      area: data.area || data.vod_area,
      director: data.director || data.vod_director || "",
      actor: data.actor || data.vod_actor || "",
      remarks: data.remarks || data.vod_remarks,
    } as VideoDetail;
  }

  /**
   * 适配播放记录（支持多种后端格式）
   */
  static adaptPlayRecord(data: any): Record<string, PlayRecord> {
    if (!data) return {};

    const records: Record<string, PlayRecord> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const record = value as any;
      records[key] = {
        title: record.title || "",
        source_name: record.source_name || "",
        cover: record.cover || "",
        index: record.index || 0,
        total_episodes: record.total_episodes || 0,
        play_time: record.play_time || 0,
        total_time: record.total_time || 0,
        save_time: record.save_time || Date.now(),
        year: record.year || "",
        playbackRate: record.playbackRate || 1,
      };
    }
    
    return records;
  }

  /**
   * 适配收藏数据（支持多种后端格式）
   */
  static adaptFavorite(data: any): Record<string, Favorite> {
    if (!data) return {};

    const favorites: Record<string, Favorite> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const favorite = value as any;
      favorites[key] = {
        cover: favorite.cover || "",
        title: favorite.title || "",
        source_name: favorite.source_name || "",
        total_episodes: favorite.total_episodes || 0,
        search_title: favorite.search_title || favorite.title || "",
        year: favorite.year || "",
        save_time: favorite.save_time || Date.now(),
      };
    }
    
    return favorites;
  }
}
