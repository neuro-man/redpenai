
import React, { useState, useRef, useEffect } from 'react';
import { ContentStyle } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  analysisMode: 'full' | 'proofread';
  setAnalysisMode: (mode: 'full' | 'proofread') => void;
  useStrictRules: boolean;
  setUseStrictRules: (v: boolean) => void;
  contentStyle: ContentStyle;
  setContentStyle: (style: ContentStyle) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleTheme,
  analysisMode,
  setAnalysisMode,
  useStrictRules,
  setUseStrictRules,
  contentStyle,
  setContentStyle,
  onOpenHelp
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors shadow-sm supports-backdrop-blur:bg-white/95 backdrop-blur">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-4 flex justify-between items-center">
        
        {/* Left Side: Logo & CTA */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-rose-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                </div>
                <div className="hidden sm:flex flex-col">
                    <h1 className="text-xl font-serif font-black italic text-gray-900 dark:text-gray-100 tracking-tight leading-none">RedPen AI</h1>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Главред-в-кармане</span>
                </div>
            </div>

            {/* Telegram Channel CTA (Visible on XL screens) */}
            <a 
                href="https://t.me/neuro_man" 
                target="_blank" 
                rel="noreferrer" 
                className="hidden xl:flex items-center gap-4 group hover:opacity-100 opacity-80 transition-opacity"
            >
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-tight">Если вам понравился RedPen AI</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 group-hover:text-[#24A1DE] transition-colors leading-tight">
                        Заглядывайте в канал «Нейрочеловек»
                        <svg className="w-4 h-4 text-[#24A1DE]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                    </span>
                </div>
            </a>
        </div>

        <div className="flex items-center gap-4">
            {/* Analysis Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 border border-transparent focus:border-indigo-500 outline-none"
            >
                <span>
                {analysisMode === 'full' ? 'Полный анализ' : 'Корректор'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {showSettings && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 z-50">
                
                {/* --- MODE SELECTION --- */}
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Режим работы</h3>
                <div className="space-y-2 mb-4">
                    <button
                    onClick={() => { setAnalysisMode('full'); setShowSettings(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        analysisMode === 'full' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    >
                    <span>Полный анализ</span>
                    {analysisMode === 'full' && <span className="text-indigo-500">✓</span>}
                    </button>
                    <button
                    onClick={() => { setAnalysisMode('proofread'); setShowSettings(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        analysisMode === 'proofread' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    >
                    <span>Только корректура</span>
                    {analysisMode === 'proofread' && <span className="text-indigo-500">✓</span>}
                    </button>
                </div>

                {/* --- STYLE SELECTION (Only in Full Mode) --- */}
                {analysisMode === 'full' && (
                    <>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-3"></div>
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Тип текста</h3>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                            onClick={() => setContentStyle('informational')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                            contentStyle === 'informational'
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                             </svg>
                            Инфостиль
                        </button>

                         <button
                            onClick={() => setContentStyle('news')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                            contentStyle === 'news'
                                ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                            </svg>
                            Новости
                        </button>
                        
                        <button
                            onClick={() => setContentStyle('creative')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                            contentStyle === 'creative'
                                ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Проза
                        </button>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-3"></div>
                    
                    <div className="flex items-start gap-3 pt-1">
                        <div className="relative flex items-center mt-0.5">
                        <input 
                            id="header_strict_rules" 
                            type="checkbox" 
                            checked={useStrictRules}
                            onChange={(e) => setUseStrictRules(e.target.checked)}
                            className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        </div>
                        <label htmlFor="header_strict_rules" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none leading-tight">
                            <span className="font-medium block mb-0.5">Строгие правила</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Ё, тире, кавычки и нормы русского языка</span>
                        </label>
                    </div>
                    </>
                )}
                </div>
            )}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                title={isDarkMode ? "Включить светлую тему" : "Включить тёмную тему"}
            >
                {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                )}
            </button>

            <button
                onClick={onOpenHelp}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
                title="Справка и возможности"
            >
                ?
            </button>
        </div>
      </div>
    </header>
  );
};
