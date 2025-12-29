
import React, { useState, useEffect } from 'react';
import { Character, Interaction } from './types';
import CharacterList from './components/CharacterList';
import CharacterDetail from './components/CharacterDetail';
import AddCharacterModal from './components/AddCharacterModal';
import { evaluateInteraction } from './services/geminiService';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('affinity_characters');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('affinity_characters', JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (newChar: Omit<Character, 'id' | 'favorability' | 'status' | 'history'>) => {
    const character: Character = {
      ...newChar,
      id: Math.random().toString(36).substr(2, 9),
      favorability: 0,
      status: '陌生人',
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
      };

      setCharacters(prev => prev.map(c => {
        if (c.id === charId) {
          return {
            ...c,
            favorability: Math.max(-100, Math.min(100, c.favorability + result.favorabilityChange)),
            status: result.newStatus,
            history: [newInteraction, ...c.history].slice(0, 50),
          };
        }
        return c;
      }));
    } catch (error) {
      console.error("Interaction failed:", error);
      alert("AI 响应失败，请检查 API Key 或网络状况。");
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = (id: string) => {
    if (confirm("确定要删除这个角色吗？相关的记忆和好感度都将消失。")) {
      setCharacters(characters.filter(c => c.id !== id));
      if (selectedCharacterId === id) setSelectedCharacterId(null);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedCharacterId(null)}>
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              好感度系统
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            添加新人物
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {selectedCharacterId && selectedCharacter ? (
          <CharacterDetail
            character={selectedCharacter}
            onBack={() => setSelectedCharacterId(null)}
            onSendInteraction={(text) => handleInteraction(selectedCharacterId, text)}
            loading={loading}
          />
        ) : (
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">人物列表</h2>
                <p className="text-slate-500 text-sm">点击头像与他们互动，建立专属的情感连接。</p>
              </div>
            </div>
            {characters.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">暂无人物</h3>
                <p className="text-slate-500 mb-6">创建一个角色，开启你的故事之旅。</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors font-medium"
                >
                  立即创建
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
