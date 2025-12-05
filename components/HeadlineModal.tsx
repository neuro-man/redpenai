
import React, { useState } from 'react';
import { HeadlineSuggestion } from '../types';

interface HeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  headlines: HeadlineSuggestion[];
  isLoading: boolean;
  onRegenerate: () => void;
  onSelectHeadline: (text: string) => void;
}

export const HeadlineModal: React.FC<HeadlineModalProps> = ({ isOpen, onClose, headlines, isLoading, onRegenerate, onSelectHeadline }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.388 1.62a15.998 15.998 0 001.622-3.395m0 0A15.998 15.998 0 009 7.5c0 1.052.25 2.062.677 2.973m11.383-.883H15M15 11.25l-3.388-1.62M15 11.25a15.998 15.998 0 003.388-1.62" />
              </svg>
              Студия Заголовков
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-варианты для максимального охвата
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
          {isLoading ? (
             <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                ))}
             </div>
          ) : (
             <div className="space-y-4">
                {headlines.map((item, idx) => (
                    <div 
                        key={idx} 
                        className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all relative"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`
                                text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border
                                ${item.style === 'Clickbait' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}
                                ${item.style === 'SEO' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' : ''}
                                ${item.style === 'Business' ? 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-900/50' : ''}
                                ${item.style === 'Creative' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50' : ''}
                                ${item.style === 'Social' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50' : ''}
                            `}>
                                {item.label}
                            </span>
                            
                            <div className="flex items-center gap-3">
                                {/* Insert Button */}
                                <button 
                                    onClick={() => onSelectHeadline(item.text)}
                                    className="text-xs flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800"
                                    title="Вставить в начало текста"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Вставить
                                </button>

                                {/* Copy Button */}
                                <button 
                                    onClick={() => handleCopy(item.text, idx)}
                                    className={`text-xs flex items-center gap-1 font-medium transition-colors ${copiedIndex === idx ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    {copiedIndex === idx ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Скопировано
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Копировать
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-serif font-medium text-gray-900 dark:text-gray-100 leading-tight mb-2 selection:bg-indigo-100 dark:selection:bg-indigo-900 cursor-pointer" onClick={() => onSelectHeadline(item.text)}>
                            {item.text}
                        </h3>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {item.explanation}
                        </p>
                    </div>
                ))}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Закрыть
          </button>
          <button 
            onClick={onRegenerate}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Генерировать снова
          </button>
        </div>

      </div>
    </div>
  );
};
