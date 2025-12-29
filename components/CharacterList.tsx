
import React from 'react';
import { Character } from '../types';

interface CharacterListProps {
  characters: Character[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, onSelect, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((char) => (
        <div
          key={char.id}
          className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer overflow-hidden"
          onClick={() => onSelect(char.id)}
        >
          <div className="flex items-center space-x-4">
            <img
              src={char.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${char.name}`}
              alt={char.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 bg-slate-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">{char.name}</h3>
              <p className="text-xs text-slate-500 font-medium truncate" title={char.status}>
                心理状态: {char.status}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1.5">
              <span>好感度分值</span>
              <span className={char.favorability >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {char.favorability} / 100
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  char.favorability >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, char.favorability))}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {char.personality.split(/[，, ]+/).map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(char.id);
            }}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;
