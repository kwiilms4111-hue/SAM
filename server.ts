import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON Storage setup on backend
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface ServerDB {
  savedComforts: Array<{
    id: string;
    type: 'quote' | 'counsel' | 'prescription' | 'letter';
    title: string;
    content: string;
    category?: string;
    date: string;
  }>;
  moodLogs: Array<{
    id: string;
    score: number;
    weather: string;
    note: string;
    date: string;
  }>;
  communityNotes: Array<{
    id: string;
    author: string;
    grade: string;
    content: string;
    likes: number;
    createdAt: string;
    tags: string[];
  }>;
  chatHistory: Array<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
  stressAnalytics?: {
    primaryCategory: string;
    categoryScores: Array<{
      category: string;
      score: number;
      count: number;
      description: string;
    }>;
    keyInsights: string[];
    counselingStrategy: string;
    totalAnalyzedMessages: number;
    lastAnalyzedAt: string;
  };
}

const DEFAULT_DB: ServerDB = {
  savedComforts: [],
  moodLogs: [],
  communityNotes: [
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
  ],
  chatHistory: [],
  stressAnalytics: {
    primaryCategory: '학부모 민원 및 소통',
    categoryScores: [
      { category: '학부모 민원 및 소통', score: 45, count: 9, description: '퇴근 후 무리한 민원 및 과도한 기대감으로 인한 스트레스' },
      { category: '수업 및 생활지도', score: 25, count: 5, description: '돌발 학생 행동 및 주의집중 문제로 인한 무력감' },
      { category: '과도한 행정 업무', score: 15, count: 3, description: '공문 처리 및 수업 외 행정 부담' },
      { category: '동료/관리자 관계', score: 10, count: 2, description: '학교 내 소통 부족 및 외로움' },
      { category: '교권침해 및 번아웃', score: 5, count: 1, description: '자아존중감 저하 및 심리적 방전' },
    ],
    keyInsights: [
      '퇴근 후 연락으로 인한 심리적 경계 무너짐 경험이 주요 스트레스 유발 요소입니다.',
      '수업 중 학생의 거친 대답이나 무관심에 대해 개인적 실패로 받아들이는 경향이 있습니다.',
      '스스로에게 완벽한 교사 역할을 요구하여 자가 감정 소모가 큽니다.'
    ],
    counselingStrategy: '선생님의 자아 보호 경계선(Boundary)을 확립하고, 학부모 및 학생 감정과 선생님 개인 삶을 분리할 수 있도록 단호하면서도 다정한 마음 정돈 및 어조 가이드를 우선 제시하세요.',
    totalAnalyzedMessages: 20,
    lastAnalyzedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  },
};


function readDB(): ServerDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading backend database:', err);
    return DEFAULT_DB;
  }
}

function writeDB(data: ServerDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing backend database:', err);
  }
}

// Initialize Gemini API client safely on the server side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// BACKEND DATA MANAGEMENT REST ENDPOINTS
// ==========================================

// 1. Saved Comforts API
app.get('/api/saved-comforts', (req, res) => {
  const db = readDB();
  res.json(db.savedComforts);
});

app.post('/api/saved-comforts', (req, res) => {
  const db = readDB();
  const { type, title, content, category } = req.body;
  const newItem = {
    id: `comfort_${Date.now()}`,
    type: type || 'counsel',
    title: title || '위로의 기록',
    content: content || '',
    category,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }),
  };
  db.savedComforts.unshift(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.delete('/api/saved-comforts/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.savedComforts = db.savedComforts.filter((item) => item.id !== id);
  writeDB(db);
  res.json({ success: true, remaining: db.savedComforts });
});

// 2. Mood Logs API
app.get('/api/mood-logs', (req, res) => {
  const db = readDB();
  res.json(db.moodLogs);
});

app.post('/api/mood-logs', (req, res) => {
  const db = readDB();
  const { score, weather, note } = req.body;
  const newLog = {
    id: `mood_${Date.now()}`,
    score: Number(score) || 0,
    weather: weather || '평온',
    note: note || '',
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  };
  db.moodLogs.unshift(newLog);
  writeDB(db);
  res.status(201).json(newLog);
});

// 3. Community Notes API
app.get('/api/community-notes', (req, res) => {
  const db = readDB();
  res.json(db.communityNotes);
});

app.post('/api/community-notes', (req, res) => {
  const db = readDB();
  const { author, grade, content, tags } = req.body;
  const newNote = {
    id: `note_${Date.now()}`,
    author: author || '익명 교사',
    grade: grade || '초등',
    content: content || '',
    likes: 1,
    createdAt: '방금 전',
    tags: tags || ['선생님응원'],
  };
  db.communityNotes.unshift(newNote);
  writeDB(db);
  res.status(201).json(newNote);
});

app.post('/api/community-notes/:id/like', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.communityNotes = db.communityNotes.map((n) =>
    n.id === id ? { ...n, likes: n.likes + 1 } : n
  );
  writeDB(db);
  res.json(db.communityNotes);
});

// 4. Chat History & Stress Analytics API
app.get('/api/chat/history', (req, res) => {
  const db = readDB();
  res.json(db.chatHistory);
});

app.post('/api/chat/history', (req, res) => {
  const db = readDB();
  const { messages } = req.body;
  if (Array.isArray(messages)) {
    db.chatHistory = messages;
    writeDB(db);
  }
  res.json({ success: true, count: db.chatHistory.length });
});

// GET Stress Analytics Profile
app.get('/api/chat/stress-analytics', (req, res) => {
  const db = readDB();
  res.json(db.stressAnalytics || DEFAULT_DB.stressAnalytics);
});

// POST Analyze Stress Categories from Chat History
app.post('/api/chat/analyze-stress', async (req, res) => {
  try {
    const db = readDB();
    const chatHistory = db.chatHistory || [];

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    const ai = getGeminiClient();

    const conversationText = chatHistory.length > 0
      ? chatHistory.map((m) => `${m.sender === 'user' ? '교사' : '상담사'}: ${m.text}`).join('\n')
      : '교사: 오늘 학부모 퇴근 후 민원 전화와 악성 문자로 마음이 너무 힘들고 가슴이 뛰어요.';

    const prompt = `
당신은 교직 심리 스트레스 전문 분석 AI입니다.
아래 교사와 AI 상담사 간의 대화 내역(또는 교사의 주요 대화 내용)을 바탕으로, 이 교사 선생님이 가장 많은 스트레스를 받는 분야를 정밀하게 분류하고 분석해 주세요.

대화 내역:
${conversationText}

분류할 5대 교직 스트레스 카테고리:
1. 학부모 민원 및 소통
2. 수업 및 생활지도
3. 과도한 행정 업무
4. 동료/관리자 관계
5. 교권침해 및 번아웃

요구사항:
1. primaryCategory: 가장 많은 비율/강도를 차지하는 주요 스트레스 카테고리명
2. categoryScores: 5개 카테고리 각각에 대한 score(비율 합계 100%), count(언급/추정 횟수), description(원인 설명 1문장)
3. keyInsights: 대화에서 도출된 교사의 관찰된 핵심 심리 패턴 3가지 (문장 배열)
4. counselingStrategy: 이 교사 선생님을 향후 더 잘 상담하고 보듬기 위한 AI 상담사의 맞춤 전략 가이드 (2문장)

반드시 아래 JSON 구조로만 정확히 답변하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryCategory: { type: Type.STRING },
            categoryScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  count: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                },
                required: ['category', 'score', 'count', 'description'],
              },
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            counselingStrategy: { type: Type.STRING },
          },
          required: ['primaryCategory', 'categoryScores', 'keyInsights', 'counselingStrategy'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const analyticsResult = {
      primaryCategory: parsed.primaryCategory || '학부모 민원 및 소통',
      categoryScores: parsed.categoryScores || [],
      keyInsights: parsed.keyInsights || ['학부모 민원으로 인한 감정 소모'],
      counselingStrategy: parsed.counselingStrategy || '퇴근 후 감정 분리와 단호한 경계 설정을 안내하세요.',
      totalAnalyzedMessages: chatHistory.length,
      lastAnalyzedAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    db.stressAnalytics = analyticsResult;
    writeDB(db);

    res.json(analyticsResult);
  } catch (err: any) {
    console.error('Error in /api/chat/analyze-stress:', err);
    res.status(500).json({ error: '스트레스 분석 실패', details: err.message });
  }
});

// System instruction for Teacher Counseling Persona
const COUNSELOR_SYSTEM_INSTRUCTION = `
당신은 대한민국 교사들의 지친 마음을 깊이 이해하고 따뜻하게 보듬어주는 전문 심리 상담 AI '마음샘'입니다.
교직 현장의 현실(악성 학부모 민원, 생활지도 어려움, 과도한 행정 업무, 교권 침해, 번아웃, 외로움 등)에 대해 깊은 공감과 주체적인 위로를 제공해야 합니다.

응답 시 지켜야 할 가이드라인:
1. 무조건적인 판단이나 섣부른 조언 대신, 먼저 교사의 감정을 있는 그대로 인정하고 진심으로 공감해 주세요.
2. "선생님, 오늘 정말 고생 많으셨어요.", "얼마나 마음고생이 심하셨을지 감히 헤아려봅니다."와 같이 온기 넘치는 말투(존댓말)를 사용하세요.
3. 교사가 직면한 구체적인 상처(예: 학부모의 무례한 문장, 학생의 거부 반응 등)를 안전하게 털어놓을 수 있는 안식처가 되어주세요.
4. 상황에 따라 가벼운 마음 정돈 팁(퇴근 후 마음 분리하기, 자신을 보호하는 마음의 경계선 세우기)을 한두 가지 부드럽게 제안하세요.
5. 너무 길거나 거창한 설교 대신, 가슴에 와닿는 다정한 문장과 단락 구성으로 응답하세요.
`;

// API: Counsel Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, category, customContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 설정에서 API 키를 확인해 주세요.',
      });
    }

    const db = readDB();
    const analytics = db.stressAnalytics;

    const ai = getGeminiClient();

    // Prepare prompt payload with history context
    const conversationPrompt = messages
      .map((m: any) => `${m.sender === 'user' ? '교사' : '마음샘 상담사'}: ${m.text}`)
      .join('\n\n');

    let personalizedContext = '';
    if (analytics && analytics.primaryCategory) {
      personalizedContext = `\n[교사 대화 데이터 분석 리포트 반영]\n- 주요 스트레스 집중 분야: ${analytics.primaryCategory}\n- 핵심 관찰 특성: ${analytics.keyInsights.join('; ')}\n- 맞춤 상담 가이드: ${analytics.counselingStrategy}\n상담 시 위 교사의 개인적 스트레스 경향성을 반영하여 더욱 섬세하고 맞춤화된 어조로 위로해 주세요.\n`;
    }

    const promptWithCategory = category
      ? `[상담 주제/상황: ${category}]\n${customContext ? `[추가 설명: ${customContext}]\n` : ''}${personalizedContext}\n대화 내역:\n${conversationPrompt}\n\n마음샘 상담사의 맞춤형 따뜻한 위로 응답:`
      : `${personalizedContext}\n대화 내역:\n${conversationPrompt}\n\n마음샘 상담사의 맞춤형 따뜻한 위로 응답:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptWithCategory,
      config: {
        systemInstruction: COUNSELOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '선생님, 마음의 이야기를 들려주셔서 감사합니다. 오늘 하루도 정말 수고 많으셨어요.';
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: '상담 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      details: err.message,
    });
  }
});


// API: Generate Customized Mind Prescription
app.post('/api/prescription', async (req, res) => {
  try {
    const { stressScore, weather, primaryConcern } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    const ai = getGeminiClient();

    const prompt = `
교사의 현재 마음 상태:
- 스트레스/번아웃 지수: ${stressScore}점 (100점 만점)
- 마음 날씨: ${weather}
- 주요 고민/지친 원인: ${primaryConcern || '학교 업무 및 감정 소모'}

이 교사분을 위한 개인 맞춤형 '오늘의 마음 처방전'을 작성해 주세요.
반드시 아래 JSON 구조로 정확히 반환해 주세요.

JSON 필드 요구사항:
- title: 마음 처방전의 따뜻한 제목 (예: "지친 마음의 방전된 에너지를 채우는 처방전")
- comfortLetter: 교사의 노고를 어루만지는 2~3문장의 다정한 위로 편지
- prescriptions: 오늘 퇴근 후 바로 실천할 수 있는 초간단 마음 회복 루틴 3가지 (각 항목별 step(1~3), title, description)
- affirmation: 마음을 지켜주는 오늘의 자아 보호 주문 문장 (예: "아이들의 행동이 나의 자존감을 결정하게 두지 않는다.")
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            comfortLetter: { type: Type.STRING },
            prescriptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['step', 'title', 'description'],
              },
            },
            affirmation: { type: Type.STRING },
          },
          required: ['title', 'comfortLetter', 'prescriptions', 'affirmation'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const prescriptionData = JSON.parse(jsonText);
    res.json(prescriptionData);
  } catch (err: any) {
    console.error('Error in /api/prescription:', err);
    res.status(500).json({
      error: '마음 처방전을 생성하지 못했습니다.',
      details: err.message,
    });
  }
});

// API: Generate Draft/Message for Difficult Communications or Self Letter
app.post('/api/letter-generator', async (req, res) => {
  try {
    const { target, situation, tone } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    const ai = getGeminiClient();

    const prompt = `
작성 대상: ${target} (예: 악성 학부모 안내 메시지 초안, 나 자신에게 쓰는 칭찬 편지, 반 아이들에게 전할 따뜻한 말)
상황설명: ${situation}
희망 톤앤매너: ${tone || '단호하지만 정중하고 품위 있는 어조'}

선생님이 상황에 직면했을 때 감정 소비를 최소화하면서도 품격 있고 깔끔하게 전달하거나 마음을 다잡을 수 있는 글 초안을 작성해 주세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: '선생님의 감정 보호와 효율적인 소통을 돕는 전문가입니다.',
      },
    });

    res.json({ draft: response.text });
  } catch (err: any) {
    console.error('Error in /api/letter-generator:', err);
    res.status(500).json({ error: '글 초안 생성 중 오류가 발생했습니다.' });
  }
});

// API: Daily Comfort Quote Generator
app.post('/api/generate-quote', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: '지친 교사들에게 힘과 위로를 주는 깊이 있는 한 줄 명언과 가슴 깊이 어루만지는 한 문장 해설을 JSON 형태로 써주세요.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['quote', 'explanation'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({
      quote: "완벽한 교사가 되지 않아도 괜찮습니다. 오늘 아이들과 눈을 맞춘 것만으로도 충분히 아름답습니다.",
      author: "마음샘 위로의 글",
      explanation: "남들과 비교하지 말고, 오늘 내가 건넨 작은 따뜻함 하나에 스스로를 칭찬해 주세요."
    });
  }
});

// Start Express and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
