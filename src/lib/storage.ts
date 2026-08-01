import { SavedComfort, MoodLog, CommunityNote, ChatMessage } from '../types';

const SAVED_COMFORTS_KEY = 'teacher_mind_saved_comforts';
const MOOD_LOGS_KEY = 'teacher_mind_mood_logs';
const COMMUNITY_NOTES_KEY = 'teacher_mind_community_notes';

// Initial fallback community notes
const DEFAULT_COMMUNITY_NOTES: CommunityNote[] = [
  {
    id: 'note_1',
    author: '초등 5년차 민지샘',
    grade: '초등',
    content: '학부모 퇴근 후 카톡 폭탄 때문에 가슴이 쿵쾅거렸는데, 퇴근 시간 후에는 교실 일에 내 삶을 내어주지 않기로 다짐했습니다. 선생님들 우리 오늘 야근하지 말고 꼭 맛있는 거 드세요!',
    likes: 42,
    createdAt: '오늘 18:20',
    tags: ['학부모민원', '퇴근후쉼', '자아보호'],
  },
  {
    id: 'note_2',
    author: '중등 12년차 성훈샘',
    grade: '중등',
    content: '수업 시간에 자는 아이들 보며 속상했던 날이 많았지만, 오늘 문득 나를 바라보며 반짝이는 눈빛 한두 명에 집중해보기로 했습니다. 내가 모든 아이를 완벽히 바꿀 순 없으니까요.',
    likes: 38,
    createdAt: '오늘 17:05',
    tags: ['수업지침', '마음놓기', '선생님응원'],
  },
  {
    id: 'note_3',
    author: '고등 2년차 신규샘',
    grade: '고등',
    content: '행정 공문 재촉에 멘붕 왔는데 지나가던 정샘이 따뜻한 유자차 한 잔 건네주셨어요. 작은 다정함이 한 사람의 하루를 살리네요. 저도 내일은 신규 선생님께 유자차 타드리렵니다.',
    likes: 56,
    createdAt: '오늘 16:40',
    tags: ['행정업무', '동료애', '따뜻한한마디'],
  },
  {
    id: 'note_4',
    author: '특수교사 8년차 지은샘',
    grade: '유치원/특수',
    content: '완벽한 교사가 되려 하지 마세요. 아이들에게는 완벽한 전문가보다 날마다 온기를 나눠주는 따뜻한 선생님이 훨씬 소중하니까요.',
    likes: 64,
    createdAt: '어제 19:15',
    tags: ['번아웃극복', '자책금지', '자아존중'],
  },
];

// -------------------------------------------------------------
// 1. SAVED COMFORTS BACKEND API
// -------------------------------------------------------------
export const fetchSavedComforts = async (): Promise<SavedComfort[]> => {
  try {
    const res = await fetch('/api/saved-comforts');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Backend server unavailable, falling back to local storage', e);
  }
  // Local fallback
  try {
    const data = localStorage.getItem(SAVED_COMFORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveComfortItemApi = async (
  item: Omit<SavedComfort, 'id' | 'date'>
): Promise<SavedComfort> => {
  try {
    const res = await fetch('/api/saved-comforts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend server save failed, using local fallback', e);
  }

  // Local fallback
  const comforts = getSavedComfortsLocal();
  const newItem: SavedComfort = {
    ...item,
    id: `comfort_${Date.now()}`,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }),
  };
  const updated = [newItem, ...comforts];
  localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify(updated));
  return newItem;
};

export const deleteSavedComfortApi = async (id: string): Promise<SavedComfort[]> => {
  try {
    const res = await fetch(`/api/saved-comforts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const result = await res.json();
      localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify(result.remaining));
      return result.remaining;
    }
  } catch (e) {
    console.warn('Backend server delete failed, using local fallback', e);
  }

  const comforts = getSavedComfortsLocal().filter((c) => c.id !== id);
  localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify(comforts));
  return comforts;
};

// Sync helpers
export const getSavedComforts = (): SavedComfort[] => {
  return getSavedComfortsLocal();
};

const getSavedComfortsLocal = (): SavedComfort[] => {
  try {
    const data = localStorage.getItem(SAVED_COMFORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveComfortItem = (item: Omit<SavedComfort, 'id' | 'date'>): SavedComfort => {
  // Trigger async backend save in background and save locally
  saveComfortItemApi(item);
  const comforts = getSavedComfortsLocal();
  const newItem: SavedComfort = {
    ...item,
    id: `comfort_${Date.now()}`,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }),
  };
  localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify([newItem, ...comforts]));
  return newItem;
};

export const deleteSavedComfort = (id: string): SavedComfort[] => {
  deleteSavedComfortApi(id);
  const comforts = getSavedComfortsLocal().filter((c) => c.id !== id);
  localStorage.setItem(SAVED_COMFORTS_KEY, JSON.stringify(comforts));
  return comforts;
};

// -------------------------------------------------------------
// 2. MOOD LOGS BACKEND API
// -------------------------------------------------------------
export const fetchMoodLogs = async (): Promise<MoodLog[]> => {
  try {
    const res = await fetch('/api/mood-logs');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Backend server mood-logs unavailable, using local fallback', e);
  }
  return getMoodLogsLocal();
};

export const saveMoodLogApi = async (log: Omit<MoodLog, 'id' | 'date'>): Promise<MoodLog> => {
  try {
    const res = await fetch('/api/mood-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend server save mood log failed', e);
  }

  return saveMoodLogLocal(log);
};

const getMoodLogsLocal = (): MoodLog[] => {
  try {
    const data = localStorage.getItem(MOOD_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveMoodLogLocal = (log: Omit<MoodLog, 'id' | 'date'>): MoodLog => {
  const logs = getMoodLogsLocal();
  const newLog: MoodLog = {
    ...log,
    id: `mood_${Date.now()}`,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  };
  const updated = [newLog, ...logs];
  localStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(updated));
  return newLog;
};

export const getMoodLogs = (): MoodLog[] => getMoodLogsLocal();
export const saveMoodLog = (log: Omit<MoodLog, 'id' | 'date'>): MoodLog => {
  saveMoodLogApi(log);
  return saveMoodLogLocal(log);
};

// -------------------------------------------------------------
// 3. COMMUNITY NOTES BACKEND API
// -------------------------------------------------------------
export const fetchCommunityNotes = async (): Promise<CommunityNote[]> => {
  try {
    const res = await fetch('/api/community-notes');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(COMMUNITY_NOTES_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Backend community notes unavailable', e);
  }
  return getCommunityNotesLocal();
};

export const addCommunityNoteApi = async (
  note: Omit<CommunityNote, 'id' | 'likes' | 'createdAt'>
): Promise<CommunityNote> => {
  try {
    const res = await fetch('/api/community-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend add community note failed', e);
  }
  return addCommunityNoteLocal(note);
};

export const likeCommunityNoteApi = async (id: string): Promise<CommunityNote[]> => {
  try {
    const res = await fetch(`/api/community-notes/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      localStorage.setItem(COMMUNITY_NOTES_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    console.warn('Backend like community note failed', e);
  }
  return likeCommunityNoteLocal(id);
};

const getCommunityNotesLocal = (): CommunityNote[] => {
  try {
    const data = localStorage.getItem(COMMUNITY_NOTES_KEY);
    if (!data) {
      localStorage.setItem(COMMUNITY_NOTES_KEY, JSON.stringify(DEFAULT_COMMUNITY_NOTES));
      return DEFAULT_COMMUNITY_NOTES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_COMMUNITY_NOTES;
  }
};

const addCommunityNoteLocal = (
  note: Omit<CommunityNote, 'id' | 'likes' | 'createdAt'>
): CommunityNote => {
  const notes = getCommunityNotesLocal();
  const newNote: CommunityNote = {
    ...note,
    id: `note_${Date.now()}`,
    likes: 1,
    createdAt: '방금 전',
  };
  const updated = [newNote, ...notes];
  localStorage.setItem(COMMUNITY_NOTES_KEY, JSON.stringify(updated));
  return newNote;
};

const likeCommunityNoteLocal = (id: string): CommunityNote[] => {
  const notes = getCommunityNotesLocal().map((n) => (n.id === id ? { ...n, likes: n.likes + 1 } : n));
  localStorage.setItem(COMMUNITY_NOTES_KEY, JSON.stringify(notes));
  return notes;
};

export const getCommunityNotes = (): CommunityNote[] => getCommunityNotesLocal();
export const addCommunityNote = (note: Omit<CommunityNote, 'id' | 'likes' | 'createdAt'>): CommunityNote => {
  addCommunityNoteApi(note);
  return addCommunityNoteLocal(note);
};
export const likeCommunityNote = (id: string): CommunityNote[] => {
  likeCommunityNoteApi(id);
  return likeCommunityNoteLocal(id);
};

// -------------------------------------------------------------
// 4. CHAT HISTORY BACKEND API
// -------------------------------------------------------------
export const fetchChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const res = await fetch('/api/chat/history');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend chat history unavailable', e);
  }
  return [];
};

export const saveChatHistoryApi = async (messages: ChatMessage[]): Promise<boolean> => {
  try {
    const res = await fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to save chat history to backend', e);
    return false;
  }
};

// -------------------------------------------------------------
// 5. STRESS ANALYTICS BACKEND API
// -------------------------------------------------------------
export const fetchStressAnalytics = async () => {
  try {
    const res = await fetch('/api/chat/stress-analytics');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch stress analytics', e);
  }
  return null;
};

export const runStressAnalysisApi = async () => {
  try {
    const res = await fetch('/api/chat/analyze-stress', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to run stress analysis', e);
  }
  return null;
};


