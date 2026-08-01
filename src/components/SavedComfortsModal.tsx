import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Heart, Server } from 'lucide-react';
import { SavedComfort } from '../types';
import { fetchSavedComforts, deleteSavedComfortApi } from '../lib/storage';

interface SavedComfortsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedComfortsModal: React.FC<SavedComfortsModalProps> = ({ isOpen, onClose }) => {
  const [comforts, setComforts] = useState<SavedComfort[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchSavedComforts();
    setComforts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    const updated = await deleteSavedComfortApi(id);
    setComforts(updated);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf7f0] w-full max-w-2xl max-h-[85vh] rounded-3xl border border-[#e2d6c1] shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#e6dbc8] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#2d5a3f] text-white flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#1f2d23]">저장한 위로함</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                  <Server className="w-3 h-3" /> 백엔드 동기화됨
                </span>
              </div>
              <p className="text-xs text-[#637367]">백엔드 서버에 안전하게 보관되는 선생님만의 보물상자</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5a6b5e] hover:bg-[#f0e7d6] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-[#708073]">
              백엔드 서버에서 저장된 데이터를 불러오는 중...
            </div>
          ) : comforts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#708073] space-y-2">
              <Heart className="w-8 h-8 mx-auto text-[#e07a5f] opacity-50" />
              <p className="font-bold">아직 보관된 위로글이 없습니다.</p>
              <p>AI 상담 대화나 마음 처방전을 보관해보세요.</p>
            </div>
          ) : (
            comforts.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#e4dac8] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2d5a3f]">{item.title}</span>
                  <span className="text-[10px] text-[#829285]">{item.date}</span>
                </div>

                <div className="p-3 bg-[#fbf9f4] rounded-xl text-xs text-[#223126] leading-relaxed whitespace-pre-wrap font-medium">
                  {item.content}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#3b4d40] hover:bg-[#f0e8d8] rounded-lg transition flex items-center space-x-1"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

