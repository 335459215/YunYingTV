import { create } from "zustand";
import { PlayRecord, PlayRecordManager } from "@/services/storage";

interface HistoryState {
  records: (PlayRecord & { key: string })[];
  filteredRecords: (PlayRecord & { key: string })[];
  categories: string[];
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  setCategory: (category: string | null) => void;
  deleteRecord: (key: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const useHistoryStore = create<HistoryState>((set, get) => ({
  records: [],
  filteredRecords: [],
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,

  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const recordsMap = await PlayRecordManager.getAll();
      const recordsArray = Object.entries(recordsMap)
        .map(([key, value]) => ({ ...value, key }))
        .sort((a, b) => (b.save_time || 0) - (a.save_time || 0));

      const sourceNames = [...new Set(recordsArray.map((r) => r.source_name).filter(Boolean))];

      set({
        records: recordsArray,
        filteredRecords: recordsArray,
        categories: sourceNames,
        loading: false,
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : "获取历史记录失败";
      set({ error, loading: false });
    }
  },

  setCategory: (category: string | null) => {
    const { records } = get();
    const filtered = category
      ? records.filter((r) => r.source_name === category)
      : records;
    set({ selectedCategory: category, filteredRecords: filtered });
  },

  deleteRecord: async (key: string) => {
    try {
      const [source, id] = key.split("+");
      await PlayRecordManager.remove(source, id);
      const { records, selectedCategory } = get();
      const newRecords = records.filter((r) => r.key !== key);
      const filtered = selectedCategory
        ? newRecords.filter((r) => r.source_name === selectedCategory)
        : newRecords;
      const sourceNames = [...new Set(newRecords.map((r) => r.source_name).filter(Boolean))];
      set({
        records: newRecords,
        filteredRecords: filtered,
        categories: sourceNames,
      });
    } catch {}
  },

  clearAll: async () => {
    try {
      await PlayRecordManager.clearAll();
      set({ records: [], filteredRecords: [], categories: [], selectedCategory: null });
    } catch {}
  },
}));

export default useHistoryStore;
