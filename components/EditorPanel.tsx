
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { EditorialIssue, Severity, PolicyTemplate, TypographySettings, RewriteOption } from '../types';
import { RewriteWidget } from './RewriteWidget';

interface EditorPanelProps {
  title: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  colorClass: string;
  readOnly?: boolean;
  onFileUpload?: (content: string) => void;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  footerAction?: React.ReactNode;
  saveStatus?: 'saved' | 'saving' | 'idle';
  // New Props
  issues?: EditorialIssue[];
  activeIssueIndex?: number | null;
  templates?: PolicyTemplate[];
  onTemplateSelect?: (content: string) => void;
  maxLength?: number;
  onClear?: () => void;
  // Typography
  typography?: TypographySettings;
  onTypographyChange?: (settings: TypographySettings) => void;
  // History
  onHistoryClick?: () => void;
  historyCount?: number;
  isHistoryUpdated?: boolean;
  // Rewrite
  onRewrite?: (selection: string, option: RewriteOption, start: number, end: number) => Promise<void>;
  isRewriting?: boolean;
  // Zen Mode
  onToggleZenMode?: () => void;
  isZenMode?: boolean;
}

// Internal reusable toolbar button component for consistency
const ToolbarButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
  danger?: boolean;
  active?: boolean;
}> = ({ onClick, title, children, label, className = "", danger = false, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`
      h-8 min-w-[2rem] flex items-center justify-center gap-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all duration-75 border select-none shrink-0
      shadow-sm active:shadow-none active:translate-y-[1px] relative
      ${danger 
        ? 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-gradient-to-b from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 hover:from-red-100 hover:to-red-200 dark:hover:to-red-900/50' 
        : active 
            ? 'border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40'
            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gradient-to-b from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700'
      }
      ${className}
    `}
  >
    {children}
    {label && <span className="hidden xl:inline-block leading-none pt-[1px]">{label}</span>}
  </button>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  title, 
  value, 
  onChange, 
  placeholder, 
  icon,
  colorClass,
  readOnly = false,
  onFileUpload,
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  footerAction,
  saveStatus = 'idle',
  issues = [],
  activeIssueIndex = null,
  templates,
  onTemplateSelect,
  maxLength,
  onClear,
  typography,
  onTypographyChange,
  onHistoryClick,
  historyCount = 0,
  isHistoryUpdated = false,
  onRewrite,
  isRewriting = false,
  onToggleZenMode,
  isZenMode = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'review'>('edit');
  const reviewContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Rewrite Widget State
  const [rewriteWidget, setRewriteWidget] = useState<{ visible: boolean; x: number; y: number; start: number; end: number; text: string } | null>(null);
  
  // Dropdown states
  const [showTypeSettings, setShowTypeSettings] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  
  // Feedback states
  const [isCopied, setIsCopied] = useState(false);

  // Stats Calculation
  const stats = useMemo(() => {
    const text = value; 
    if (!text) return { words: 0, sentences: 0, time: 0, charsWithSpaces: 0, charsNoSpaces: 0 };
    
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length; 
    const time = Math.ceil(words / 200); 

    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    return { words, sentences, time, charsWithSpaces, charsNoSpaces };
  }, [value]);

  useEffect(() => {
    if (issues.length > 0) {
      setViewMode('review');
    }
  }, [issues]);

  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setViewMode('edit');
    }
  }, [value]);

  useEffect(() => {
    if (viewMode === 'review' && activeIssueIndex !== null && activeIssueIndex !== undefined && reviewContainerRef.current) {
      const element = reviewContainerRef.current.querySelector(`[data-issue-index="${activeIssueIndex}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
        setTimeout(() => {
             element.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
        }, 1500);
      }
    }
  }, [activeIssueIndex, viewMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onFileUpload(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleExport = (format: 'md' | 'txt' | 'html' | 'pdf') => {
    if (format === 'pdf') {
        window.print();
        setShowExportSettings(false);
        return;
    }

    let content = value;
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'md') {
      mimeType = 'text/markdown';
      extension = 'md';
    } else if (format === 'html') {
      mimeType = 'text/html';
      extension = 'html';
      content = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Merriweather, serif; max-width: 800px; margin: 0 auto; padding: 3rem; line-height: 1.8; color: #333; }
        h1 { border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 2rem; font-family: Inter, sans-serif; }
        p { margin-bottom: 1.5rem; }
        footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; font-family: Inter, sans-serif; font-size: 0.9rem; color: #64748b; }
        a { color: #e11d48; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>${title === 'Текст Статьи' ? 'Черновик' : title}</h1>
    ${value.split('\n\n').map(p => `<p>${p}</p>`).join('\n')}
    
    <footer>
        <p style="margin-bottom: 0.5rem;"><strong>RedPen AI</strong> — Главред-в-кармане</p>
        <p style="margin-bottom: 0;">© ${new Date().getFullYear()} RedPen AI. Все права у <a href="https://t.me/neuro_man">«Нейрочеловека»</a>.</p>
    </footer>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draft.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportSettings(false);
  };


  // --- REWRITE LOGIC ---
  const handleSelect = () => {
      if (!onRewrite || readOnly || !textareaRef.current) return;
      const textarea = textareaRef.current;
      if (textarea.selectionStart === textarea.selectionEnd) {
          setRewriteWidget(null);
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if (!onRewrite || readOnly || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
          const text = textarea.value.substring(start, end);
          if (text.trim().length > 0) {
              const rect = textarea.getBoundingClientRect();
              setRewriteWidget({
                  visible: true,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  start,
                  end,
                  text
              });
          }
      } else {
          setRewriteWidget(null);
      }
  };

  const handleRewriteAction = (option: RewriteOption) => {
      if (!rewriteWidget || !onRewrite) return;
      onRewrite(rewriteWidget.text, option, rewriteWidget.start, rewriteWidget.end).then(() => {
          setRewriteWidget(null);
      });
  };

  const isHidden = saveStatus === 'idle';
  const isSaving = saveStatus === 'saving';

  const indicatorClasses = `
    flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
    transition-all duration-500 ease-out transform select-none shrink-0
    ${isHidden 
      ? 'opacity-0 translate-y-1' 
      : 'opacity-100 translate-y-0'
    }
    ${isSaving 
      ? 'text-amber-600 dark:text-amber-400' 
      : 'text-emerald-600 dark:text-emerald-400'
    }
  `;

  // Render text with highlights
  const renderHighlightedText = () => {
    if (!issues.length) return <div className={`whitespace-pre-wrap leading-relaxed ${typography?.fontFamily || 'font-sans'} ${typography?.fontSize || 'text-lg'}`}>{value}</div>;
    const quotes = issues.map(i => i.quotedText).filter(q => q.length > 2);
    if (quotes.length === 0) return <div className={`whitespace-pre-wrap leading-relaxed ${typography?.fontFamily || 'font-sans'} ${typography?.fontSize || 'text-lg'}`}>{value}</div>;
    quotes.sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${quotes.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const splitParts = value.split(pattern);
    
    return (
        <div className={`whitespace-pre-wrap leading-relaxed ${typography?.fontFamily || 'font-sans'} ${typography?.fontSize || 'text-lg'}`}>
            {splitParts.map((part, i) => {
                const matchedIssueIndex = issues.findIndex(iss => iss.quotedText === part);
                if (matchedIssueIndex !== -1) {
                    const issue = issues[matchedIssueIndex];
                    let colorClass = "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 decoration-blue-500";
                    if (issue.severity === Severity.CRITICAL) colorClass = "bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 decoration-red-500";
                    if (issue.severity === Severity.WARNING) colorClass = "bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 decoration-amber-500";
                    if (issue.severity === Severity.GOOD) colorClass = "bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100 decoration-green-500";

                    const isActive = activeIssueIndex === matchedIssueIndex;
                    const activeClass = isActive ? "ring-2 ring-offset-1 ring-indigo-500 z-10 relative shadow-lg scale-105 transform transition-transform" : "";

                    return (
                        <mark 
                            key={i} 
                            id={`issue-${matchedIssueIndex}`}
                            data-issue-index={matchedIssueIndex}
                            className={`rounded px-1 py-0.5 cursor-help border-b-2 border-dashed ${colorClass} ${activeClass}`}
                            title={issue.explanation}
                        >
                            {part}
                        </mark>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
  };

  const isOverLimit = maxLength ? value.length > maxLength : false;

  return (
    <div className={`w-full flex flex-col ${isCollapsed ? 'h-auto' : 'h-full'} ${isZenMode ? 'rounded-none border-0' : 'rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'} bg-white dark:bg-gray-800 transition-all duration-300 focus-within:ring-1 ring-offset-1 dark:ring-offset-gray-900 ring-indigo-500/30 relative`}>
      
      {/* Hidden container for Printing (PDF Export) */}
      <div className="printable-content hidden">
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">{title === 'Текст Статьи' ? 'Черновик' : title}</h1>
          {value}
          
          <div className="printable-footer">
             <div className="flex items-center gap-2 mb-1">
                {/* Simple Logo for Print */}
                <div style={{width: '16px', height: '16px', background: '#e11d48', borderRadius: '4px', display: 'inline-block'}}></div>
                <span className="font-serif font-bold italic text-gray-900 text-lg">RedPen AI</span>
             </div>
             <p>
               Профессиональный редакторский контроль.<br/>
               © {new Date().getFullYear()} RedPen AI. Все права у <a href="https://t.me/neuro_man">«Нейрочеловека»</a>.
             </p>
          </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 first:rounded-t-xl z-20">
        
        {/* Left Side */}
        <div 
          className={`flex items-center gap-3 overflow-hidden flex-1 ${isCollapsible ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={isCollapsible && onToggleCollapse ? onToggleCollapse : undefined}
        >
            <div className={`p-1.5 rounded-md bg-opacity-10 ${colorClass.replace('text-', 'bg-')} shrink-0`}>
              {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 ${colorClass}` }) : icon}
            </div>
            
            <div className="flex flex-col min-w-0">
               <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm tracking-tight select-none truncate">
                 {title}
               </h2>
               {/* Template Selector */}
               {templates && onTemplateSelect && !isCollapsed && (
                    <div onClick={e => e.stopPropagation()} className="-ml-1 truncate w-full max-w-[150px]">
                        <select 
                            className="text-[11px] border-none p-0 px-1 bg-transparent text-gray-500 dark:text-gray-400 hover:text-indigo-600 focus:ring-0 cursor-pointer font-medium w-full"
                            onChange={(e) => {
                                const t = templates.find(t => t.id === e.target.value);
                                if(t) onTemplateSelect(t.content);
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Загрузить шаблон...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            {isCollapsible && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={1.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            )}
        </div>

        {/* Right Side: Toolbar */}
        <div className="flex items-center gap-2 shrink-0 ml-2 max-w-[60%] sm:max-w-none" onClick={(e) => e.stopPropagation()}>
            
            <div className={indicatorClasses}>
                {isSaving ? 'Сохранение...' : 'Сохранено'}
            </div>
            
            {/* Scrollable Toolbar Container for Mobile. ON DESKTOP: overflow-visible to show dropdowns. */}
            {!isCollapsed && (
                <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar py-1 px-1 -mr-1 pr-2">
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>

                    {/* Group 1: History */}
                    {onHistoryClick && (
                        <ToolbarButton 
                            onClick={onHistoryClick} 
                            title="История изменений (Ctrl+S)" 
                            label="История"
                            active={historyCount > 0}
                            className="relative"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {historyCount > 0 && (
                                <span className={`
                                    absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full 
                                    text-[9px] text-white font-bold shadow-sm transition-transform duration-500 ease-out bg-rose-500
                                    ${isHistoryUpdated ? 'scale-150 ring-2 ring-rose-300 dark:ring-rose-800' : 'scale-100'}
                                `}>
                                    {historyCount > 99 ? '99+' : historyCount}
                                </span>
                            )}
                        </ToolbarButton>
                    )}

                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0"></div>

                    {/* Group 2: File Actions */}
                    {onFileUpload && (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".txt,.md" 
                                onChange={handleFileChange}
                            />
                            <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Загрузить файл" label="Импорт">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </ToolbarButton>
                        </>
                    )}
                    
                    {value.length > 0 && (
                    <div className="relative">
                        <ToolbarButton onClick={() => setShowExportSettings(!showExportSettings)} title="Экспорт" label="Экспорт">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </ToolbarButton>
                        {showExportSettings && (
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-[60] animate-in fade-in slide-in-from-top-1">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 px-2">Формат</div>
                                <button onClick={() => handleExport('md')} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Markdown</button>
                                <button onClick={() => handleExport('txt')} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Текст</button>
                                <button onClick={() => handleExport('html')} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">HTML</button>
                                <button onClick={() => handleExport('pdf')} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex justify-between items-center">PDF <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 rounded">Print</span></button>
                            </div>
                        )}
                    </div>
                    )}
                    
                    {value.length > 0 && (
                        <ToolbarButton onClick={handleCopy} title="Копировать" label="Копия">
                        {isCopied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                        )}
                        </ToolbarButton>
                    )}

                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0"></div>

                    {/* Group 3: Formatting & Tools */}
                    {onTypographyChange && typography && (
                        <div className="relative">
                            <ToolbarButton onClick={() => setShowTypeSettings(!showTypeSettings)} title="Настройки шрифта" label="Шрифт">
                                <span className="font-serif font-bold text-sm">T</span>
                            </ToolbarButton>
                            {showTypeSettings && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-[60]">
                                <div className="mb-3">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Размер</label>
                                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded p-1 items-end">
                                    {['text-sm', 'text-base', 'text-lg', 'text-xl'].map((size) => (
                                        <button key={size} onClick={() => onTypographyChange({...typography, fontSize: size as any})} className={`flex-1 py-1 rounded flex items-center justify-center transition-all ${typography.fontSize === size ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300 ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                            <span className={`${size} leading-none mb-1`}>Aa</span>
                                        </button>
                                    ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Гарнитура</label>
                                    <select value={typography.fontFamily} onChange={(e) => onTypographyChange({...typography, fontFamily: e.target.value as any})} className="w-full text-sm rounded border-gray-200 dark:border-gray-600 bg-transparent dark:text-gray-300">
                                        <option value="font-sans">Sans Serif</option>
                                        <option value="font-serif">Serif</option>
                                        <option value="font-mono">Monospace</option>
                                    </select>
                                </div>
                                <button onClick={() => setShowTypeSettings(false)} className="mt-2 w-full text-xs text-center text-gray-400 hover:text-gray-600 py-1">Закрыть</button>
                            </div>
                            )}
                        </div>
                    )}

                    {onToggleZenMode && (
                        <ToolbarButton 
                            onClick={onToggleZenMode} 
                            title={isZenMode ? "Выйти из режима Дзен (Esc / Ctrl+E)" : "Режим Дзен (Ctrl+E)"}
                            active={isZenMode}
                        >
                            {isZenMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                </svg>
                            )}
                        </ToolbarButton>
                    )}

                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0"></div>

                    {onClear && (
                        <ToolbarButton 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }} 
                            title="Очистить" 
                            danger
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </ToolbarButton>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div className="flex-1 relative group flex flex-col last:rounded-b-xl">
            {viewMode === 'edit' ? (
                <div 
                    className="flex-1 w-full relative" 
                    onMouseUp={handleMouseUp}
                    onKeyUp={handleSelect}
                >
                     {/* Rewrite Widget */}
                     {rewriteWidget && rewriteWidget.visible && (
                        <div 
                            className="absolute z-50 pointer-events-none" 
                            style={{ top: 0, left: 0, width: '100%', height: '100%' }}
                        >
                            <div className="pointer-events-auto">
                                <RewriteWidget 
                                    position={{ top: rewriteWidget.y, left: rewriteWidget.x }}
                                    onSelect={handleRewriteAction}
                                    isLoading={isRewriting}
                                />
                            </div>
                        </div>
                     )}

                    <textarea
                        ref={textareaRef}
                        className={`w-full h-full p-4 resize-none outline-none text-gray-700 dark:text-gray-300 bg-transparent leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 ${typography?.fontFamily || 'font-sans'} ${typography?.fontSize || 'text-lg'}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => {
                             onChange(e.target.value);
                             setRewriteWidget(null);
                        }}
                        readOnly={readOnly}
                        spellCheck={false}
                    />
                </div>
            ) : (
                <div 
                    ref={reviewContainerRef}
                    className="flex-1 w-full p-4 overflow-y-auto text-gray-700 dark:text-gray-300 bg-transparent leading-relaxed"
                >
                    {renderHighlightedText()}
                </div>
            )}
            
             {/* Smart Status Bar */}
             {viewMode === 'edit' && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 flex flex-wrap items-center justify-end gap-3 text-[11px] font-medium text-gray-400 dark:text-gray-500 tabular-nums shrink-0 last:rounded-b-xl">
                    <span>{stats.words} слов</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <span>{stats.sentences} предл.</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <span className="hidden sm:inline">~{stats.time} мин</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                    <div className="flex gap-2 items-center">
                        <span>{stats.charsNoSpaces} (без пр.)</span>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span>{stats.charsWithSpaces} (с пр.)</span>
                    </div>
                    {maxLength && (
                        <span className={`ml-1 ${isOverLimit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        из {maxLength}
                        </span>
                    )}
                </div>
             )}
        </div>
      )}

      {/* Optional Footer Action */}
      {!isCollapsed && footerAction && (
         <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0 last:rounded-b-xl">
            {footerAction}
         </div>
      )}
    </div>
  );
};
