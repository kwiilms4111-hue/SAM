import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Sparkles, Heart, Bookmark, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { WeatherType, MindPrescription } from '../types';
import { saveMoodLogApi, saveComfortItemApi } from '../lib/storage';

interface StressCheckTabProps {
  onSaveNotice: (msg: string) => void;
}

const WEATHER_OPTIONS: { id: WeatherType; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'sunny', label: '맑음', icon: <Sun className="w-6 h-6 text-amber-500" />, color: 'border-amber-200 bg-amber-50/50', desc: '안정적이고 화사함' },
  { id: 'cloudy', label: '구름', icon: <Cloud className="w-6 h-6 text-slate-400" />, color: 'border-slate-200 bg-slate-50/50', desc: '소소한 피로감' },
  { id: 'rainy', label: '비', icon: <CloudRain className="w-6 h-6 text-blue-500" />, color: 'border-blue-200 bg-blue-50/50', desc: '감정 소모가 큼' },
  { id: 'stormy', label: '뇌우', icon: <CloudLightning className="w-6 h-6 text-purple-600" />, color: 'border-purple-200 bg-purple-50/50', desc: '극심한 번아웃' },
  { id: 'foggy', label: '안개', icon: <CloudFog className="w-6 h-6 text-teal-600" />, color: 'border-teal-200 bg-teal-50/50', desc: '막막함과 무기력' },
];

const QUESTIONS = [
  { id: 'q1', text: '퇴근 후나 주말에도 교실 일이나 학부모/학생 걱정에 마음이 편치 않다.' },
  { id: 'q2', text: '아침에 학교로 출근할 때 가슴이 답답하거나 긴장감이 감돈다.' },
  { id: 'q3', text: '학생 생활지도 상황에서 쉽게 감정이 고갈되거나 무력감을 느낀다.' },
  { id: 'q4', text: '행정 업무와 공문 폭탄으로 수업 준비 본질을 놓쳤다는 생각이 든다.' },
  { id: 'q5', text: '내가 선생님으로서 잘하고 있는지 회의감이 들고 보람을 찾기 힘들다.' },
];

export const StressCheckTab: React.FC<StressCheckTabProps> = ({ onSaveNotice }) => {
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>('rainy');
  const [ratings, setRatings] = useState<Record<string, number>>({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 });
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prescription, setPrescription] = useState<MindPrescription | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate score (0 to 100)
  const totalPoints = (Object.values(ratings) as number[]).reduce((a: number, b: number) => a + b, 0);
  const stressScore = Math.round((totalPoints / 25) * 100);

  const getScoreDiagnosis = (score: number) => {
    if (score <= 30) return { title: '안정 상태 🌿', desc: '현재 에너지가 양호합니다. 나만의 회복 탄력성을 계속 유지하세요.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score <= 60) return { title: '주의 단계 ⚠️', desc: '피로 누적과 감정 소모가 시작되었습니다. 퇴근 후 나만의 온전한 휴식이 필요합니다.', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (score <= 80) return { title: '경고 단계 🌧️', desc: '번아웃 위험 지수가 높습니다. 스스로를 보호하기 위해 업무 경계선을 단단히 세워주세요.', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { title: '고위험 번아웃 🌩️', desc: '감정과 체력이 모두 고갈된 상태입니다. 주변 교사나 전문가 상담, 휴식이 절실합니다.', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleFetchPrescription = async () => {
    setIsLoading(true);
    setPrescription(null);
    setIsSaved(false);

    try {
      const weatherLabel = WEATHER_OPTIONS.find((w) => w.id === selectedWeather)?.label || '비';
      const response = await fetch('/api/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stressScore,
          weather: weatherLabel,
          primaryConcern: primaryConcern.trim() || '교직 업무 및 감정 피로',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '처방전 생성 실패');

      setPrescription(data);

      // Log to history on backend
      await saveMoodLogApi({
        weather: selectedWeather,
        stressScore,
        note: primaryConcern || '스트레스 진단 완료',
      });
    } catch (err: any) {
      alert(err.message || '처방전을 받아오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!prescription) return;
    await saveComfortItemApi({
      title: prescription.title,
      content: `[따뜻한 편지]\n${prescription.comfortLetter}\n\n[3단계 실천 처방]\n${prescription.prescriptions
        .map((p) => `${p.step}. ${p.title}: ${p.description}`)
        .join('\n')}\n\n[자아 보호 주문]\n${prescription.affirmation}`,
      type: 'prescription',
    });
    setIsSaved(true);
    onSaveNotice('선생님의 마음 처방전이 위로함(백엔드 저장)에 안착했습니다. 💚');
  };

  const diag = getScoreDiagnosis(stressScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-2">
      {/* Weather Selection & Self Check Card */}
      <div className="bg-white/90 rounded-3xl p-5 sm:p-7 border border-[#e4dccb] shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#e07a5f] text-white flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1f2d23]">오늘 나의 마음 날씨 & 번아웃 자가진단</h2>
            <p className="text-xs text-[#637367]">스스로의 상태를 인지하는 것만으로도 치유의 첫 걸음입니다.</p>
          </div>
        </div>

        {/* Weather Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#425246] mb-2">1. 오늘 나의 마음 날씨 선택</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {WEATHER_OPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedWeather(item.id)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center space-y-1.5 ${
                  selectedWeather === item.id
                    ? 'border-[#2d5a3f] bg-[#f0f6f2] shadow-xs ring-1 ring-[#2d5a3f]'
                    : `${item.color} hover:border-[#2d5a3f]/50`
                }`}
              >
                {item.icon}
                <span className="text-xs font-bold text-[#233328]">{item.label}</span>
                <span className="text-[10px] text-[#6b7b6f]">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5 Rating Questions */}
        <div className="space-y-4 mb-6">
          <label className="block text-xs font-bold text-[#425246]">2. 교직 피로도 자가 체크 (1점: 전혀 아니다 ~ 5점: 매우 그렇다)</label>
          <div className="space-y-3 bg-[#fbf9f4] p-4 rounded-2xl border border-[#ece4d5]">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-1.5">
                <div className="flex items-start justify-between text-xs text-[#2c3d31]">
                  <span>
                    <strong className="text-[#2d5a3f]">Q{idx + 1}.</strong> {q.text}
                  </span>
                  <span className="font-bold text-[#e07a5f] shrink-0 ml-2">{ratings[q.id]}점</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={ratings[q.id]}
                  onChange={(e) => setRatings({ ...ratings, [q.id]: parseInt(e.target.value) })}
                  className="w-full accent-[#2d5a3f] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Primary Concern Input */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#425246] mb-1.5">
            3. 오늘 나를 가장 힘들게 한 구체적인 상황/단어가 있다면? (선택)
          </label>
          <input
            type="text"
            value={primaryConcern}
            onChange={(e) => setPrimaryConcern(e.target.value)}
            placeholder="예: 6학년 담임인데 학부모의 억지 민원 전화, 수업시간 거친 말하는 학생 지도..."
            className="w-full px-4 py-2.5 rounded-2xl bg-[#f8f5ee] border border-[#ded5c3] text-xs text-[#223126] focus:outline-none focus:border-[#2d5a3f]"
          />
        </div>

        {/* Score & Gauge Result */}
        <div className={`p-4 rounded-2xl border ${diag.color} flex flex-col sm:flex-row items-center justify-between gap-4 mb-6`}>
          <div>
            <div className="text-xs font-semibold opacity-80">진단 지수</div>
            <div className="text-2xl font-black mt-0.5">{stressScore}점 / 100점</div>
            <div className="text-sm font-bold mt-1">{diag.title}</div>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{diag.desc}</p>
          </div>

          <button
            onClick={handleFetchPrescription}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#2d5a3f] text-white hover:bg-[#20422e] font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>맞춤 처방전 작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>AI 맞춤 마음 처방전 발급</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Prescription Card if generated */}
      {prescription && (
        <div className="bg-gradient-to-br from-[#fbf8f1] to-[#f4eee1] rounded-3xl p-6 sm:p-8 border border-[#e2d5be] shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#e2d5be] pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#e07a5f]" />
              <h3 className="text-base font-bold text-[#203125]">{prescription.title}</h3>
            </div>
            <button
              onClick={handleSavePrescription}
              disabled={isSaved}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#2d5a3f] text-white hover:bg-[#1f422e]'
              }`}
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? '처방전 보관됨' : '처방전 보관하기'}</span>
            </button>
          </div>

          {/* Letter Section */}
          <div className="bg-white/90 p-5 rounded-2xl border border-[#e6dbc8] space-y-2">
            <div className="text-xs font-bold text-[#e07a5f] uppercase tracking-wider">💌 마음샘의 따뜻한 편지</div>
            <p className="text-sm text-[#27382d] leading-relaxed whitespace-pre-wrap font-medium">
              {prescription.comfortLetter}
            </p>
          </div>

          {/* 3 Step Actions */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#2d5a3f]">🌿 오늘 퇴근 후 3단계 마음 회복 루틴</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {prescription.prescriptions.map((p) => (
                <div key={p.step} className="bg-white p-4 rounded-2xl border border-[#e2d6c1] shadow-xs space-y-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#e8efe9] text-[#2d5a3f]">
                    STEP {p.step}
                  </span>
                  <h4 className="text-xs font-bold text-[#223126] pt-1">{p.title}</h4>
                  <p className="text-[11px] text-[#5e6d61] leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Affirmation Box */}
          <div className="p-4 rounded-2xl bg-[#2d5a3f] text-white text-center space-y-1">
            <div className="text-[10px] uppercase text-emerald-200 tracking-widest font-semibold">
              🛡️ 선생님을 지켜주는 자아 보호 주문
            </div>
            <blockquote className="text-sm sm:text-base font-bold italic text-amber-100">
              "{prescription.affirmation}"
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
};
