import React, { useState, useEffect } from 'react';
import { Users, Heart, Send, Filter, Server } from 'lucide-react';
import { CommunityNote } from '../types';
import { fetchCommunityNotes, addCommunityNoteApi, likeCommunityNoteApi } from '../lib/storage';

const GRADE_FILTERS = ['전체', '초등', '중등', '고등', '유치원/특수'];

export const CommunityTab: React.FC = () => {
  const [notes, setNotes] = useState<CommunityNote[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [isWriting, setIsWriting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [author, setAuthor] = useState('');
  const [grade, setGrade] = useState('초등');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchCommunityNotes();
    setNotes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newNote = await addCommunityNoteApi({
      author: author.trim() || '익명 선생님',
      grade,
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['선생님응원', '오늘도수고했어요'],
    });

    setNotes((prev) => [newNote, ...prev]);
    setContent('');
    setAuthor('');
    setTagInput('');
    setIsWriting(false);
  };

  const handleLike = async (id: string) => {
    const updated = await likeCommunityNoteApi(id);
    setNotes(updated);
  };

  const filteredNotes =
    selectedFilter === '전체' ? notes : notes.filter((n) => n.grade === selectedFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-2">
      {/* Top Banner & Action */}
      <div className="bg-white/90 rounded-3xl p-6 border border-[#e4dccb] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#2d5a3f]" />
            <h2 className="text-lg font-bold text-[#1f2d23]">선생님들의 대나무숲 & 응원 라운지</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
              <Server className="w-3 h-3" /> 백엔드 동기화
            </span>
          </div>
          <p className="text-xs text-[#637367] mt-1">
            혼자가 아닙니다. 전국 선생님들의 사연과 가슴 따뜻한 응원을 익명으로 나누어보세요.
          </p>
        </div>

        <button
          onClick={() => setIsWriting(!isWriting)}
          className="px-4 py-2.5 rounded-2xl bg-[#2d5a3f] text-white font-bold text-xs hover:bg-[#1f422e] transition shadow-xs shrink-0 flex items-center space-x-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isWriting ? '작성 취소' : '응원글 남기기'}</span>
        </button>
      </div>

      {/* Write New Note Collapsible Form */}
      {isWriting && (
        <form onSubmit={handleCreateNote} className="bg-[#fcfaf5] p-5 rounded-3xl border border-[#e2d5bd] space-y-3">
          <h3 className="text-xs font-bold text-[#2d5a3f]">💌 익명 응원글 쓰기</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="닉네임 (예: 초등 3년차 김샘)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#ded5c3] text-xs"
            />
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#ded5c3] text-xs text-[#223126]"
            >
              {GRADE_FILTERS.filter((g) => g !== '전체').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            placeholder="동료 선생님들에게 남기고 싶은 다정한 이야기나 솔직한 사연을 적어주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-[#ded5c3] text-xs text-[#223126] focus:outline-none focus:border-[#2d5a3f] resize-none"
          />

          <input
            type="text"
            placeholder="태그 (쉼표로 구분, 예: 학부모민원, 번아웃, 응원)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#ded5c3] text-xs"
          />

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full py-2.5 bg-[#2d5a3f] text-white rounded-xl text-xs font-bold hover:bg-[#1f422e] disabled:opacity-40 transition"
          >
            응원글 등록하기
          </button>
        </form>
      )}

      {/* Grade Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-[#5a6b5e] shrink-0" />
        {GRADE_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedFilter === filter
                ? 'bg-[#2d5a3f] text-white shadow-xs'
                : 'bg-white text-[#4a584c] hover:bg-[#f0e7d6] border border-[#e4dccb]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3.5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-2xl p-5 border border-[#e6dbc8] shadow-xs space-y-3 hover:border-[#2d5a3f]/40 transition"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#1f2d23]">{note.author}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#e8efe9] text-[#2d5a3f] font-semibold text-[10px]">
                  {note.grade}
                </span>
              </div>
              <span className="text-[11px] text-[#829285]">{note.createdAt}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#27382d] leading-relaxed whitespace-pre-wrap font-medium">
              {note.content}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#f2ebd9] text-xs">
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-[#708273] bg-[#f5f0e4] px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleLike(note.id)}
                className="flex items-center space-x-1 text-xs text-[#e07a5f] hover:text-[#c75d42] font-semibold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>공감 {note.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
