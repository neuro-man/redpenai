

import React, { useState, useEffect, useRef } from 'react';
import { AudiencePersona, AUDIENCE_PERSONAS } from '../types';
import { simulateReader } from '../services/geminiService';

interface AudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export const AudienceModal: React.FC<AudienceModalProps> = ({ isOpen, onClose, content }) => {
  const [selectedPersona, setSelectedPersona] = useState<AudiencePersona | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Persona State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customDescription, setCustomDescription] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Reset state on open
        setFeedback(null);
        setSelectedPersona(null);
        setIsLoading(false);
        setIsCreatingCustom(false);
        setCustomDescription("");
    }
  }, [isOpen]);

  useEffect(() => {
      // Auto-scroll to bottom of chat
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedback, isLoading]);

  const handleSelectPersona = async (persona: AudiencePersona) => {
      setSelectedPersona(persona);
      setFeedback(null);
      setIsLoading(true);

      try {
          const result = await simulateReader(content, persona);
          setFeedback(result);
      } catch (error) {
          setFeedback("Что-то пошло не так... Я потерял дар речи.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleCreateCustom = () => {
      if (!customDescription.trim()) return;
      
      const newPersona: AudiencePersona = {
          id: 'custom_' + Date.now(),
          name: 'Свой персонаж',
          emoji: '✨',
          description: customDescription,
          isCustom: true,
          customDescription: customDescription
      };

      setIsCreatingCustom(false);
      handleSelectPersona(newPersona);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left: Persona Grid OR Custom Creator */}
        <div className="w-1/2 md:w-5/12 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <h2 className="font-serif font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🎭</span> Симулятор Читателя
                </h2>
                <p className="text-xs text-gray-500 mt-1">Выберите, кто будет читать ваш текст</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {isCreatingCustom ? (
                    <div className="h-full flex flex-col animate-in slide-in-from-right-5 fade-in">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Опишите своего читателя</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Кто это? Какой у него возраст, профессия, характер? Что он любит, а что ненавидит?
                        </p>
                        <textarea
                            className="flex-1 w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none mb-4"
                            placeholder="Например: Женщина 45 лет, работает бухгалтером, любит дачу и кошек, не доверяет интернету..."
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsCreatingCustom(false)}
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleCreateCustom}
                                disabled={!customDescription.trim()}
                                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Спросить мнение
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {/* Custom Persona Button */}
                        <button
                            onClick={() => setIsCreatingCustom(true)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-center group min-h-[100px]"
                        >
                            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">➕</span>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Свой<br/>персонаж</span>
                        </button>

                        {/* Standard Personas */}
                        {AUDIENCE_PERSONAS.map(persona => (
                            <button
                                key={persona.id}
                                onClick={() => handleSelectPersona(persona)}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center min-h-[100px] ${
                                    selectedPersona?.id === persona.id
                                        ? 'bg-white dark:bg-gray-800 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md transform scale-[1.02]'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-3xl mb-2 filter drop-shadow-sm">{persona.emoji}</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{persona.name}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{persona.description}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right: Chat Simulation */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
             {/* Chat Header */}
             <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 shrink-0">
                 {selectedPersona ? (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                         <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl border border-gray-200 dark:border-gray-700">
                             {selectedPersona.emoji}
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 dark:text-white">{selectedPersona.name}</h3>
                             <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                 Online
                             </p>
                         </div>
                     </div>
                 ) : (
                     <div className="text-gray-400 text-sm">Выберите собеседника слева...</div>
                 )}
             </div>

             {/* Chat Area */}
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0B1120]">
                {!selectedPersona && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>Чат пуст</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 dark:border-gray-700 w-24 flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                    </div>
                )}

                {feedback && selectedPersona && (
                    <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0 self-end mb-1">
                            {selectedPersona.emoji}
                        </div>
                        <div className={`
                            p-4 rounded-2xl rounded-bl-none shadow-sm text-gray-800 dark:text-gray-100 max-w-[90%] leading-relaxed relative
                            ${selectedPersona.id === 'troll' ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50' : 
                              selectedPersona.id === 'grandma' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50' :
                              selectedPersona.id === 'ceo' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50' :
                              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }
                        `}>
                            {feedback}
                            {/* Speech Bubble Tail */}
                            <svg className={`absolute -bottom-[1px] -left-2 w-4 h-4 ${
                                selectedPersona.id === 'troll' ? 'text-red-50 dark:text-red-900/20' : 
                                selectedPersona.id === 'grandma' ? 'text-amber-50 dark:text-amber-900/20' :
                                selectedPersona.id === 'ceo' ? 'text-blue-50 dark:text-blue-900/20' :
                                'text-white dark:text-gray-800'
                            }`} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M20 0v20H0L20 0z" />
                            </svg>
                        </div>
                    </div>
                )}
                
                <div ref={chatEndRef} />
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg transition-colors"
                >
                    Закрыть симулятор
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};