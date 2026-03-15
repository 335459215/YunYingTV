/**
 * 智能搜索算法
 * 提供高效的搜索、排序和过滤功能
 */

/**
 * 搜索缓存
 */
class SearchCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly TTL: number = 5 * 60 * 1000; // 5 分钟

  /**
   * 获取缓存
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const searchCache = new SearchCache();

/**
 * 智能搜索匹配算法
 */
export class SmartSearch {
  /**
   * 计算字符串相似度（Levenshtein 距离）
   */
  static similarity(str1: string, str2: string): number {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // 删除
          track[j - 1][i] + 1, // 插入
          track[j - 1][i - 1] + indicator // 替换
        );
      }
    }

    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * 拼音首字母匹配
   */
  static matchPinyinInitials(text: string, query: string): boolean {
    if (!query || query.length === 0) return false;
    
    // 简单的拼音首字母提取（仅支持英文和数字）
    const initials = text
      .split('')
      .filter(char => /[a-zA-Z0-9]/.test(char))
      .join('')
      .toLowerCase();
    
    return initials.includes(query.toLowerCase());
  }

  /**
   * 智能评分
   */
  static score(item: any, query: string): number {
    let score = 0;
    
    const title = (item.title || '').toLowerCase();
    const desc = (item.desc || item.description || '').toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // 完全匹配
    if (title === queryLower) {
      score += 100;
    }

    // 标题包含完整查询
    if (title.includes(queryLower)) {
      score += 50;
    }

    // 标题包含查询词
    for (const word of queryWords) {
      if (title.includes(word)) {
        score += 20;
      }
      if (desc.includes(word)) {
        score += 5;
      }
    }

    // 拼音首字母匹配
    if (this.matchPinyinInitials(title, queryLower)) {
      score += 15;
    }

    // 相似度评分
    const similarity = this.similarity(title, queryLower);
    if (similarity > 0.8) {
      score += 30 * similarity;
    } else if (similarity > 0.6) {
      score += 10 * similarity;
    }

    // 热门度加成（根据年份、评分等）
    if (item.year && parseInt(item.year) >= 2020) {
      score += 5;
    }
    
    if (item.rate && parseFloat(item.rate) >= 8) {
      score += 10;
    }

    return score;
  }

  /**
   * 智能搜索并排序
   */
  static searchAndSort<T extends { title?: string; desc?: string; [key: string]: any }>(
    items: T[],
    query: string,
    limit: number = 20
  ): T[] {
    if (!query || query.trim() === '') {
      return items.slice(0, limit);
    }

    // 过滤和评分
    const scored = items
      .map(item => ({
        item,
        score: this.score(item, query),
      }))
      .filter(result => result.score > 0);

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    // 返回前 N 个结果
    return scored.slice(0, limit).map(result => result.item);
  }

  /**
   * 模糊搜索
   */
  static fuzzySearch<T>(
    items: T[],
    query: string,
    keys: (keyof T)[],
    threshold: number = 0.6
  ): T[] {
    if (!query || query.trim() === '') return items;

    const queryLower = query.toLowerCase();

    return items.filter(item => {
      for (const key of keys) {
        const value = String(item[key] || '').toLowerCase();
        
        // 完全包含
        if (value.includes(queryLower)) {
          return true;
        }

        // 相似度匹配
        if (this.similarity(value, queryLower) >= threshold) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * 分词搜索
   */
  static tokenizeSearch<T extends { title?: string; desc?: string }>(
    items: T[],
    query: string
  ): T[] {
    if (!query || query.trim() === '') return items;

    // 中文分词（简单按字分割）
    const tokens = query.split('').filter(t => t.trim());

    return items.filter(item => {
      const text = `${item.title || ''} ${item.desc || ''}`.toLowerCase();
      return tokens.every(token => text.includes(token.toLowerCase()));
    });
  }
}

/**
 * 排序算法
 */
export class SortAlgorithm {
  /**
   * 多字段排序
   */
  static multiSort<T>(
    items: T[],
    criteria: Array<{
      key: keyof T;
      order?: 'asc' | 'desc';
      weight?: number;
    }>
  ): T[] {
    return [...items].sort((a, b) => {
      for (const { key, order = 'asc', weight = 1 } of criteria) {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) {
          return order === 'asc' ? -1 * weight : 1 * weight;
        }
        if (aVal > bVal) {
          return order === 'asc' ? 1 * weight : -1 * weight;
        }
      }
      return 0;
    });
  }

  /**
   * 自然排序（支持数字）
   */
  static naturalSort(a: string, b: string): number {
    const re = /(\d+)|(\D+)/g;
    const aMatch = a.match(re);
    const bMatch = b.match(re);

    if (!aMatch || !bMatch) return a.localeCompare(b);

    const len = Math.min(aMatch.length, bMatch.length);

    for (let i = 0; i < len; i++) {
      const aPart = aMatch[i];
      const bPart = bMatch[i];

      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
      } else {
        const cmp = aPart.localeCompare(bPart);
        if (cmp !== 0) return cmp;
      }
    }

    return aMatch.length - bMatch.length;
  }

  /**
   * 按年份排序
   */
  static sortByYear<T extends { year?: string }>(items: T[], order: 'asc' | 'desc' = 'desc'): T[] {
    return this.multiSort(items, [
      {
        key: 'year',
        order,
        weight: 1,
      },
    ]);
  }

  /**
   * 按评分排序
   */
  static sortByRate<T extends { rate?: string | number }>(items: T[], order: 'asc' | 'desc' = 'desc'): T[] {
    return this.multiSort(items, [
      {
        key: 'rate',
        order,
        weight: 1,
      },
    ]);
  }
}

/**
 * 数据去重
 */
export class Deduplication {
  /**
   * 按 ID 去重
   */
  static byId<T extends { id?: string | number }>(items: T[]): T[] {
    const seen = new Set<string | number>();
    return items.filter(item => {
      if (item.id === undefined || item.id === null) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  /**
   * 按字段去重
   */
  static byField<T>(items: T[], field: keyof T): T[] {
    const seen = new Set<any>();
    return items.filter(item => {
      const value = item[field];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  /**
   * 智能去重（相似度检测）
   */
  static smartDedup<T extends { title?: string }>(
    items: T[],
    threshold: number = 0.9
  ): T[] {
    const result: T[] = [];

    for (const item of items) {
      const isDuplicate = result.some(existing => {
        const similarity = SmartSearch.similarity(
          item.title || '',
          existing.title || ''
        );
        return similarity >= threshold;
      });

      if (!isDuplicate) {
        result.push(item);
      }
    }

    return result;
  }
}
