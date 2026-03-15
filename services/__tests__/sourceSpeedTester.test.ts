import sourceSpeedTester from '../sourceSpeedTester';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SourceSpeedTester', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // 清除缓存
    sourceSpeedTester.clearCache();
  });

  test('should test a single source speed', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024), // 1MB
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
    // Mock fetch error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    expect(result).toBeInstanceOf(Object);
    expect(result.source).toBe('test-source');
    expect(result.source_name).toBe('Test Source');
    expect(result.latency).toBe(10000); // Default timeout
    expect(result.bandwidth).toBe(0);
    expect(result.bufferTime).toBe(10000); // Default timeout
    expect(result.score).toBe(0);
  });

  test('should test multiple sources in parallel', async () => {
    // Mock successful response
    mockFetch.mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024), // 1MB
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
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => ({
            done: true,
            value: new Uint8Array(1024 * 1024), // 1MB
          }),
        }),
      },
    });

    // First test
    const firstResult = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    // Clear mock to verify it's not called again
    mockFetch.mockClear();

    // Second test (should use cache)
    const secondResult = await sourceSpeedTester.testSource(
      'test-source',
      'Test Source',
      'https://example.com/test.mp4'
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(secondResult).toEqual(firstResult);
  });
});
