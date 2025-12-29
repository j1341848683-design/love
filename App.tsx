
import React, { useState, useEffect } from 'react';
import { Character, Interaction, AIProvider } from './types';
import CharacterList from './components/CharacterList';
import CharacterDetail from './components/CharacterDetail';
import AddCharacterModal from './components/AddCharacterModal';
import { evaluateInteraction } from './services/aiService';

const App: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem('affinity_provider') as AIProvider) || 'gemini';
  });
  
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('affinity_characters_real_bonding');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('affinity_characters_real_bonding', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('affinity_provider', provider);
  }, [provider]);

  const addCharacter = (newChar: Omit<Character, 'id' | 'favorability' | 'status' | 'history'>) => {
    const character: Character = {
      ...newChar,
      id: Math.random().toString(36).substr(2, 9),
      favorability: 0,
      status: '关系初始',
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
      const result = await evaluateInteraction(char, text, provider);
      
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
      console.error("Analysis failed:", error);
      alert(`分析失败: ${error instanceof Error ? error.message : "连接超时，请重试"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = (id: string) => {
    if (window.confirm("确定要删除这位联系人吗？所有的互动分析记忆都将消失...")) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      if (selectedCharacterId === id) setSelectedCharacterId(null);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  return (
    <div className="min-h-screen pb-10">
      <header className="px-6 py-6 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setSelectedCharacterId(null)}
        >
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-pink-200 group-hover:rotate-12 transition-transform">
            💝
          </div>
          <div>
            <h1 className="text-2xl font-anime text-slate-800 leading-none tracking-tight">次元羁绊</h1>
            <p className="text-[10px] font-bold text-pink-400 tracking-[0.2em] mt-1.5 uppercase opacity-80">
              现实互动分析系统
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl shadow-sm border border-white">
          <div className="flex bg-slate-100/50 p-1 rounded-xl">
            <button 
              onClick={() => setProvider('gemini')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${provider === 'gemini' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Gemini 3
            </button>
            <button 
              onClick={() => setProvider('siliconflow')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${provider === 'siliconflow' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              硅基流动
            </button>
          </div>

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
                <h3 className="text-2xl font-anime text-slate-700 text-stroke-pink">暂无现实羁绊记录</h3>
                <p className="text-slate-400 mt-3 mb-8 font-medium leading-relaxed">
                  系统已自动配置完成。添加 TA 的资料，记录每一次交集吧！
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-rose-500 text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-pink-200 hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                >
                  <span>添加联系人</span>
                  <span className="text-xl">✨</span>
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
