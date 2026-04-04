import historyManager from '../historyManager';
import { PlayRecordManager } from '../storage';

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
    expect(records[0].title).toBe('Test Title 2');
    expect(records[1].title).toBe('Test Title 1');
  });

  test('should handle getAllPlayRecords error gracefully', async () => {
    mockPlayRecordManager.getAll.mockRejectedValue(new Error('Storage error'));

    const records = await historyManager.getAllPlayRecords();

    expect(records).toEqual([]);
  });

  test('should handle records with no save_time', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title',
        source_name: 'Test Source',
        cover: 'cover.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 100,
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const records = await historyManager.getAllPlayRecords();

    expect(records).toBeInstanceOf(Array);
    expect(records.length).toBe(1);
  });

  test('should get continuation item for unfinished record', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120,
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
    expect(continuationItem?.index).toBe(0);
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
        play_time: 285,
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

  test('should return null when total_time is zero', async () => {
    const mockRecords = {
      'source1+id1': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 0,
        total_time: 0,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeNull();
  });

  test('should return null for invalid record key format', async () => {
    const mockRecords = {
      'invalid-key': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120,
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeNull();
  });

  test('should return null for record key with only one part', async () => {
    const mockRecords = {
      'only-one-part': {
        title: 'Test Title 1',
        source_name: 'Test Source 1',
        cover: 'cover1.jpg',
        index: 1,
        total_episodes: 10,
        play_time: 120,
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const continuationItem = await historyManager.getContinuationItem();

    expect(continuationItem).toBeNull();
  });

  test('should handle getContinuationItem error gracefully', async () => {
    mockPlayRecordManager.getAll.mockRejectedValue(new Error('Storage error'));

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
        play_time: 120,
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
        play_time: 285,
        total_time: 300,
        save_time: Date.now(),
        year: '2023',
      },
    };

    mockPlayRecordManager.getAll.mockResolvedValue(mockRecords);

    const hasUnfinished = await historyManager.hasUnfinishedRecords();

    expect(hasUnfinished).toBe(false);
  });

  test('should return false when getContinuationItem returns null', async () => {
    mockPlayRecordManager.getAll.mockResolvedValue({});

    const hasUnfinished = await historyManager.hasUnfinishedRecords();

    expect(hasUnfinished).toBe(false);
  });
});
