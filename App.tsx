
import React, { useState, useEffect } from 'react';
import { Character, Interaction } from './types';
import CharacterList from './components/CharacterList';
import CharacterDetail from './components/CharacterDetail';
import AddCharacterModal from './components/AddCharacterModal';
import { evaluateInteraction, testAIConnection } from './services/aiService';

// 定义 AIStudio 接口以匹配全局类型要求
interface AIStudio {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

// 声明全局 window 扩展，使用统一的 AIStudio 类型并解决修饰符冲突
declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('affinity_characters_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // 初始化检查 API Key
  useEffect(() => {
    const checkStatus = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // 如果不在特定环境下，假设已经有 key (由环境变量注入)
        setHasApiKey(!!process.env.API_KEY);
      }
      setCheckingKey(false);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem('affinity_characters_v2', JSON.stringify(characters));
  }, [characters]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // 触发后直接进入，信任系统会自动注入 key (遵循 SDK 的竞赛条件处理指南)
      setHasApiKey(true);
    }
  };

  const addCharacter = (newChar: Omit<Character, 'id' | 'favorability' | 'status' | 'history'>) => {
    const character: Character = {
      ...newChar,
      id: Math.random().toString(36).substr(2, 9),
      favorability: 0,
      status: '新识',
      history: [],
    };
    setCharacters([...characters, character]);
    setIsModalOpen(false);
  };

  const handleInteraction = async (charId: string, text: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;

    setLoading(true);
    try {
      const result = await evaluateInteraction(char, text);
      
      const newInteraction: Interaction = {
        id: Math.random().toString(36).substr(2, 9),
        userInput: text,
        characterResponse: result.characterResponse,
        favorabilityChange: result.favorabilityChange,
        timestamp: Date.now(),
        reasoning: result.reasoning,
      };

      setCharacters(prev => prev.map(c => {
        if (c.id === charId) {
          const newFav = Math.max(0, Math.min(100, c.favorability + result.favorabilityChange));
          return {
            ...c,
            favorability: newFav,
            status: result.newStatus,
            history: [newInteraction, ...c.history].slice(0, 50),
          };
        }
        return c;
      }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      
      // 如果报错显示 entity not found，重置 key 选择状态以引导用户重新配置 (遵循 SDK 指南)
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
      
      alert(`⚠️ 羁绊解析中断\n原因: ${error instanceof Error ? error.message : "连接超时，请检查网络或重新配置 Key"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = (id: string) => {
    if (window.confirm("确定要删除这位联系人吗？记录将永久消失。")) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      if (selectedCharacterId === id) setSelectedCharacterId(null);
    }
  };

  // 未配置 Key 时的引导界面 (遵循 SDK 指南提供计费文档链接)
  if (!checkingKey && hasApiKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#fff8fa]">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border-4 border-pink-100">
          <span className="text-5xl">🔑</span>
        </div>
        <h1 className="text-2xl font-anime text-slate-800 mb-4">建立现实连接</h1>
        <p className="text-slate-500 mb-8 max-w-xs leading-relaxed text-sm">
          为了启动互动分析引擎，我们需要配置 <span className="text-rose-500 font-bold">Gemini 3</span> 的核心波长。
        </p>
        <button
          onClick={handleOpenKeySelector}
          className="bg-rose-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>配置 API Key</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-xs text-rose-300 underline"
        >
          计费与额度说明
        </a>
      </div>
    );
  }

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  return (
    <div className="min-h-screen pb-10">
      <header className="px-6 py-6 max-w-5xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setSelectedCharacterId(null)}
        >
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-pink-200 group-hover:rotate-12 transition-transform">
            💝
          </div>
          <div>
            <h1 className="text-2xl font-anime text-slate-800 leading-none">次元羁绊</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">系统已就绪</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!selectedCharacterId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-500 text-white w-10 h-10 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button 
            onClick={handleOpenKeySelector}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
            title="重新配置密钥"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-4">
        {selectedCharacterId && selectedCharacter ? (
          <CharacterDetail
            character={selectedCharacter}
            onBack={() => setSelectedCharacterId(null)}
            onSendInteraction={(text) => handleInteraction(selectedCharacterId, text)}
            loading={loading}
          />
        ) : (
          <div className="animate-in fade-in duration-700">
            {characters.length === 0 ? (
              <div className="mt-16 text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-8 border-pink-50 relative group">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🤝</span>
                </div>
                <h3 className="text-2xl font-anime text-slate-700 text-stroke-pink">暂无现实记录</h3>
                <p className="text-slate-400 mt-3 mb-8 text-sm max-w-xs mx-auto">
                  记录你与现实联系人的每一次互动，由 Gemini 3 深度解析情感羁绊。
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-rose-500 text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-pink-200 hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all mx-auto"
                >
                  添加羁绊对象
                </button>
              </div>
            ) : (
              <CharacterList 
                characters={characters} 
                onSelect={setSelectedCharacterId} 
                onDelete={deleteCharacter}
              />
            )}
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddCharacterModal
          onClose={() => setIsModalOpen(false)}
          onAdd={addCharacter}
        />
      )}
    </div>
  );
};

export default App;
