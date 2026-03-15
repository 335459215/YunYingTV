import Logger from '@/utils/Logger';

const logger = Logger.withTag('SourceSpeedTester');

export interface SourceSpeedTestResult {
  source: string;
  source_name: string;
  latency: number; // 连接延迟（毫秒）
  bandwidth: number; // 带宽（KB/s）
  bufferTime: number; // 初始缓冲时间（毫秒）
  score: number; // 综合评分（越高越好）
  timestamp: number; // 测试时间戳
}

export interface SourceSpeedTesterOptions {
  timeout?: number; // 测试超时时间（毫秒）
  sampleSize?: number; // 采样次数
  minBandwidthSampleSize?: number; // 带宽测试最小采样大小（字节）
}

class SourceSpeedTester {
  private static instance: SourceSpeedTester;
  private testResults: Map<string, SourceSpeedTestResult> = new Map();
  private lastTestTime: Map<string, number> = new Map();
  private readonly MIN_TEST_INTERVAL = 5 * 60 * 1000; // 5分钟

  private constructor() {}

  public static getInstance(): SourceSpeedTester {
    if (!SourceSpeedTester.instance) {
      SourceSpeedTester.instance = new SourceSpeedTester();
    }
    return SourceSpeedTester.instance;
  }

  /**
   * 测试单个影视源的速度
   */
  public async testSource(
    source: string,
    source_name: string,
    testUrl: string,
    options: SourceSpeedTesterOptions = {}
  ): Promise<SourceSpeedTestResult> {
    // 检查是否需要重新测试
    const lastTest = this.lastTestTime.get(source);
    const now = Date.now();
    
    if (lastTest && (now - lastTest) < this.MIN_TEST_INTERVAL) {
      const cachedResult = this.testResults.get(source);
      if (cachedResult) {
        logger.info(`Using cached speed test result for source: ${source_name}`);
        return cachedResult;
      }
    }

    logger.info(`Testing speed for source: ${source_name} (${testUrl})`);

    const {
      timeout = 10000,
      minBandwidthSampleSize = 1024 * 1024, // 1MB
    } = options;

    try {
      // 1. 测试连接延迟
      const latency = await this.testLatency(testUrl, timeout);

      // 2. 测试带宽稳定性
      const bandwidth = await this.testBandwidth(testUrl, timeout, minBandwidthSampleSize);

      // 3. 测试初始缓冲时间（模拟视频播放器的缓冲行为）
      const bufferTime = await this.testBufferTime(testUrl, timeout);

      // 4. 计算综合评分
      const score = this.calculateScore(latency, bandwidth, bufferTime);

      const result: SourceSpeedTestResult = {
        source,
        source_name,
        latency,
        bandwidth,
        bufferTime,
        score,
        timestamp: now,
      };

      // 缓存测试结果
      this.testResults.set(source, result);
      this.lastTestTime.set(source, now);

      logger.info(`Speed test result for ${source_name}: latency=${latency}ms, bandwidth=${bandwidth.toFixed(2)}KB/s, bufferTime=${bufferTime}ms, score=${score.toFixed(2)}`);

      return result;
    } catch (error) {
      logger.error(`Failed to test speed for source ${source_name}:`, error);
      
      // 返回一个默认的低评分结果
      const result: SourceSpeedTestResult = {
        source,
        source_name,
        latency: timeout,
        bandwidth: 0,
        bufferTime: timeout,
        score: 0,
        timestamp: now,
      };

      this.testResults.set(source, result);
      this.lastTestTime.set(source, now);

      return result;
    }
  }

  /**
   * 批量测试多个影视源的速度
   */
  public async testSources(
    sources: { source: string; source_name: string; testUrl: string }[],
    options: SourceSpeedTesterOptions = {}
  ): Promise<SourceSpeedTestResult[]> {
    logger.info(`Testing speed for ${sources.length} sources in parallel`);

    const testPromises = sources.map(({ source, source_name, testUrl }) =>
      this.testSource(source, source_name, testUrl, options)
    );

    const results = await Promise.all(testPromises);

    // 按评分排序
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 测试连接延迟
   */
  private async testLatency(url: string, timeout: number): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const start = performance.now();
      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      const end = performance.now();

      clearTimeout(timeoutId);
      return end - start;
    } catch {
      clearTimeout(timeoutId);
      return timeout;
    }
  }

  /**
   * 测试带宽稳定性
  */
  private async testBandwidth(url: string, timeout: number, minSampleSize: number): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const start = performance.now();
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          receivedBytes += value.length;
        }

        // 如果已经读取了足够的数据，就停止
        if (receivedBytes >= minSampleSize) break;
      }

      const end = performance.now();
      const duration = (end - start) / 1000; // 转换为秒

      clearTimeout(timeoutId);

      if (duration === 0) return 0;
      return (receivedBytes / 1024) / duration; // KB/s
    } catch {
      clearTimeout(timeoutId);
      return 0;
    }
  }

  /**
   * 测试初始缓冲时间
  */
  private async testBufferTime(url: string, timeout: number): Promise<number> {
    // 模拟视频播放器的缓冲行为，实际上是测试获取首字节的时间
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const start = performance.now();
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Range': 'bytes=0-1023', // 只获取前1KB数据
        },
      });

      await response.text(); // 确保数据被完全读取
      const end = performance.now();

      clearTimeout(timeoutId);
      return end - start;
    } catch {
      clearTimeout(timeoutId);
      return timeout;
    }
  }

  /**
   * 计算综合评分
  */
  private calculateScore(latency: number, bandwidth: number, bufferTime: number): number {
    // 评分算法：
    // 1. 延迟越短越好，权重30%
    // 2. 带宽越高越好，权重50%
    // 3. 缓冲时间越短越好，权重20%

    // 归一化处理
    const latencyScore = Math.max(0, 100 - (latency / 10)); // 100ms以下延迟得满分
    const bandwidthScore = Math.min(100, bandwidth / 100); // 10MB/s以上带宽得满分
    const bufferScore = Math.max(0, 100 - (bufferTime / 5)); // 500ms以下缓冲时间得满分

    // 计算加权平均分
    return (latencyScore * 0.3) + (bandwidthScore * 0.5) + (bufferScore * 0.2);
  }

  /**
   * 获取缓存的测试结果
   */
  public getCachedResult(source: string): SourceSpeedTestResult | undefined {
    return this.testResults.get(source);
  }

  /**
   * 清除缓存的测试结果
   */
  public clearCache(): void {
    this.testResults.clear();
    this.lastTestTime.clear();
    logger.info('Cleared speed test cache');
  }
}

export default SourceSpeedTester.getInstance();
