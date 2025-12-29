
import React from 'react';
import { Character } from '../types';

interface CharacterListProps {
  characters: Character[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, onSelect, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {characters.map((char) => (
        <div
          key={char.id}
          className="group relative glass-card rounded-[2.5rem] p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-white overflow-visible"
          onClick={() => onSelect(char.id)}
        >
          {/* 删除按钮区域 - 绝对定位并使用最高 z-index */}
          <div className="absolute top-2 right-2 z-[99]">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(char.id);
              }}
              className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 bg-white/80 rounded-full shadow-md transition-all active:scale-90 border border-slate-100"
              title="解除关系"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="relative flex flex-col items-center pointer-events-none">
            <div className="relative mb-4">
              <img
                src={char.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${char.name}&backgroundColor=ffd5dc`}
                alt={char.name}
                className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-md bg-white"
              />
            </div>

            <div className="text-center w-full">
              <h3 className="text-2xl font-anime font-black text-slate-800">{char.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1 mb-4">
                <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                  {char.relationshipType}
                </span>
                <span className="text-xs text-slate-400">「{char.status}」</span>
              </div>

              <div className="w-full bg-slate-100/50 h-6 rounded-full overflow-hidden p-1 shadow-inner relative border border-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-pink-300 to-rose-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(2, char.favorability)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600">
                   好感度 {char.favorability}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;
