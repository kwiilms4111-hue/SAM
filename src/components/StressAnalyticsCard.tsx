import React, { useState, useEffect } from 'react';
import { BarChart3, Sparkles, RefreshCw, AlertCircle, ShieldCheck, ChevronDown, ChevronUp, Brain, HeartHandshake } from 'lucide-react';
import { StressAnalysisData } from '../types';
import { fetchStressAnalytics, runStressAnalysisApi } from '../lib/storage';

interface StressAnalyticsCardProps {
  onNotice?: (msg: string) => void;
}

export const StressAnalyticsCard: React.FC<StressAnalyticsCardProps> = ({ onNotice }) => {
  const [analytics, setAnalytics] = useState<StressAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const loadAnalytics = async () => {
    const data = await fetchStressAnalytics();
    if (data) {
      setAnalytics(data);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    const updated = await runStressAnalysisApi();
    if (updated) {
      setAnalytics(updated);
      if (onNotice) {
        onNotice('선생님의 최근 대화를 분석하여 맞춤 스트레스 지도가 업데이트되었습니다! 📊');
      }
    } else {
      if (onNotice) {
        onNotice('스트레스 분석 데이터를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
    setIsLoading(false);
  };

  if (!analytics) return null;

  const getCategoryColor = (category: string) => {
    if (category.includes('학부모')) return 'from-rose-500 to-pink-600 text-rose-700 bg-rose-50';
    if (category.includes('수업') || category.includes('지도')) return 'from-amber-500 to-orange-600 text-amber-700 bg-amber-50';
    if (category.includes('행정')) return 'from-blue-500 to-indigo-600 text-blue-700 bg-blue-50';
    if (category.includes('동료') || category.includes('관계')) return 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50';
    return 'from-purple-500 to-indigo-600 text-purple-700 bg-purple-50';
  };

  return (
    <div className="bg-white/90 backdrop-blur border border-[#d8e5db] rounded-2xl p-4 sm:p-5 mb-5 shadow-sm transition-all duration-300">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#e5eee8] pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#2d5a3f] text-white shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#1f2d23]">나의 대화 기반 스트레스 분석 지도</h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1f472f] font-semibold flex items-center gap-1">
                <Brain className="w-3 h-3 text-emerald-700" /> 맞춤 상담 학습됨
              </span>
            </div>
            <p className="text-xs text-[#617065] mt-0.5">
              상담 대화를 통해 분석된 선생님의 주요 고민 분야와 AI 상담 맞춤 전략
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-[#2d5a3f] hover:bg-[#21432f] text-white text-xs font-medium transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? '분석 중...' : '대화 재분석'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-[#526155] hover:bg-[#f2efe6] transition"
            title={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Top Primary Focus Area Card */}
          <div className="bg-gradient-to-r from-[#2d5a3f]/10 to-[#1f422e]/5 border border-[#cde0d3] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#2d5a3f]">
                <Sparkles className="w-4 h-4 text-[#e07a5f]" />
                <span>선생님이 가장 많은 스트레스를 받는 최우선 분야</span>
              </div>
              <p className="text-base font-extrabold text-[#1f2d23]">
                🎯 {analytics.primaryCategory}
              </p>
              <p className="text-xs text-[#526155]">
                최종 분석 시각: {analytics.lastAnalyzedAt} (분석된 대화 {analytics.totalAnalyzedMessages}건)
              </p>
            </div>

            <div className="bg-white/80 border border-[#b8d4c1] px-3 py-2 rounded-lg text-xs text-[#2d5a3f] font-semibold flex items-center space-x-2 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>마음샘 AI가 이 원인을 기억하여 맞춤 상담을 제공합니다.</span>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#233328]">
              <span>📊 스트레스 원인별 비중 및 세부 요인</span>
              <span className="text-[11px] text-[#637367] font-normal">합계 100%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analytics.categoryScores.map((item, idx) => {
                const colorClass = getCategoryColor(item.category);
                return (
                  <div key={idx} className="bg-[#fcfaf5] border border-[#e8ded0] p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1f2d23]">{item.category}</span>
                      <span className="font-extrabold text-[#2d5a3f]">{item.score}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#e8e2d5] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#5b6b5e] line-clamp-1">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights & Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Insights */}
            <div className="bg-[#f4f8f5] border border-[#d2e3d6] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1f2d23]">
                <AlertCircle className="w-4 h-4 text-[#e07a5f]" />
                <span>관찰된 주요 심리 패턴 & 스트레스 징후</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#3a4a3e]">
                {analytics.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-[#2d5a3f] font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Counseling Strategy */}
            <div className="bg-[#faf5eb] border border-[#e8decb] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1f2d23]">
                <HeartHandshake className="w-4 h-4 text-[#2d5a3f]" />
                <span>마음샘 AI 상담사의 맞춤 케어 방침</span>
              </div>
              <p className="text-xs text-[#4a584c] leading-relaxed">
                {analytics.counselingStrategy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
