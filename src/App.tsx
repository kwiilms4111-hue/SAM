import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { AICounselorTab } from './components/AICounselorTab';
import { StressAnalyticsTab } from './components/StressAnalyticsTab';
import { StressCheckTab } from './components/StressCheckTab';
import { MindRestTab } from './components/MindRestTab';
import { LetterDraftTab } from './components/LetterDraftTab';
import { CommunityTab } from './components/CommunityTab';
import { SavedComfortsModal } from './components/SavedComfortsModal';
import { getSavedComforts } from './lib/storage';
import { Sparkles, PhoneCall, Heart, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('counselor');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daily Quote
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; explanation: string }>({
    quote: "완벽한 교사가 되지 않아도 괜찮습니다. 오늘 아이들과 눈을 맞춘 것만으로도 충분히 아름답습니다.",
    explanation: "남들과 비교하지 말고, 오늘 내가 건넨 작은 따뜻함 하나에 스스로를 칭찬해 주세요.",
  });
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const updateSavedCount = () => {
    setSavedCount(getSavedComforts().length);
  };

  useEffect(() => {
    updateSavedCount();
    fetchDailyQuote();
  }, []);

  const fetchDailyQuote = async () => {
    setIsQuoteLoading(true);
    try {
      const res = await fetch('/api/generate-quote', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.quote) setDailyQuote(data);
      }
    } catch {
      // Fallback is already set
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    updateSavedCount();
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#1e2923] font-sans flex flex-col antialiased selection:bg-[#2d5a3f] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2d5a3f] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCount}
        onOpenSaved={() => {
          updateSavedCount();
          setIsSavedModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:px-6">
        {/* Daily Healing Banner */}
        <div className="bg-gradient-to-r from-[#2d5a3f] to-[#1f422e] text-white rounded-2xl p-4 sm:p-5 mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>오늘 교사 선생님을 어루만지는 한 줄 명언</span>
            </div>
            <p className="text-sm sm:text-base font-bold italic text-amber-100">
              "{dailyQuote.quote}"
            </p>
            <p className="text-xs text-[#d3e5d8] line-clamp-1">{dailyQuote.explanation}</p>
          </div>

          <button
            onClick={fetchDailyQuote}
            disabled={isQuoteLoading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition shrink-0 flex items-center space-x-1 self-end sm:self-center"
            title="새 명언 불러오기"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQuoteLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">다른 명언</span>
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'counselor' && (
          <AICounselorTab
            onSaveNotice={showToast}
            onNavigateToPrescription={() => setActiveTab('stress')}
          />
        )}
        {activeTab === 'analytics' && (
          <StressAnalyticsTab
            onNotice={showToast}
            onNavigateToCounselor={() => setActiveTab('counselor')}
          />
        )}
        {activeTab === 'stress' && <StressCheckTab onSaveNotice={showToast} />}
        {activeTab === 'mindrest' && <MindRestTab />}
        {activeTab === 'letter' && <LetterDraftTab onSaveNotice={showToast} />}
        {activeTab === 'community' && <CommunityTab />}
      </main>

      {/* Footer Resources */}
      <footer className="bg-[#ebdcb3]/40 border-t border-[#e2d5bd] py-6 px-4 mt-8 text-xs text-[#526155]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-bold text-[#233328] flex items-center justify-center md:justify-start space-x-1">
              <Heart className="w-3.5 h-3.5 text-[#e07a5f] fill-current" />
              <span>선생님 마음샘 · 대한민국 교사를 위한 따뜻한 AI 안식처</span>
            </div>
            <p className="text-[11px] text-[#6b7b6e]">
              본 앱은 교직 스트레스 완화 및 마음 정돈을 돕는 가이드이며, 의료적 처방을 대체하지 않습니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-semibold text-[#2d5a3f]">
            <a href="tel:1393" className="hover:underline flex items-center space-x-1">
              <PhoneCall className="w-3 h-3" />
              <span>교원 마음건강 상담 1393</span>
            </a>
            <span>·</span>
            <a href="tel:1577-0199" className="hover:underline">
              정신건강 상담전화 1577-0199
            </a>
            <span>·</span>
            <a href="tel:1588-9191" className="hover:underline">
              생명의 전화 1588-9191
            </a>
          </div>
        </div>
      </footer>

      {/* Saved Drawer Modal */}
      <SavedComfortsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
      />
    </div>
  );
}
