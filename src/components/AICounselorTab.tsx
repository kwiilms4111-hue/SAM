import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookmarkCheck, Sparkles, RefreshCw, Copy, Check, Server, BarChart3 } from 'lucide-react';
import { ChatMessage } from '../types';
import { saveComfortItemApi, fetchChatHistory, saveChatHistoryApi } from '../lib/storage';
import { StressAnalyticsCard } from './StressAnalyticsCard';

interface AICounselorTabProps {
  onSaveNotice: (msg: string) => void;
  onNavigateToPrescription?: () => void;
}

const PRESET_TOPICS = [
  { id: 'parent', label: '📱 학부모 민원 & 퇴근 후 연락', desc: '과도한 요구나 무례한 연락에 가슴이 답답할 때' },
  { id: 'student', label: '👦 학생 생활지도 & 행동 문제', desc: '아이들과의 소통 및 통제 불능 상황에 무력할 때' },
  { id: 'admin', label: '📋 공문 폭탄 & 행정 업무', desc: '수업보다 행정에 치여 본질을 잃어버린 듯할 때' },
  { id: 'burnout', label: '💔 감정 고갈 & 교직 번아웃', desc: '모든 에너지가 바닥나 아침에 눈뜨기 힘겨울 때' },
  { id: 'quit', label: '🕊️ 교권 침해 & 휴직/퇴직 고민', desc: '선생님으로서의 존엄성이 흔들리고 방황할 때' },
  { id: 'warmth', label: '🌷 조용한 포옹 & 위로', desc: '아무 말 없이 토닥임과 따스함을 느끼고 싶을 때' },
];

export const AICounselorTab: React.FC<AICounselorTabProps> = ({ onSaveNotice, onNavigateToPrescription }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '선생님, 어서 오세요. 오늘 교실과 학교에서 얼마나 애쓰셨나요?\n\n학부모 연락, 아이들 지도, 끊임없는 행정 업무까지... 혼자 견디기엔 너무나 무거운 짐들이었을 거예요. 이곳에서는 그 어떤 눈치도 보지 마시고, 선생님의 솔직한 마음을 편히 털어놓아 주세요. 마음샘이 조용히 경청하고 다정하게 안아드릴게요. 🌱',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [showAnalytics, setShowAnalytics] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load backend chat history if exists
  useEffect(() => {
    const loadBackendChat = async () => {
      const history = await fetchChatHistory();
      if (history && history.length > 0) {
        setMessages(history);
      }
    };
    loadBackendChat();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveHistoryToBackend = (updatedMsgs: ChatMessage[]) => {
    saveChatHistoryApi(updatedMsgs);
  };

  const handleSelectPreset = (topic: typeof PRESET_TOPICS[0]) => {
    setSelectedCategory(topic.label);
    const initialUserMsg = `[${topic.label}] 오늘 학교에서 마음이 너무 지치고 힘들어요.`;
    handleSendMessage(initialUserMsg, topic.label);
  };

  const handleSendMessage = async (textToSend?: string, categoryContext?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      category: categoryContext || selectedCategory || undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          category: categoryContext || selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '답변 생성 실패');
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMsgs = [...newMessages, aiMsg];
      setMessages(finalMsgs);
      saveHistoryToBackend(finalMsgs);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        text: `선생님, 죄송해요. 연결에 잠시 문제가 생겼지만, 선생님의 마음은 온전히 닿았습니다.\n(${err.message || '다시 시도해주세요.'})`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMsgs = [...newMessages, errorMsg];
      setMessages(finalMsgs);
      saveHistoryToBackend(finalMsgs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToComfortBox = async (msg: ChatMessage) => {
    await saveComfortItemApi({
      title: msg.category ? `[${msg.category}] 마음샘 상담` : '마음샘 위로의 대화',
      content: msg.text,
      type: 'counseling',
    });
    setSavedIds((prev) => ({ ...prev, [msg.id]: true }));
    onSaveNotice('선생님의 저장한 위로함(백엔드 저장)에 보관되었습니다. 💚');
  };

  const handleCopyText = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-w-4xl mx-auto bg-white/80 rounded-3xl border border-[#e4dccb] shadow-sm overflow-hidden my-2">
      {/* Top Bar Banner */}
      <div className="bg-[#f5eee0] px-5 py-3 border-b border-[#e2d6c1] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#e1f0e5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#233328]">마음샘 AI 상담실</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <Server className="w-3 h-3" /> 백엔드 보관중
              </span>
            </div>
            <p className="text-[11px] text-[#617065]">
              교사 전문 공감 AI · 대화 스트레스 자동 분석 및 맞춤 상담
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              showAnalytics
                ? 'bg-[#2d5a3f] text-white'
                : 'bg-white border border-[#d2c5b0] text-[#2d5a3f] hover:bg-[#f2efe6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>스트레스 지도 {showAnalytics ? '숨기기' : '보기'}</span>
          </button>

          {onNavigateToPrescription && (
            <button
              onClick={onNavigateToPrescription}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-[#e07a5f] text-white hover:bg-[#cf6a50] rounded-xl transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>마음 처방전</span>
            </button>
          )}
        </div>
      </div>

      {/* Stress Analytics Card Container */}
      {showAnalytics && (
        <div className="px-4 pt-4 bg-[#fbf8f1]">
          <StressAnalyticsCard onNotice={onSaveNotice} />
        </div>
      )}


      {/* Preset Topics Carousel (If initial conversation) */}
      {messages.length <= 2 && (
        <div className="p-4 bg-[#fcfaf5] border-b border-[#ebdcb3] transition-all">
          <p className="text-xs font-semibold text-[#526155] mb-2.5 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span>선생님, 오늘 어떤 마음 때문에 힘드신가요? (주제 클릭)</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelectPreset(topic)}
                className="text-left p-2.5 rounded-2xl bg-white border border-[#e6dbc7] hover:border-[#2d5a3f] hover:bg-[#f2f7f3] transition group"
              >
                <div className="text-xs font-bold text-[#2c3d31] group-hover:text-[#2d5a3f]">
                  {topic.label}
                </div>
                <div className="text-[10px] text-[#718074] mt-0.5 line-clamp-1">
                  {topic.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fdfbf7]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[#e07a5f] text-white'
                  : 'bg-[#2d5a3f] text-[#e1f0e5]'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#2d5a3f] text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-[#223126] border border-[#e8dfcf] rounded-tl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Message Actions */}
              <div
                className={`flex items-center space-x-2 text-[11px] text-[#7d8c80] ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start pl-1'
                }`}
              >
                <span>{msg.timestamp}</span>

                {msg.sender === 'ai' && msg.id !== 'welcome' && (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => handleCopyText(msg)}
                      className="hover:text-[#2d5a3f] transition flex items-center space-x-0.5"
                      title="복사하기"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => handleSaveToComfortBox(msg)}
                      disabled={savedIds[msg.id]}
                      className={`hover:text-[#2d5a3f] transition flex items-center space-x-0.5 ${
                        savedIds[msg.id] ? 'text-[#2d5a3f] font-semibold' : ''
                      }`}
                      title="위로함에 보관하기"
                    >
                      <BookmarkCheck className="w-3 h-3" />
                      <span>{savedIds[msg.id] ? '보관됨' : '위로함 보관'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#2d5a3f] text-[#e1f0e5] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-[#e8dfcf] text-sm text-[#5a6b5d] flex items-center space-x-2 shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2d5a3f]" />
              <span>마음샘이 선생님의 이야기를 깊이 헤아리는 중입니다...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#e2d7c3]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="선생님, 오늘 가슴에 얹혀있는 힘든 마음을 편히 써주세요..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#f8f5ee] border border-[#e0d6c3] text-sm text-[#223126] focus:outline-none focus:border-[#2d5a3f] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#2d5a3f] text-white hover:bg-[#21432f] disabled:opacity-40 transition shrink-0 shadow-sm"
            title="전송"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-[#869689] text-center mt-2">
          💡 마음샘 AI와의 대화는 외부로 유출되지 않으며 안전하게 처리됩니다.
        </p>
      </div>
    </div>
  );
};
