
import React, { useState, useRef, useEffect } from 'react';
import { Character } from '../types';

interface CharacterDetailProps {
  character: Character;
  onBack: () => void;
  onSendInteraction: (text: string) => void;
  loading: boolean;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({ character, onBack, onSendInteraction, loading }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [character.history]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendInteraction(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* 顶部状态栏 */}
      <div className="glass-card rounded-3xl p-4 flex items-center justify-between shadow-sm border-2 border-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-full text-pink-500 shadow-sm hover:scale-110 transition-transform border border-pink-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h3 className="font-anime text-xl text-slate-800 tracking-tight">{character.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-pink-400 font-bold tracking-widest uppercase">好感记录分析中</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="heart-pulse text-rose-500 text-xl">❤️</span>
            <span className="text-2xl font-black text-rose-500 leading-none">{character.favorability}%</span>
          </div>
          <div className="w-24 h-2 bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-pink-300 to-rose-500 transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.3)]" 
              style={{ width: `${character.favorability}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-2 custom-scrollbar">
        {character.history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-pink-50">
              <span className="text-5xl">📖</span>
            </div>
            <p className="font-anime text-pink-400 text-lg">尚未记录互动</p>
            <p className="text-xs text-slate-400 mt-1 font-medium italic">输入一件你们之间发生的小事，AI 将为你分析...</p>
          </div>
        ) : (
          [...character.history].reverse().map((item) => (
            <div key={item.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 用户行为记录 */}
              <div className="flex justify-end pr-2">
                <div className="bg-slate-700 text-white rounded-[1.2rem] rounded-tr-none px-4 py-2.5 text-sm shadow-md max-w-[85%] border border-slate-600 font-medium">
                  {item.userInput}
                </div>
              </div>
              
              {/* AI 分析反馈 */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-md flex-shrink-0 bg-indigo-500 flex items-center justify-center text-white text-xl">
                  🤖
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className="glass-card border-l-4 border-l-indigo-400 rounded-[1.2rem] rounded-tl-none px-4 py-3 shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-indigo-500 uppercase tracking-tighter">AI 分析报告</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.favorabilityChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        羁绊 {item.favorabilityChange >= 0 ? `+${item.favorabilityChange}` : item.favorabilityChange}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-bold italic">“{item.characterResponse}”</p>
                    
                    {/* 判定理由 */}
                    {item.reasoning && (
                      <div className="mt-3 pt-2.5 border-t border-indigo-100/50">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-1 h-1 rounded-full bg-indigo-300"></span>
                          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">深度判定依据</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          {item.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500 text-white rounded-full text-xs font-black animate-bounce mx-auto w-fit shadow-xl">
            <span>正在深度解析社交行为...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="glass-card rounded-[2rem] p-3 shadow-xl border-2 border-white">
        <div className="flex items-center gap-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`描述一下发生了什么（如：今天我请 TA 喝了咖啡）...`}
            className="flex-1 bg-white/40 border-none focus:ring-2 focus:ring-pink-200 rounded-2xl text-sm py-3 px-4 resize-none h-[52px] placeholder:text-slate-300 font-bold"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || loading}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90 ${
              inputText.trim() && !loading ? 'bg-rose-500 text-white scale-100 shadow-pink-200' : 'bg-slate-200 text-slate-400 scale-95 opacity-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
