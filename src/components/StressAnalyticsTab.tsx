import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Sparkles, Brain, AlertCircle, ShieldCheck, HeartHandshake, CheckCircle2, Filter, Layers, MessageSquare, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { StressAnalysisData, StressCategoryScore } from '../types';
import { fetchStressAnalytics, runStressAnalysisApi, fetchChatHistory } from '../lib/storage';

interface StressAnalyticsTabProps {
  onNotice?: (msg: string) => void;
  onNavigateToCounselor?: () => void;
}

export const StressAnalyticsTab: React.FC<StressAnalyticsTabProps> = ({
  onNotice,
  onNavigateToCounselor,
}) => {
  const [analytics, setAnalytics] = useState<StressAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [chatCount, setChatCount] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    const [data, history] = await Promise.all([
      fetchStressAnalytics(),
      fetchChatHistory(),
    ]);
    if (data) {
      setAnalytics(data);
    }
    if (history) {
      setChatCount(history.length);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    const updated = await runStressAnalysisApi();
    if (updated) {
      setAnalytics(updated);
      if (onNotice) {
        onNotice('최근 대화 기록을 바탕으로 스트레스 분석 모델이 갱신되었습니다. 📊');
      }
    } else {
      if (onNotice) {
        onNotice('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
    setIsLoading(false);
  };

  const CATEGORY_ICONS: Record<string, string> = {
    '학부모 민원 및 소통': '📩',
    '과도한 행정 업무': '📄',
    '수업 및 생활지도': '🏫',
    '동료/관리자 관계': '🤝',
    '교권침해 및 번아웃': '💔',
  };

  const CATEGORY_PREVENTIONS: Record<string, { title: string; desc: string; action: string }> = {
    '학부모 민원 및 소통': {
      title: '연락 경계선 구축',
      desc: '퇴근 후 안심번호 모드 설정 및 긴급 건 이외에 지정된 상담 시간에 응대하는 루틴 확립',
      action: '퇴근 후 알림 끄기 & 단호하고 정중한 안내 문구 설정',
    },
    '과도한 행정 업무': {
      title: '행정 처리 우선순위화',
      desc: '필수 제출 문서와 서식성 업무의 템플릿화 및 타이머 기반 집중 처리',
      action: '소통 마음글 탭의 행정 문서 가이드 작성기 활용',
    },
    '수업 및 생활지도': {
      title: '돌발 행동 감정 분리',
      desc: '학생의 대립적 행동을 개인적 공격으로 받아들이지 않고 감정 신호등 3초 호흡법 적용',
      action: '마음 휴식터의 4-7-8 호흡 및 감정 환기 가이드 실행',
    },
    '동료/관리자 관계': {
      title: '심리적 무풍지대 지키기',
      desc: '학교 내부의 불필요한 감정 소모 피하기 및 지지해 주는 동료 교사 그룹 형성',
      action: '대나무숲 응원 라운지에서 같은 고민을 나누는 선생님들과 공감 교류',
    },
    '교권침해 및 번아웃': {
      title: '에너지 재충전 및 전문가 연계',
      desc: '스스로의 한계를 인정하고 긴급 마음건강 상담전화(1393) 및 교원치유지원센터 연계',
      action: '오늘 하루 나만을 위한 수면/휴식 및 마음 처방전 저장',
    },
  };

  const filteredCategories = analytics
    ? selectedCategory === '전체'
      ? analytics.categoryScores
      : analytics.categoryScores.filter((c) => c.category === selectedCategory)
    : [];

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1f422e] via-[#2d5a3f] to-[#3a6b4c] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              교직 스트레스 AI 데이터 분석 센터
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-medium border border-amber-300/30">
              실시간 AI 맞춤 반영
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            선생님의 대화 데이터 분석 & 스트레스 지도
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            마음샘 AI 상담실에서의 대화 내역과 진단을 학습하여, 선생님이 가장 많은 심리적 유발 요인을 겪는 분야(민원, 업무, 수업, 관계 등)를 정확히 정밀 분석합니다.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#1f2d23] text-xs font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? '대화 분석 중...' : '최신 대화 기반 스트레스 재분석'}</span>
            </button>

            {onNavigateToCounselor && (
              <button
                onClick={onNavigateToCounselor}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20 flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>AI 상담실로 가서 대화 나누기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Category Highlight & Overview Stats */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Focus Area */}
          <div className="md:col-span-2 bg-white border border-[#dce8df] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e07a5f] uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-4 h-4" /> 최우선 관리 필요 스트레스 분야
                </span>
                <span className="text-[11px] text-[#637367]">
                  분석 대상 대화 {chatCount}건
                </span>
              </div>

              <div className="mt-2 flex items-center space-x-3">
                <span className="text-3xl">
                  {CATEGORY_ICONS[analytics.primaryCategory] || '🎯'}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#1f2d23]">
                    {analytics.primaryCategory}
                  </h3>
                  <p className="text-xs text-[#526155] mt-0.5">
                    선생님의 대화 패턴에서 가장 높은 감정적 비중을 차지하고 있는 주요 요인입니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3.5 bg-[#f5f9f6] border border-[#cde0d3] rounded-xl text-xs text-[#2a4533] space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AI 상담사의 차별화된 케어 방침</span>
                </div>
                <p className="text-[#455749] leading-relaxed">
                  {analytics.counselingStrategy}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#edf2ee] flex items-center justify-between text-xs text-[#637367]">
              <span>마지막 분석 일시: {analytics.lastAnalyzedAt}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 모델 적용 완료
              </span>
            </div>
          </div>

          {/* Quick Category Summary List */}
          <div className="bg-[#fcfaf5] border border-[#e8ded0] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#1f2d23] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2d5a3f]" />
              5대 스트레스 카테고리 구성
            </h4>

            <div className="space-y-2">
              {analytics.categoryScores.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#ebdcb3]/50 last:border-0">
                  <div className="flex items-center space-x-1.5 font-medium text-[#2f3d32]">
                    <span>{CATEGORY_ICONS[cat.category] || '📌'}</span>
                    <span className="truncate max-w-[130px]">{cat.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e8efe9] text-[#2d5a3f] font-semibold">
                      {cat.count}회 언급
                    </span>
                    <span className="font-bold text-[#2d5a3f] w-8 text-right">{cat.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#dce8df]">
          <RefreshCw className="w-8 h-8 text-[#2d5a3f] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#637367]">스트레스 분석 데이터를 불러오고 있습니다...</p>
        </div>
      )}

      {/* Interactive Category Filter Tabs */}
      <div className="bg-white border border-[#dce8df] rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf2ee] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1f2d23] flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#2d5a3f]" />
              <span>분야별 상세 비율 및 세부 원인 분석</span>
            </h3>
            <p className="text-xs text-[#637367] mt-0.5">
              각 스트레스 분야별 원인과 대응 방안을 선택하여 확인하세요.
            </p>
          </div>

          {/* Category Selector Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('전체')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === '전체'
                  ? 'bg-[#2d5a3f] text-white'
                  : 'bg-[#f4efe3] text-[#526155] hover:bg-[#e8decb]'
              }`}
            >
              전체 보기
            </button>
            {analytics?.categoryScores.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1 ${
                  selectedCategory === cat.category
                    ? 'bg-[#2d5a3f] text-white'
                    : 'bg-[#f4efe3] text-[#526155] hover:bg-[#e8decb]'
                }`}
              >
                <span>{CATEGORY_ICONS[cat.category] || '📌'}</span>
                <span>{cat.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Category Bars & Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((item, idx) => {
            const solution = CATEGORY_PREVENTIONS[item.category];

            return (
              <div
                key={idx}
                className="bg-[#fcfaf5] border border-[#e8ded0] rounded-xl p-4 space-y-3 relative overflow-hidden transition hover:border-[#2d5a3f]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{CATEGORY_ICONS[item.category] || '📌'}</span>
                    <h4 className="text-sm font-bold text-[#1f2d23]">{item.category}</h4>
                  </div>
                  <span className="text-sm font-extrabold text-[#2d5a3f] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {item.score}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#e3dac9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2d5a3f] to-[#e07a5f] transition-all duration-700"
                    style={{ width: `${Math.max(8, item.score)}%` }}
                  />
                </div>

                <p className="text-xs text-[#4a584c] leading-relaxed">
                  <strong className="text-[#1f2d23]">원인 관찰:</strong> {item.description}
                </p>

                {/* Recommended Solution Box */}
                {solution && (
                  <div className="mt-3 pt-3 border-t border-[#ebdcb3] space-y-1.5 bg-white/70 p-3 rounded-lg border border-[#e2d5bd]">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#2d5a3f]">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>추천 가이드: {solution.title}</span>
                    </div>
                    <p className="text-[11px] text-[#5b6b5e]">{solution.desc}</p>
                    <div className="pt-1 text-[11px] font-semibold text-[#1f2d23] flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3 text-[#e07a5f]" />
                      <span>{solution.action}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights & Psychological Patterns */}
      {analytics && analytics.keyInsights.length > 0 && (
        <div className="bg-white border border-[#dce8df] rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#1f2d23] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#e07a5f]" />
            <span>대화 데이터로 관찰된 교사 심리 패턴 3가지</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {analytics.keyInsights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-[#f4f8f5] border border-[#d2e3d6] p-3.5 rounded-xl text-xs space-y-1.5"
              >
                <div className="font-bold text-[#2d5a3f] flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>패턴 0{idx + 1}</span>
                </div>
                <p className="text-[#3a4a3e] leading-relaxed font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
