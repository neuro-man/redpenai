
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { HeadlineModal } from './components/HeadlineModal';
import { HistoryModal } from './components/HistoryModal';
import { HelpModal } from './components/HelpModal';
import { AudienceModal } from './components/AudienceModal';
import { WelcomeModal } from './components/WelcomeModal';
import { AppState, DEFAULT_POLICY, POLICY_TEMPLATES, EditorialIssue, TypographySettings, ContentStyle, HeadlineSuggestion, EditorSnapshot, RewriteOption } from './types';
import { analyzeText, generateHeadlines, rewriteSelection } from './services/geminiService';
import { getValue, setValue, saveSnapshot, getHistory, getHistoryCount } from './services/dbService';
import { getRandomLoadingPhrase, LoadingPhrase } from './loadingPhrases';

const MAX_CHARS = 20000;

const App: React.FC = () => {
  // Initialize state with defaults
  const [state, setState] = useState<AppState>({
    policy: DEFAULT_POLICY,
    content: "",
    analysis: null,
    isAnalyzing: false,
    error: null,
    activeTab: 'write',
    isDarkMode: true,
    typography: {
      fontSize: 'text-lg',
      fontFamily: 'font-sans'
    },
    contentStyle: 'informational',
    generatedHeadlines: [],
    isGeneratingHeadlines: false,
    showHeadlineModal: false,
    showHistoryModal: false,
    showAudienceModal: false,
  });

  const [isPolicyCollapsed, setIsPolicyCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [focusedIssueIndex, setFocusedIssueIndex] = useState<number | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingPhrase>({ message: "Вычитываю рукопись...", buttonText: "Анализирую..." });
  const [historySnapshots, setHistorySnapshots] = useState<EditorSnapshot[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // History Badge Logic
  const [historyCount, setHistoryCount] = useState(0);
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(false);
  
  // Smart History Tracking
  const lastSnapshotContentRef = useRef<string>("");
  
  // Telegram / Embedded State
  const [isEmbedded, setIsEmbedded] = useState(false);
  
  // Zen Mode State
  const [isZenMode, setIsZenMode] = useState(false);

  // New State features
  const [useStrictRules, setUseStrictRules] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'full' | 'proofread'>('full');

  // Auto-save statuses
  const [policySaveStatus, setPolicySaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [contentSaveStatus, setContentSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  
  // Undo State
  const [undoState, setUndoState] = useState<{ type: 'policy' | 'content', content: string } | null>(null);
  
  // Rewrite State
  const [isRewriting, setIsRewriting] = useState(false);

  // Check for Telegram WebApp environment on mount
  useEffect(() => {
    // Basic check for Telegram WebApp existence
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        // If initData is present or we are inside the iframe environment
        if (tg.initData || window.self !== window.top) {
             setIsEmbedded(true);
             tg.ready();
             tg.expand();
        }
    }
  }, []);

  // Handle Escape key for Zen Mode
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && isZenMode) {
              setIsZenMode(false);
          }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      const savedPolicy = await getValue('policy');
      const savedContent = await getValue('content');
      const savedTheme = await getValue('theme');
      
      // Load typography
      const savedFont = await getValue('fontFamily');
      const savedSize = await getValue('fontSize');

      // Load Content Style
      const savedStyle = await getValue('contentStyle');

      // Load History Count and Last Snapshot content for smart diffing
      const count = await getHistoryCount();
      const history = await getHistory();
      if (history.length > 0) {
          lastSnapshotContentRef.current = history[0].content;
      }

      // CHECK WELCOME MODAL SEEN STATE
      const hasSeenWelcome = await getValue('hasSeenWelcome_v2');
      if (!hasSeenWelcome) {
          setShowWelcomeModal(true);
      }

      setState(prev => ({
        ...prev,
        policy: savedPolicy ?? DEFAULT_POLICY,
        content: savedContent ?? "",
        isDarkMode: savedTheme === 'false' ? false : true, // Default to dark if null
        typography: {
          fontFamily: (savedFont as any) || 'font-sans',
          fontSize: (savedSize as any) || 'text-lg'
        },
        contentStyle: (savedStyle as ContentStyle) || 'informational'
      }));
      setHistoryCount(count);
      setIsDbLoaded(true);
    };
    loadData();
  }, []);

  const handleCloseWelcome = async () => {
      setShowWelcomeModal(false);
      await setValue('hasSeenWelcome_v2', 'true');
  };

  // Apply dark mode and save preference
  useEffect(() => {
    if (isDbLoaded) {
      setValue('theme', String(state.isDarkMode));
    }
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode, isDbLoaded]);

  // Handle Typography Save
  const handleTypographyChange = async (settings: TypographySettings) => {
    setState(prev => ({ ...prev, typography: settings }));
    await setValue('fontFamily', settings.fontFamily);
    await setValue('fontSize', settings.fontSize);
  };

  // Handle Content Style Save
  const handleContentStyleChange = async (style: ContentStyle) => {
      setState(prev => {
        // SMART UX: If user switches to Creative/News, and Policy is still default Infostyle, suggest switch
        let newPolicy = prev.policy;
        
        // Switch to Creative
        if (style === 'creative' && prev.policy.includes("1. Синтаксис: Упрощайте")) {
           const creativeTemplate = POLICY_TEMPLATES.find(t => t.id === 'creative');
           if (creativeTemplate) newPolicy = creativeTemplate.content;
        } 
        // Switch to News
        else if (style === 'news' && !prev.policy.includes("Перевернутой пирамиды")) {
            const newsTemplate = POLICY_TEMPLATES.find(t => t.id === 'news');
            if (newsTemplate) newPolicy = newsTemplate.content;
        }
        // Switch to Informational
        else if (style === 'informational' && (prev.policy.includes("1. Образность: Используйте") || prev.policy.includes("Перевернутой пирамиды"))) {
           const infoTemplate = POLICY_TEMPLATES.find(t => t.id === 'infostyle');
           if (infoTemplate) newPolicy = infoTemplate.content;
        }
        
        return { ...prev, contentStyle: style, policy: newPolicy };
      });
      await setValue('contentStyle', style);
  };

  // Helper to handle auto-save and status transition
  const handleAutoSave = async (
    key: string, 
    value: string, 
    setStatus: React.Dispatch<React.SetStateAction<'saved' | 'saving' | 'idle'>>
  ) => {
    await setValue(key, value);
    setStatus('saved');
    
    // Hide "Saved" label after 2 seconds
    setTimeout(() => {
      setStatus(current => current === 'saved' ? 'idle' : current);
    }, 2000);
  };

  // Auto-save Policy
  useEffect(() => {
    if (!isDbLoaded) return;
    
    setPolicySaveStatus('saving');
    const timer = setTimeout(() => {
      handleAutoSave('policy', state.policy, setPolicySaveStatus);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.policy, isDbLoaded]);

  // Auto-save Content (Local Storage / DB only, NOT History Snapshot)
  useEffect(() => {
    if (!isDbLoaded) return;

    setContentSaveStatus('saving');
    const timer = setTimeout(() => {
      handleAutoSave('content', state.content, setContentSaveStatus);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.content, isDbLoaded]);

  // --- SMART HISTORY AUTO-SNAPSHOT ---
  // Strategy: Save every 3 mins OR if big changes detected (debounce)
  useEffect(() => {
      if (!isDbLoaded || !state.content) return;
      
      // 1. Interval Saving (Every 3 minutes)
      const intervalId = setInterval(async () => {
          const wasSaved = await saveSnapshot(state.content, 'auto');
          if (wasSaved) {
              lastSnapshotContentRef.current = state.content;
              setHistoryCount(c => c + 1);
              setHistoryUpdateTrigger(true);
              setTimeout(() => setHistoryUpdateTrigger(false), 2000);
          }
      }, 180 * 1000); // 3 minutes

      // 2. Smart Trigger (Debounced check for big changes)
      const debounceTimer = setTimeout(async () => {
          const currentContent = state.content;
          const lastContent = lastSnapshotContentRef.current;
          
          if (!lastContent) return; // Skip if no baseline

          const lengthDiff = Math.abs(currentContent.length - lastContent.length);
          const percentDiff = lengthDiff / lastContent.length;

          // Rule: > 5% change OR > 400 chars (~2 paragraphs)
          if (percentDiff > 0.05 || lengthDiff > 400) {
              const wasSaved = await saveSnapshot(currentContent, 'auto');
              if (wasSaved) {
                  lastSnapshotContentRef.current = currentContent;
                  setHistoryCount(c => c + 1);
                  setHistoryUpdateTrigger(true);
                  setTimeout(() => setHistoryUpdateTrigger(false), 2000);
              }
          }
      }, 3000); // Check 3 seconds after typing stops

      return () => {
          clearInterval(intervalId);
          clearTimeout(debounceTimer);
      };
  }, [state.content, isDbLoaded]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const handleAnalyze = useCallback(async () => {
    if (!state.content.trim()) {
      setState(prev => ({ ...prev, error: "Пожалуйста, введите текст для анализа." }));
      return;
    }
    
    if (state.content.length > MAX_CHARS) {
       setState(prev => ({ ...prev, error: `Текст слишком длинный! Лимит ${MAX_CHARS} символов.` }));
       return;
    }

    setLoadingState(getRandomLoadingPhrase());
    
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, analysis: null }));
    setFocusedIssueIndex(null);
    setIsSidebarOpen(true); 

    try {
      const result = await analyzeText(
        state.content, 
        state.policy, 
        analysisMode, 
        useStrictRules,
        state.contentStyle
      );
      setState(prev => ({ ...prev, analysis: result, isAnalyzing: false }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: "Не удалось проанализировать текст. Проверьте API ключ." 
      }));
    }
  }, [state.content, state.policy, analysisMode, useStrictRules, state.contentStyle]);

  // The actual API call function
  const performHeadlineGeneration = async () => {
    setState(prev => ({ ...prev, isGeneratingHeadlines: true }));

    try {
        const headlines = await generateHeadlines(state.content, state.contentStyle);
        setState(prev => ({ ...prev, generatedHeadlines: headlines, isGeneratingHeadlines: false }));
    } catch (error) {
        console.error(error);
        setState(prev => ({ ...prev, isGeneratingHeadlines: false }));
        alert("Не удалось придумать заголовки. Попробуйте еще раз.");
    }
  };

  // The handler for the button - decides whether to open cache or generate
  const handleOpenHeadlineStudio = async () => {
    if (!state.content.trim()) {
      alert("Сначала напишите текст!");
      return;
    }

    setState(prev => ({ ...prev, showHeadlineModal: true }));

    // Only generate if we have no headlines yet.
    // If the user wants to re-generate based on new edits, they use the "Regenerate" button in the modal.
    if (state.generatedHeadlines.length === 0) {
       await performHeadlineGeneration();
    }
  };

  const handleSelectHeadline = (headline: string) => {
     setState(prev => ({
        ...prev,
        content: `${headline}\n\n${prev.content}`,
        showHeadlineModal: false
     }));
  };

  const handleIssueClick = (index: number) => {
      setFocusedIssueIndex(index);
  };

  const handleApplyFix = (issue: EditorialIssue, index: number) => {
      if (!state.analysis) return;

      const currentContent = state.content;
      const newContent = currentContent.replace(issue.quotedText, issue.suggestion);

      if (newContent === currentContent) {
          alert("Не удалось найти точное совпадение для замены. Возможно, текст уже был изменен.");
          return;
      }

      setState(prev => ({
          ...prev,
          content: newContent,
          analysis: prev.analysis ? {
              ...prev.analysis,
              issues: prev.analysis.issues.filter((_, i) => i !== index)
          } : null
      }));
  };

  const handleFileUpload = (type: 'policy' | 'content') => (text: string) => {
      setState(prev => ({ ...prev, [type]: text }));
  };

  const handleTemplateSelect = (text: string) => {
      setState(prev => ({ ...prev, policy: text }));
  };

  const handleClear = (type: 'policy' | 'content') => () => {
      const contentToSave = state[type];
      if (!contentToSave) return; 

      // Save safety snapshot before clear
      if (type === 'content') {
         saveSnapshot(contentToSave, 'manual').then(saved => {
             if (saved) {
                lastSnapshotContentRef.current = contentToSave;
                setHistoryCount(c => c + 1);
                setHistoryUpdateTrigger(true);
                setTimeout(() => setHistoryUpdateTrigger(false), 2000);
             }
         });
      }

      setUndoState({ type, content: contentToSave });
      
      setState(prev => ({ 
          ...prev, 
          [type]: "",
          ...(type === 'content' ? { analysis: null } : {})
      }));

      setTimeout(() => {
          setUndoState(current => {
              if (current && current.type === type && current.content === contentToSave) {
                  return null;
              }
              return current;
          });
      }, 5000);
  };

  const handleUndo = () => {
      if (!undoState) return;
      
      setState(prev => ({
          ...prev,
          [undoState.type]: undoState.content
      }));
      setUndoState(null);
  };

  const handleOpenHistory = async () => {
      const history = await getHistory();
      setHistorySnapshots(history);
      setState(prev => ({ ...prev, showHistoryModal: true }));
  };

  const handleForceSave = async () => {
      const wasSaved = await saveSnapshot(state.content, 'manual');
      if (wasSaved) {
          lastSnapshotContentRef.current = state.content;
          setHistoryCount(c => c + 1);
          setHistoryUpdateTrigger(true);
          setTimeout(() => setHistoryUpdateTrigger(false), 2000);
          
          // Refresh list if modal is open
          const history = await getHistory();
          setHistorySnapshots(history);
      }
      return wasSaved;
  };

  const handleRestoreSnapshot = async (snapshot: EditorSnapshot) => {
      // 1. Save current state as manual snapshot before restoring (Safety)
      if (state.content.trim()) {
          const wasSaved = await saveSnapshot(state.content, 'manual');
          if (wasSaved) {
              lastSnapshotContentRef.current = state.content;
              setHistoryCount(c => c + 1);
          }
      }

      // 2. Restore
      lastSnapshotContentRef.current = snapshot.content; // Reset baseline
      setState(prev => ({
          ...prev,
          content: snapshot.content,
          showHistoryModal: false
      }));
  };
  
  // --- REWRITE HANDLER ---
  const handleRewrite = async (selection: string, option: RewriteOption, start: number, end: number) => {
      setIsRewriting(true);
      
      // Safety Snapshot
      await saveSnapshot(state.content, 'manual');
      
      try {
          const newText = await rewriteSelection(selection, option, state.content);
          
          // Surgical Replacement
          const current = state.content;
          const updatedContent = current.substring(0, start) + newText + current.substring(end);
          
          setState(prev => ({ ...prev, content: updatedContent }));
      } catch (error) {
          console.error("Rewrite failed", error);
          alert("Не удалось переписать текст.");
      } finally {
          setIsRewriting(false);
      }
  };

  // --- AUDIENCE SIMULATOR HANDLER ---
  const handleSimulateReader = () => {
      if (!state.content.trim()) {
          alert("Напишите текст, чтобы читатели могли его оценить!");
          return;
      }
      setState(prev => ({ ...prev, showAudienceModal: true }));
  };

  const isOverLimit = state.content.length > MAX_CHARS;

  // Global Hotkeys Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Command (Mac)
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (!state.isAnalyzing && !isOverLimit) {
              handleAnalyze();
            }
            break;
          case 's':
            e.preventDefault();
            handleForceSave();
            break;
          case 'e':
            e.preventDefault();
            setIsZenMode(prev => !prev);
            break;
          case 'z':
             // Simple undo text restoration support via custom logic if Undo state is active
             if (undoState) {
                 e.preventDefault();
                 handleUndo();
             }
             break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.isAnalyzing, isOverLimit, handleAnalyze, undoState, isZenMode]); // Deps needed for closures

  // Icons
  const PolicyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );

  const WriteIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );

  const FooterActions = (
    <div className="flex flex-col gap-4">
      {isOverLimit && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm px-3 py-2 rounded border border-red-200 dark:border-red-800">
             ⚠️ Превышен лимит символов ({state.content.length} / {MAX_CHARS}). Сократите текст для проверки.
          </div>
      )}

      <div className="flex gap-2">
        {/* Headline Studio Button */}
        <button
            onClick={handleOpenHeadlineStudio}
            disabled={state.isAnalyzing || isOverLimit || state.content.length < 50}
            className="flex-1 py-3 px-4 rounded-lg bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title="Придумать 5 вариантов заголовков"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.388 1.62a15.998 15.998 0 001.622-3.395m0 0A15.998 15.998 0 009 7.5c0 1.052.25 2.062.677 2.973m11.383-.883H15M15 11.25l-3.388-1.62M15 11.25a15.998 15.998 0 003.388-1.62" />
             </svg>
             <span className="hidden sm:inline">Заголовок</span>
        </button>

        {/* Main Action Button */}
        <button
            onClick={handleAnalyze}
            disabled={state.isAnalyzing || isOverLimit}
            className={`
                flex-[3] py-3 px-6 rounded-lg shadow-md text-white font-bold text-md tracking-wide
                transition-all duration-300 transform active:scale-[0.98]
                flex items-center justify-center gap-2
                ${state.isAnalyzing || isOverLimit
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : analysisMode === 'proofread' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/20'
                    : 'bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 shadow-rose-500/20'
                }
            `}
            title="Запустить анализ (Ctrl+Enter)"
            >
            {state.isAnalyzing ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{loadingState.buttonText}</span>
                </>
            ) : (
                <>
                {analysisMode === 'full' ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                        <span>Сделать колдунство!</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                        </svg>
                        <span>Проверить правописание</span>
                    </>
                )}
                </>
            )}
        </button>

        {/* Audience Simulator Button */}
        <button
            onClick={handleSimulateReader}
            disabled={state.isAnalyzing || isOverLimit || state.content.length < 50}
            className="flex-1 py-3 px-4 rounded-lg bg-emerald-50 dark:bg-gray-700 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-gray-600 hover:bg-emerald-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title="Протестировать на живых людях"
        >
             <span className="text-xl leading-none">🎭</span>
             <span className="hidden sm:inline">Симулятор</span>
        </button>
      </div>
    </div>
  );

  if (!isDbLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // --- ZEN MODE RENDER ---
  // In Zen mode, we strip all outer layers and just render the content editor.
  if (isZenMode) {
      return (
        <div className="min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 relative">
             <EditorPanel
                title="Режим Дзен (ESC для выхода)"
                value={state.content}
                onChange={(v) => setState(prev => ({ ...prev, content: v }))}
                placeholder="Пишите свободно..."
                icon={WriteIcon}
                colorClass="text-indigo-600 dark:text-indigo-400"
                // Minimal features available in Zen
                onClear={handleClear('content')}
                typography={state.typography}
                onTypographyChange={handleTypographyChange}
                onRewrite={handleRewrite}
                isRewriting={isRewriting}
                onToggleZenMode={() => setIsZenMode(false)}
                isZenMode={true}
                // Still allow file upload for convenience? Maybe yes.
                onFileUpload={handleFileUpload('content')}
              />
              {undoState && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-4 border border-gray-700 dark:border-gray-200">
                    <span className="text-sm font-medium">Текст удален</span>
                    <button onClick={handleUndo} className="text-sm font-bold text-rose-400 dark:text-rose-600 hover:underline">Вернуть</button>
                </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100 bg-[#f3f4f6] dark:bg-gray-900 transition-colors duration-300 relative ${isEmbedded ? 'overflow-hidden' : ''}`}>
      
      {!isEmbedded && (
        <Header 
            isDarkMode={state.isDarkMode} 
            toggleTheme={toggleTheme} 
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
            useStrictRules={useStrictRules}
            setUseStrictRules={setUseStrictRules}
            contentStyle={state.contentStyle}
            setContentStyle={handleContentStyleChange}
            onOpenHelp={() => setShowHelpModal(true)}
        />
      )}

      {/* Welcome / Onboarding Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcome}
      />

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Headline Modal */}
      <HeadlineModal 
        isOpen={state.showHeadlineModal}
        onClose={() => setState(s => ({ ...s, showHeadlineModal: false }))}
        headlines={state.generatedHeadlines}
        isLoading={state.isGeneratingHeadlines}
        onRegenerate={performHeadlineGeneration}
        onSelectHeadline={handleSelectHeadline}
      />

      {/* Audience Modal */}
      <AudienceModal
        isOpen={state.showAudienceModal}
        onClose={() => setState(s => ({ ...s, showAudienceModal: false }))}
        content={state.content}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={state.showHistoryModal}
        onClose={() => setState(s => ({ ...s, showHistoryModal: false }))}
        snapshots={historySnapshots}
        onRestore={handleRestoreSnapshot}
        onForceSave={handleForceSave}
      />

      <main className={`flex-1 ${isEmbedded ? 'p-2' : 'p-4 md:p-6'}`}>
        <div className="w-full max-w-[1400px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-500 ease-in-out">
          
          <div className={`flex flex-col gap-6 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
            
            {/* Tab Navigation (Visible on Desktop and Mobile now, restricted width on desktop) */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700 mb-2 shrink-0 w-full max-w-md">
               <button 
                onClick={() => setState(s => ({...s, activeTab: 'policy'}))}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${state.activeTab === 'policy' ? 'bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 Редполитика
               </button>
               <button 
                onClick={() => setState(s => ({...s, activeTab: 'write'}))}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${state.activeTab === 'write' ? 'bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 Черновик
               </button>
            </div>

            {/* Policy Panel - Only visible if activeTab is 'policy' */}
            <div className={`
                w-full
                transition-all duration-300
                ${state.activeTab === 'policy' ? 'flex' : 'hidden'}
                ${isPolicyCollapsed ? 'lg:flex-none' : isEmbedded ? 'min-h-[300px]' : 'min-h-[600px] lg:min-h-[900px]'}
            `}>
              <EditorPanel
                title="Редполитика / База знаний"
                value={state.policy}
                onChange={(v) => setState(prev => ({ ...prev, policy: v }))}
                placeholder="Загрузите файл с редполитикой или введите правила здесь..."
                icon={PolicyIcon}
                colorClass="text-slate-600 dark:text-slate-400"
                onFileUpload={handleFileUpload('policy')}
                isCollapsible={true}
                isCollapsed={isPolicyCollapsed}
                onToggleCollapse={() => setIsPolicyCollapsed(!isPolicyCollapsed)}
                saveStatus={policySaveStatus}
                templates={POLICY_TEMPLATES}
                onTemplateSelect={handleTemplateSelect}
                onClear={handleClear('policy')}
              />
            </div>

            {/* Write Panel - Only visible if activeTab is 'write' */}
            <div className={`
                w-full
                ${state.activeTab === 'write' ? 'flex' : 'hidden'}
                ${isEmbedded ? 'min-h-[500px]' : 'min-h-[600px] lg:min-h-[900px]'}
            `}>
              <EditorPanel
                title="Текст Статьи"
                value={state.content}
                onChange={(v) => setState(prev => ({ ...prev, content: v }))}
                placeholder="Вставьте вашу статью сюда или загрузите файл..."
                icon={WriteIcon}
                colorClass="text-indigo-600 dark:text-indigo-400"
                onFileUpload={handleFileUpload('content')}
                footerAction={FooterActions}
                saveStatus={contentSaveStatus}
                issues={state.analysis?.issues || []}
                activeIssueIndex={focusedIssueIndex}
                maxLength={MAX_CHARS}
                onClear={handleClear('content')}
                typography={state.typography}
                onTypographyChange={handleTypographyChange}
                onHistoryClick={handleOpenHistory}
                historyCount={historyCount}
                isHistoryUpdated={historyUpdateTrigger}
                onRewrite={handleRewrite}
                isRewriting={isRewriting}
                onToggleZenMode={() => setIsZenMode(true)}
              />
            </div>
          </div>

          {isSidebarOpen && (
            <div className="lg:col-span-4 xl:col-span-3 animate-in slide-in-from-right-10 fade-in duration-300">
               <div className={`sticky ${isEmbedded ? 'top-4 h-[calc(100vh-2rem)]' : 'top-24 h-[calc(100vh-8rem)]'} flex flex-col gap-4`}>
                  <div className="flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-gray-700 dark:text-gray-200">Результаты анализа</h3>
                      <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Скрыть панель"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>

                  {state.error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm shrink-0">
                      {state.error}
                    </div>
                  )}

                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 overflow-hidden shadow-inner">
                      <ResultsPanel 
                        result={state.analysis} 
                        isLoading={state.isAnalyzing} 
                        onIssueClick={handleIssueClick}
                        onApplyFix={handleApplyFix}
                        loadingMessage={loadingState.message}
                      />
                  </div>
               </div>
            </div>
          )}

          {!isSidebarOpen && (state.analysis || state.isAnalyzing) && (
              <div className="fixed bottom-8 right-8 z-20">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 border border-gray-600"
                    title="Показать результаты"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                  </button>
              </div>
          )}
        </div>
      </main>

      {!isEmbedded && (
        <footer className="py-8 text-center border-t border-gray-200 dark:border-gray-800 mt-8 bg-white dark:bg-gray-900 transition-colors">
            <div className="max-w-[1400px] mx-auto w-full px-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-rose-600 text-white rounded-md flex items-center justify-center shadow-sm shadow-rose-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                        </svg>
                    </div>
                    <span className="font-serif font-bold italic text-gray-900 dark:text-gray-100 text-lg">RedPen AI</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} RedPen AI. Все права у <a href="https://t.me/neuro_man" target="_blank" rel="noreferrer" className="underline hover:text-rose-500 transition-colors">«Нейрочеловека»</a>.<br/>
                <span className="text-xs opacity-75">Версия 2.0.0 "Professional Edition"</span>
                </p>
            </div>
        </footer>
      )}

      {undoState && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-4 border border-gray-700 dark:border-gray-200">
            <span className="text-sm font-medium">Текст удален</span>
            <button 
              onClick={handleUndo}
              className="text-sm font-bold text-rose-400 dark:text-rose-600 hover:underline"
            >
              Вернуть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
