
import React, { useState } from 'react';

interface AddCharacterModalProps {
  onClose: () => void;
  onAdd: (char: { name: string; relationshipType: string; personality: string; description: string; avatarUrl: string }) => void;
}

const AddCharacterModal: React.FC<AddCharacterModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('朋友');
  const [personality, setPersonality] = useState('');
  const [description, setDescription] = useState('');

  const relTypes = ['朋友', '同事', '恋人', '家人', '暗恋对象', '导师', '初识者'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !personality) return;
    onAdd({ name, relationshipType, personality, description, avatarUrl: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border-4 border-white">
        <div className="bg-rose-500/10 p-6 border-b border-rose-100 text-center">
          <h2 className="text-2xl font-anime text-rose-600">添加现实羁绊</h2>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] mt-1">开启好感度追踪与行为分析</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 ml-1">对方称呼</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="TA的名字"
                className="w-full bg-white/60 border-2 border-pink-50 rounded-2xl px-4 py-2.5 text-sm focus:border-pink-300 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 ml-1">现实关系</label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
                className="w-full bg-white/60 border-2 border-pink-50 rounded-2xl px-4 py-2.5 text-sm focus:border-pink-300 outline-none"
              >
                {relTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 ml-1">性格描述</label>
            <input
              required
              type="text"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="如：严谨、温和、慢热、大大咧咧..."
              className="w-full bg-white/60 border-2 border-pink-50 rounded-2xl px-4 py-2.5 text-sm focus:border-pink-300 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 ml-1">背景备注 (可选)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="记录关于TA的喜好、雷点或重要的往事..."
              className="w-full bg-white/60 border-2 border-pink-50 rounded-2xl px-4 py-3 text-sm focus:border-pink-300 outline-none h-24 resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-400 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-[2] bg-rose-500 text-white font-bold py-3.5 rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-pink-100 active:scale-95"
            >
              确立记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCharacterModal;
