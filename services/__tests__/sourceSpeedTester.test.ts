import sourceSpeedTester from '../sourceSpeedTester';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SourceSpeedTester', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    sourceSpeedTester.clearCache();
  });

  test('should test a single source speed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024),
          }),
        }),
      },
    });

    const result = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    expect(result).toBeInstanceOf(Object);
    expect(result.source).toBe('test-source');
    expect(result.source_name).toBe('Test Source');
    expect(result.latency).toBeGreaterThanOrEqual(0);
    expect(result.bandwidth).toBeGreaterThanOrEqual(0);
    expect(result.bufferTime).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    expect(result).toBeInstanceOf(Object);
    expect(result.source).toBe('test-source');
    expect(result.source_name).toBe('Test Source');
    expect(result.latency).toBe(10000);
    expect(result.bandwidth).toBe(0);
    expect(result.bufferTime).toBe(10000);
    expect(result.score).toBe(0);
  });

  test('should test multiple sources in parallel', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024),
          }),
        }),
      },
    });

    const sources = [
      { source: 'source1', source_name: 'Source 1', testUrl: 'https://example.com/test1.mp4' },
      { source: 'source2', source_name: 'Source 2', testUrl: 'https://example.com/test2.mp4' },
    ];

    const results = await sourceSpeedTester.testSources(sources);

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBe(2);
    expect(results[0]).toBeInstanceOf(Object);
    expect(results[1]).toBeInstanceOf(Object);
  });

  test('should return cached results within minimum test interval', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024),
          }),
        }),
      },
    });

    const firstResult = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    mockFetch.mockClear();

    const secondResult = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(secondResult).toEqual(firstResult);
  });

  test('should handle non-ok response in bandwidth test', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/notfound.mp4'
    );

    expect(result.bandwidth).toBe(0);
    expect(result.score).toBeLessThanOrEqual(30);
  });

  test('should handle missing response body in bandwidth test', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: null,
    });

    const result = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/nobody.mp4'
    );

    expect(result.bandwidth).toBe(0);
  });

  test('should handle zero duration in bandwidth calculation', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: async () => ({
              done: true,
              value: new Uint8Array(1024 * 1024),
            }),
          }),
        },
      })
    );

    const result = await sourceSpeedTester.testSource(
      'fast-source',
      'Fast Source',
      'https://example.com/fast.mp4'
    );

    expect(result.bandwidth).toBeGreaterThanOrEqual(0);
  });

  test('should get cached result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024),
          }),
        }),
      },
    });

    await sourceSpeedTester.testSource(
      'cached-source',
      'Cached Source',
      'https://example.com/cached.mp4'
    );

    const cached = sourceSpeedTester.getCachedResult('cached-source');
    expect(cached).toBeDefined();
    expect(cached?.source).toBe('cached-source');
  });

  test('should return undefined for non-existent cached result', async () => {
    const cached = sourceSpeedTester.getCachedResult('non-existent');
    expect(cached).toBeUndefined();
  });

  test('should handle abort error in latency test', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await sourceSpeedTester.testSource(
      'abort-source',
      'Abort Source',
      'https://example.com/abort.mp4'
    );

    expect(result.latency).toBe(10000);
  });

  test('should handle abort error in buffer test', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: async () => ({ done: true, value: new Uint8Array(1024) }),
            }),
          },
        });
      } else if (callCount === 2) {
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: async () => ({ done: true, value: new Uint8Array(1024) }),
            }),
          },
        });
      } else {
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        return Promise.reject(abortError);
      }
    });

    const result = await sourceSpeedTester.testSource(
      'buffer-abort',
      'Buffer Abort',
      'https://example.com/bufferabort.mp4'
    );

    expect(result.bufferTime).toBe(10000);
  });

  test('should clear cache properly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({ done: true, value: new Uint8Array(1024 * 1024) }),
        }),
      },
    });

    await sourceSpeedTester.testSource(
      'clear-source',
      'Clear Source',
      'https://example.com/clear.mp4'
    );

    expect(sourceSpeedTester.getCachedResult('clear-source')).toBeDefined();

    sourceSpeedTester.clearCache();

    expect(sourceSpeedTester.getCachedResult('clear-source')).toBeUndefined();
  });

  test('should use custom timeout', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 50)
        )
    );

    const result = await sourceSpeedTester.testSource(
      'timeout-source',
      'Timeout Source',
      'https://example.com/timeout.mp4',
      { timeout: 100 }
    );

    expect(result.latency).toBe(100);
  });

  test('should test sources and sort by score descending', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: async () => {
              if (callCount === 1 || callCount === 3) {
                return { done: true, value: new Uint8Array(1024 * 1024) };
              } else {
                return { done: true, value: new Uint8Array(512 * 1024) };
              }
            },
          }),
        },
      });
    });

    const sources = [
      { source: 'fast', source_name: 'Fast', testUrl: 'https://example.com/fast.mp4' },
      { source: 'slow', source_name: 'Slow', testUrl: 'https://example.com/slow.mp4' },
    ];

    const results = await sourceSpeedTester.testSources(sources);

    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });
});
