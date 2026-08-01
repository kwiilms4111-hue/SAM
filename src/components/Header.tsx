import React from 'react';
import { HeartHandshake, Stethoscope, Sparkles, Send, Users, Bookmark, PhoneCall, Leaf, BarChart3 } from 'lucide-react';

export type TabType = 'counselor' | 'analytics' | 'stress' | 'mindrest' | 'letter' | 'community';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSaved,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fbf9f4]/90 backdrop-blur-md border-b border-[#e6decb] px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2d5a3f] text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-[#e1f0e5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-[#1e2923] tracking-tight">선생님 마음샘</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#e8efe9] text-[#2d5a3f] border border-[#cbe0d1]">
                  교사 전용 AI 힐링
                </span>
              </div>
              <p className="text-xs text-[#5a685e]">오늘도 애쓰신 선생님을 위한 따뜻한 안식처</p>
            </div>
          </div>

          {/* Saved Drawer & Emergency Button on Mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenSaved}
              className="relative p-2 text-[#3c4a3e] hover:bg-[#eae3d2] rounded-xl transition"
              title="저장한 위로함"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e07a5f] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('counselor')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'counselor'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>AI 마음 상담</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>데이터 분석</span>
          </button>

          <button
            onClick={() => setActiveTab('stress')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'stress'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>날씨 & 처방</span>
          </button>

          <button
            onClick={() => setActiveTab('mindrest')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'mindrest'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>마음 휴식터</span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'letter'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>소통 마음글</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-[#2d5a3f] text-white shadow-sm'
                : 'text-[#4a574d] hover:bg-[#ebe3d3] hover:text-[#1e2923]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>대나무숲</span>
          </button>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={onOpenSaved}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-[#f0e8d8] text-[#2d5a3f] hover:bg-[#e4dac7] rounded-xl border border-[#d8ccb4] transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#2d5a3f]" />
            <span>저장한 위로함</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#e07a5f] text-white rounded-full text-[10px]">
                {savedCount}
              </span>
            )}
          </button>

          <a
            href="tel:1393"
            title="교원 마음건강 & 위기 상담전화"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-medium text-[#7a582c] bg-[#faefe0] hover:bg-[#f3e3ce] rounded-xl border border-[#e8d2b7] transition"
          >
            <PhoneCall className="w-3 h-3 text-[#d97706]" />
            <span>상담전화 1393</span>
          </a>
        </div>
      </div>
    </header>
  );
};
