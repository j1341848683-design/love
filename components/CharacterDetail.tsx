
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [character.history]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendInteraction(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      {/* 头部信息 */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="relative">
            <img
              src={character.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${character.name}`}
              className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-200"
              alt=""
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">分析对象：{character.name}</h3>
            <span className="text-xs text-rose-500 font-medium">当前状态：{character.status}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400">关系分值</span>
            <span className={`text-sm font-bold ${character.favorability >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {character.favorability}
            </span>
          </div>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${character.favorability >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} 
              style={{ width: `${50 + (character.favorability / 2)}%` }} // 居中展示，0分在中间
            ></div>
          </div>
        </div>
      </div>

      {/* 记录历史 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20">
        {character.history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm">暂无互动记录。<br/>请在这里输入你们最近发生的具体互动。</p>
          </div>
        ) : (
          [...character.history].reverse().map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>EVENT LOG // {new Date(item.timestamp).toLocaleString()}</span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              {/* 互动记录 */}
              <div className="bg-slate-100/50 border border-slate-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">互动描述</p>
                <p className="text-sm text-slate-700">{item.userInput}</p>
              </div>
              
              {/* AI 分析 */}
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${item.favorabilityChange >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">心理分析报告</p>
                <p className="text-sm text-slate-800 leading-relaxed mb-3">{item.characterResponse}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.favorabilityChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    好感度 {item.favorabilityChange >= 0 ? `+${item.favorabilityChange}` : item.favorabilityChange}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full text-xs animate-pulse">
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在分析人际关系动态...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-3 bg-slate-50 rounded-2xl p-2 pr-4 border border-slate-200 focus-within:border-slate-400 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`记录你与 ${character.name} 的互动事件（例如：今天我们一起看了电影，讨论很愉快）...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none min-h-[44px] max-h-32"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || loading}
            className={`p-2 rounded-xl transition-all mb-1 ${
              inputText.trim() && !loading ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-200 text-slate-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 正向社交</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> 负向冲突</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> AI 中立分析</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
