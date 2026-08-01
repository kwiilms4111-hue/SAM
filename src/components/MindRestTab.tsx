import React, { useState, useEffect } from 'react';
import { Wind, Trash2, Sparkles, Heart, Play, Pause, RotateCcw, Plus, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COMFORT_RECOVERIES = [
  "나를 상처 입힌 말들은 나 자신의 가치가 아닙니다. 가볍게 내려놓습니다.",
  "학교 문을 나서는 순간, 내 삶과 교실을 완전 분리합니다.",
  "오늘 하루 최선을 다한 나 자신에게 깊은 감사를 건넵니다.",
  "나는 모든 아이들을 완벽하게 다 바꿀 수 없으며, 그것은 나의 잘못이 아닙니다.",
  "내 가치는 남들의 무례한 한마디로 훼손되지 않습니다.",
];

export const MindRestTab: React.FC = () => {
  // 1. Breathing State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'In' | 'Hold' | 'Out'>('In');
  const [countdown, setCountdown] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  // 2. Thought Release State
  const [heavyThought, setHeavyThought] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [releasedQuote, setReleasedQuote] = useState<string | null>(null);

  // 3. Gratitude Jar State
  const [gratitudes, setGratitudes] = useState<string[]>([
    "오늘 아이들이 '선생님 안녕하세요!' 밝게 인사해 준 순간",
    "동료 선생님이 건네주신 유자차 한 잔의 따뜻함",
    "퇴근길 하강하는 석양 노을빛이 너무 예뻤던 순간",
  ]);
  const [newGratitude, setNewGratitude] = useState('');
  const [randomGratitude, setRandomGratitude] = useState<string | null>(null);

  // Breathing Loop Timer
  useEffect(() => {
    if (!isBreathing) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Phase Transition
        if (breathPhase === 'In') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Out');
          return 8;
        } else {
          setBreathPhase('In');
          setCompletedCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathing, breathPhase]);

  const toggleBreathing = () => {
    if (!isBreathing) {
      setIsBreathing(true);
      setBreathPhase('In');
      setCountdown(4);
    } else {
      setIsBreathing(false);
    }
  };

  const handleReleaseThought = () => {
    if (!heavyThought.trim()) return;
    setIsDissolving(true);

    setTimeout(() => {
      setIsDissolving(false);
      setHeavyThought('');
      const randomQ = COMFORT_RECOVERIES[Math.floor(Math.random() * COMFORT_RECOVERIES.length)];
      setReleasedQuote(randomQ);
    }, 2000);
  };

  const handleAddGratitude = () => {
    if (!newGratitude.trim()) return;
    setGratitudes([newGratitude.trim(), ...gratitudes]);
    setNewGratitude('');
  };

  const handlePickRandomGratitude = () => {
    if (gratitudes.length === 0) return;
    const picked = gratitudes[Math.floor(Math.random() * gratitudes.length)];
    setRandomGratitude(picked);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 my-2">
      {/* Tool 1: 4-7-8 Breathing Guide */}
      <div className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-[#e4dccb] shadow-xs text-center space-y-6">
        <div className="max-w-md mx-auto space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e8efe9] text-[#2d5a3f] text-xs font-bold">
            <Wind className="w-3.5 h-3.5" />
            <span>4-7-8 신경 자율신경계 안정 호흡법</span>
          </div>
          <h2 className="text-xl font-bold text-[#1f2d23]">퇴근 후 긴장 완화 & 호흡 리듬</h2>
          <p className="text-xs text-[#637367]">
            코로 4초 들숨 → 7초 멈춤 → 입으로 8초 날숨으로 가슴 속 열과 스트레스를 내보내세요.
          </p>
        </div>

        {/* Animated Breathing Circle */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
          <motion.div
            animate={{
              scale: !isBreathing ? 1 : breathPhase === 'In' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.9,
            }}
            transition={{
              duration: breathPhase === 'In' ? 4 : breathPhase === 'Hold' ? 0.1 : 8,
              ease: 'easeInOut',
            }}
            className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-white/80 ${
              breathPhase === 'In'
                ? 'bg-gradient-to-tr from-[#2d5a3f] to-[#4c8561]'
                : breathPhase === 'Hold'
                ? 'bg-gradient-to-tr from-[#e07a5f] to-[#f4a261]'
                : 'bg-gradient-to-tr from-[#3d5a80] to-[#98c1d9]'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-100">
              {isBreathing ? (breathPhase === 'In' ? '들숨 🌬️' : breathPhase === 'Hold' ? '멈춤 🛑' : '날숨 💨') : '준비'}
            </span>
            <span className="text-4xl font-black my-1">{isBreathing ? countdown : '4-7-8'}</span>
            <span className="text-[11px] opacity-90">
              {isBreathing
                ? breathPhase === 'In'
                  ? '코로 천천히 마시기'
                  : breathPhase === 'Hold'
                  ? '숨 참고 마음 가다듬기'
                  : '입으로 천천히 내쉬기'
                : '시작 버튼 클릭'}
            </span>
          </motion.div>
        </div>

        {/* Breathing Controls & Cycle Count */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleBreathing}
            className={`px-6 py-3 rounded-2xl font-bold text-xs text-white flex items-center space-x-2 transition shadow-sm ${
              isBreathing ? 'bg-[#e07a5f] hover:bg-[#c96349]' : 'bg-[#2d5a3f] hover:bg-[#1f402c]'
            }`}
          >
            {isBreathing ? (
              <>
                <Pause className="w-4 h-4" />
                <span>호흡 일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>호흡 시작하기</span>
              </>
            )}
          </button>

          {completedCycles > 0 && (
            <span className="text-xs font-semibold text-[#2d5a3f] bg-[#e8efe9] px-3 py-1.5 rounded-xl border border-[#cbe0d1]">
              완료한 호흡 사이클: {completedCycles}회 🌿
            </span>
          )}
        </div>
      </div>

      {/* Grid: Thought Release + Joy Jar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 2: Thought Release Notepad */}
        <div className="bg-white/90 rounded-3xl p-6 border border-[#e4dccb] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Trash2 className="w-5 h-5 text-[#e07a5f]" />
              <h3 className="text-base font-bold text-[#1f2d23]">마음 비우기 (불필요한 생각 정돈)</h3>
            </div>
            <p className="text-xs text-[#637367]">
              오늘 나를 상처 입힌 학부모의 자극적인 문장이나 무거운 생각을 적고 바람에 흩날려 보내세요.
            </p>

            <div className="relative mt-4">
              <AnimatePresence>
                {isDissolving ? (
                  <motion.div
                    initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    animate={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium min-h-[110px] flex items-center justify-center text-center"
                  >
                    ✨ 마음에 얹힌 무거운 단어들이 연기처럼 사라집니다...
                  </motion.div>
                ) : (
                  <textarea
                    value={heavyThought}
                    onChange={(e) => setHeavyThought(e.target.value)}
                    placeholder="예: '선생님이 아이를 차별하신 거 아닌가요?'라는 말에 하루 종일 가슴이 쓰라렸다..."
                    rows={4}
                    className="w-full p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#e0d6c3] text-xs text-[#223126] focus:outline-none focus:border-[#e07a5f] resize-none"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <button
              onClick={handleReleaseThought}
              disabled={!heavyThought.trim() || isDissolving}
              className="w-full py-2.5 rounded-xl bg-[#e07a5f] hover:bg-[#cf664b] text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>바람에 흩날려 보내기</span>
            </button>

            {releasedQuote && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-[#e8efe9] border border-[#cbe0d1] text-xs text-[#2d5a3f] font-semibold text-center"
              >
                💚 {releasedQuote}
              </motion.div>
            )}
          </div>
        </div>

        {/* Tool 3: Joy & Gratitude Jar */}
        <div className="bg-white/90 rounded-3xl p-6 border border-[#e4dccb] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Gift className="w-5 h-5 text-[#2d5a3f]" />
              <h3 className="text-base font-bold text-[#1f2d23]">보람 & 감사 항아리</h3>
            </div>
            <p className="text-xs text-[#637367]">
              작지만 따스했던 기억을 저장하고, 힘들 때 꺼내어 보며 스스로를 토닥여주세요.
            </p>

            {/* Input New Memory */}
            <div className="flex space-x-2 mt-4">
              <input
                type="text"
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                placeholder="예: 오늘 민우가 꽃 그림을 건네준 따뜻함..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#fbf9f4] border border-[#e0d6c3] text-xs focus:outline-none focus:border-[#2d5a3f]"
              />
              <button
                onClick={handleAddGratitude}
                className="px-3 py-2 bg-[#2d5a3f] text-white rounded-xl text-xs font-bold hover:bg-[#1f422e] shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List Preview */}
            <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pr-1 text-xs text-[#3a4b3d]">
              {gratitudes.map((g, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-[#f5f1e8] border border-[#e8dfce] flex items-center space-x-2">
                  <Heart className="w-3 h-3 text-[#e07a5f] shrink-0 fill-current" />
                  <span className="truncate">{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handlePickRandomGratitude}
              className="w-full py-2.5 rounded-xl bg-[#2d5a3f] hover:bg-[#20422e] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
              <span>항아리에서 감동 기억 하나 꺼내기</span>
            </button>

            {randomGratitude && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold text-center space-y-1"
              >
                <div className="text-[10px] text-amber-700 uppercase font-extrabold">🎁 뽑힌 기억 보물</div>
                <p>"{randomGratitude}"</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
