import historyManager from '../historyManager';
import { PlayRecordManager } from '../storage';

// Mock PlayRecordManager
jest.mock('../storage', () => ({
  PlayRecordManager: {
    getAll: jest.fn(),
  },
}));

const mockPlayRecordManager = PlayRecordManager as jest.Mocked<typeof PlayRecordManager>;

describe('HistoryManager', () => {
  beforeEach(() => {
    mockPlayRecordManager.getAll.mockClear();
  });

  test('should get all play records', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120,
        total_time: 300,
        save_time: Date.now() - 1000,
        year: '2023',
      },
      'source2+id2': {
        title: 'Test Title 2',
        source_name: 'Test Source 2',
        cover: 'cover2.jpg',
        index: 2,
        total_episodes: 8,
        play_time: 90,
        total_time: 240,
        save_time: Date.now(),
        year: '2024',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const records = await historyManager.getAllPlayRecords();

    expect(records).toBeInstanceOf(Array);
    expect(records.length).toBe(2);
    // 应该按保存时间排序，最新的在前
    expect(records[0].title).toBe('Test Title 2');
    expect(records[1].title).toBe('Test Title 1');
  });

  test('should get continuation item for unfinished record', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120, // 40% progress
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeInstanceOf(Object);
    expect(continuationItem?.source).toBe('source1');
    expect(continuationItem?.id).toBe('id1');
    expect(continuationItem?.title).toBe('Test Title 1');
    expect(continuationItem?.play_time).toBe(120);
    expect(continuationItem?.total_time).toBe(300);
    expect(continuationItem?.index).toBe(0); // 转换为0-based索引
    expect(continuationItem?.source_name).toBe('Test Source 1');
  });

  test('should return null for finished records', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 285, // 95% progress (considered finished)
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeNull();
  });

  test('should return null for no records', async () => {
    mockPlayRecordManager.getAll.mockResolvedValue({});

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeNull();
  });

  test('should check if there are unfinished records', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120, // 40% progress
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const hasUnfinished = await historyManager.hasUnfinishedRecords();

    expect(hasUnfinished).toBe(true);
  });

  test('should return false for no unfinished records', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 285, // 95% progress (considered finished)
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const hasUnfinished = await historyManager.hasUnfinishedRecords();

    expect(hasUnfinished).toBe(false);
  });
});
