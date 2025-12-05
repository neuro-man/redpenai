
import React, { useState } from 'react';
import { RewriteOption } from '../types';

interface RewriteWidgetProps {
  position: { top: number; left: number };
  onSelect: (option: RewriteOption) => void;
  isLoading: boolean;
}

export const RewriteWidget: React.FC<RewriteWidgetProps> = ({ position, onSelect, isLoading }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div 
        className="absolute z-50 flex items-center bg-white dark:bg-gray-800 rounded-full shadow-2xl p-1.5 gap-1 animate-in zoom-in-95 duration-150 origin-bottom-left border border-gray-200 dark:border-gray-700 select-none"
        style={{ top: position.top - 60, left: position.left }} // Offset above cursor
        onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      {isLoading ? (
        <div className="px-3 py-1.5 flex items-center gap-2 text-sm font-bold rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Думаю...</span>
        </div>
      ) : (
        <>
           <RewriteButton 
                id="fix"
                onClick={() => onSelect('fix')} 
                title="Исправить ошибки" 
                emoji="✨"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
           <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
           
           <RewriteButton 
                id="shorten"
                onClick={() => onSelect('shorten')} 
                title="Сократить" 
                emoji="✂️"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
            <RewriteButton 
                id="expand"
                onClick={() => onSelect('expand')} 
                title="Расширить" 
                emoji="🧱"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
           <RewriteButton 
                id="formal"
                onClick={() => onSelect('formal')} 
                title="Формально" 
                emoji="👔"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
           <RewriteButton 
                id="creative"
                onClick={() => onSelect('creative')} 
                title="Креативно" 
                emoji="🦄"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
           <RewriteButton 
                id="bureaucratese"
                onClick={() => onSelect('bureaucratese')} 
                title="Канцелярит" 
                emoji="📜"
                hoveredId={hoveredButton}
                setHovered={setHoveredButton}
           />
        </>
      )}
    </div>
  );
};

interface RewriteButtonProps {
    id: string;
    onClick: () => void;
    emoji: string;
    title: string;
    hoveredId: string | null;
    setHovered: (id: string | null) => void;
}

const RewriteButton: React.FC<RewriteButtonProps> = ({ id, onClick, emoji, title, hoveredId, setHovered }) => {
    const isHovered = hoveredId === id;

    return (
        <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:scale-110 active:scale-95 relative"
        >
            <span className="text-xl leading-none filter drop-shadow-sm">{emoji}</span>
            
            {/* Tooltip controlled by State */}
            {isHovered && (
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                    {title}
                    {/* Tiny triangle for tooltip */}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                </span>
            )}
        </button>
    );
}
