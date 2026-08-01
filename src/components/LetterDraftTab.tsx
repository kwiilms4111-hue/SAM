import React, { useState } from 'react';
import { Send, Copy, Check, Sparkles, RefreshCw, Bookmark, ShieldAlert, Heart, UserCheck } from 'lucide-react';
import { saveComfortItem } from '../lib/storage';

interface LetterDraftTabProps {
  onSaveNotice: (msg: string) => void;
}

const TEMPLATE_PRESETS = [
  {
    target: '학부모 민원 대응',
    situation: '퇴근 후 무례하거나 과도한 전화/카톡 요구에 대해, 교사의 품위를 지키며 근무 시간 내 상담 안내로 단호히 거절하기',
    tone: '단호함과 예의를 갖춘 전문적 어조',
    icon: <ShieldAlert className="w-4 h-4 text-[#e07a5f]" />,
  },
  {
    target: '학생 생활지도 경계선 안내',
    situation: '수업 및 교실 규칙을 자꾸 어기는 학생에게, 감정적 비난 없이 행동의 변화를 일깨우고 마음을 여는 편지 글',
    tone: '따뜻하면서도 명확한 규칙을 강조하는 어조',
    icon: <UserCheck className="w-4 h-4 text-[#2d5a3f]" />,
  },
  {
    target: '나 자신에게 건네는 칭찬과 격려',
    situation: '오늘 하루도 치열하게 버텨낸 나 자신에게, 남들의 인정에 연연하지 말고 충분히 훌륭하다는 상기 편지',
    tone: '진심 어린 다정함과 포옹의 어조',
    icon: <Heart className="w-4 h-4 text-[#e07a5f]" />,
  },
];

export const LetterDraftTab: React.FC<LetterDraftTabProps> = ({ onSaveNotice }) => {
  const [target, setTarget] = useState('학부모 민원 대응');
  const [situation, setSituation] = useState(TEMPLATE_PRESETS[0].situation);
  const [tone, setTone] = useState(TEMPLATE_PRESETS[0].tone);
  const [isLoading, setIsLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectPreset = (p: typeof TEMPLATE_PRESETS[0]) => {
    setTarget(p.target);
    setSituation(p.situation);
    setTone(p.tone);
  };

  const handleGenerateLetter = async () => {
    if (!situation.trim() || isLoading) return;
    setIsLoading(true);
    setDraftResult(null);
    setIsCopied(false);
    setIsSaved(false);

    try {
      const response = await fetch('/api/letter-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, situation, tone }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '글 생성 실패');

      setDraftResult(data.draft);
    } catch (err: any) {
      alert(err.message || '글 초안 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!draftResult) return;
    saveComfortItem({
      title: `[${target}] 글 초안`,
      content: draftResult,
      type: 'quote',
    });
    setIsSaved(true);
    onSaveNotice('선생님의 글 초안이 위로함에 보관되었습니다. 💚');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-2">
      <div className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-[#e4dccb] shadow-xs space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-[#2d5a3f]" />
            <h2 className="text-lg font-bold text-[#1f2d23]">소통 마음글 & 소통 초안 도우미</h2>
          </div>
          <p className="text-xs text-[#637367] mt-1">
            소통 과정에서 쓸데없는 감정 소모를 줄이세요. AI가 교권 경계선과 품위를 지켜주는 다듬어진 문장을 대신 작성해 드립니다.
          </p>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TEMPLATE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className={`p-3 rounded-2xl border text-left transition ${
                target === p.target
                  ? 'border-[#2d5a3f] bg-[#f0f6f2] shadow-xs ring-1 ring-[#2d5a3f]'
                  : 'border-[#e8dfce] bg-[#fcfaf5] hover:border-[#2d5a3f]/50'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs text-[#223126] mb-1">
                {p.icon}
                <span>{p.target}</span>
              </div>
              <p className="text-[11px] text-[#637367] line-clamp-2 leading-tight">{p.situation}</p>
            </button>
          ))}
        </div>

        {/* Custom Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#425246] mb-1">작성 대상 및 구체적 상황</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={3}
              placeholder="상황을 자유롭게 써주세요 (예: 6학년 학부모님이 주말 밤에 전화하셔서 아이 친구 관계에 대해 항의하실 때 정중하고 단호히 답변할 메시지)"
              className="w-full p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#e0d6c3] text-xs text-[#223126] focus:outline-none focus:border-[#2d5a3f] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#425246] mb-1">희망 어조 / 톤앤매너</label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="예: 단호하지만 정중함, 따뜻하고 공감하는 어조, 품위 있는 공식 문체"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#fbf9f4] border border-[#e0d6c3] text-xs text-[#223126] focus:outline-none focus:border-[#2d5a3f]"
            />
          </div>

          <button
            onClick={handleGenerateLetter}
            disabled={!situation.trim() || isLoading}
            className="w-full py-3 rounded-2xl bg-[#2d5a3f] hover:bg-[#1f422e] text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>품격 있는 글 작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>글 초안 생성하기</span>
              </>
            )}
          </button>
        </div>

        {/* Result Area */}
        {draftResult && (
          <div className="bg-[#fcfaf5] rounded-2xl p-5 border border-[#e4d9c5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d5a3f]">✨ 생성된 완성 글 초안</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#ded3be] text-xs font-semibold text-[#2f3f33] hover:bg-[#f3edd9] flex items-center space-x-1 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '복사 완료' : '텍스트 복사'}</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className="px-3 py-1.5 rounded-xl bg-[#2d5a3f] text-white text-xs font-semibold hover:bg-[#1f422e] flex items-center space-x-1 transition disabled:opacity-60"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? '보관됨' : '위로함 보관'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e6dbc8] text-xs text-[#223126] leading-relaxed whitespace-pre-wrap font-medium">
              {draftResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
