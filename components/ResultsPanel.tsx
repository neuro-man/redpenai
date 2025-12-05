
import React, { useState, useMemo } from 'react';
import { AnalysisResult, Severity, EditorialIssue } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onIssueClick?: (index: number) => void;
  onApplyFix?: (issue: EditorialIssue, index: number) => void;
  loadingMessage?: string;
}

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const colors = {
    [Severity.CRITICAL]: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    [Severity.WARNING]: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    [Severity.NITPICK]: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    [Severity.GOOD]: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
  };

  const labels = {
    [Severity.CRITICAL]: "Критично",
    [Severity.WARNING]: "Важно",
    [Severity.NITPICK]: "Придирка",
    [Severity.GOOD]: "Отлично"
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors[severity]}`}>
      {labels[severity]}
    </span>
  );
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, isLoading, onIssueClick, onApplyFix, loadingMessage }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | Severity>('ALL');

  // Chart Data Calculation
  const scoreData = useMemo(() => {
      if (!result) return [];
      return [
        { name: 'Score', value: result.score, color: result.score > 80 ? '#10b981' : result.score > 60 ? '#f59e0b' : '#ef4444' },
        { name: 'Remainder', value: 100 - result.score, color: '#374151' }
      ];
  }, [result]);

  // Sorting and Filtering Logic
  const processedIssues = useMemo(() => {
      if (!result) return [];
      
      // 1. Sort by severity weight (Critical > Warning > Nitpick > Good)
      const severityWeight = {
          [Severity.CRITICAL]: 3,
          [Severity.WARNING]: 2,
          [Severity.NITPICK]: 1,
          [Severity.GOOD]: 0
      };

      const sorted = [...result.issues].sort((a, b) => {
          return (severityWeight[b.severity as Severity] || 0) - (severityWeight[a.severity as Severity] || 0);
      });

      // 2. Filter based on active tab
      return sorted.filter(issue => {
        if (activeFilter === 'ALL') return true;
        return issue.severity === activeFilter;
      });
  }, [result, activeFilter]);


  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 animate-pulse space-y-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin"></div>
        <p className="font-medium text-center px-4">{loadingMessage || "Вычитываю рукопись..."}</p>
        <p className="text-xs text-gray-300 dark:text-gray-600">Проверка тона, стиля и редполитики</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-lg">Готов к анализу.</p>
        <p className="text-sm">Загрузите редполитику и текст, затем нажмите кнопку.</p>
      </div>
    );
  }

  // Helper for button styles
  const getTabStyle = (key: string, isActive: boolean) => {
      // Increased text size (text-sm) and padding (px-4 py-1.5)
      const base = "px-4 py-1.5 text-sm font-bold rounded-md transition-all border flex items-center justify-center";
      
      if (key === 'ALL') {
          return isActive 
            ? `${base} bg-gray-600 border-gray-600 text-white shadow-md` 
            : `${base} border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
      }
      if (key === Severity.CRITICAL) {
          return isActive 
            ? `${base} bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20` 
            : `${base} border-transparent text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`;
      }
      if (key === Severity.WARNING) {
          return isActive 
            ? `${base} bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20` 
            : `${base} border-transparent text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20`;
      }
      if (key === Severity.NITPICK) {
          return isActive 
            ? `${base} bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20` 
            : `${base} border-transparent text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20`;
      }
      return base;
  };

  return (
    <div className="h-full overflow-y-auto pr-2 pb-20 space-y-6">
      {/* Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6 transition-colors">
        <div className="h-24 w-24 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? 'var(--chart-bg, #e5e7eb)' : entry.color} className="dark:[--chart-bg:#374151]" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">{result.score}</span>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Оценка редактора</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.summary}</p>
        </div>
      </div>

       {/* Tone Analysis */}
       <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
          <h4 className="text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-1">Тональность</h4>
          <p className="text-indigo-900 dark:text-indigo-100 text-sm font-medium">{result.toneAnalysis}</p>
       </div>

      {/* Issues List with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
             <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Замечания</h3>
             
             {/* Filter Tabs */}
             <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                {[
                    { key: 'ALL', label: 'Все' },
                    { key: Severity.CRITICAL, label: '!!!' },
                    { key: Severity.WARNING, label: '!!' },
                    { key: Severity.NITPICK, label: '!' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key as any)}
                        className={getTabStyle(tab.key, activeFilter === tab.key)}
                        title={tab.key === 'ALL' ? 'Все ошибки' : `Фильтр: ${tab.key}`}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
        </div>

        {result.issues.length === 0 ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg text-green-700 dark:text-green-300 text-sm">
                Замечаний нет! Отличная работа.
            </div>
        ) : processedIssues.length === 0 ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-600 text-sm italic">
                В этой категории ошибок не найдено.
            </div>
        ) : (
            processedIssues.map((issue, idx) => (
            <div 
              key={idx} 
              onClick={() => onIssueClick && onIssueClick(result.issues.indexOf(issue))} // Note: indexOf finds the original index
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-700 relative"
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">{issue.ruleViolated}</span>
                    <SeverityBadge severity={issue.severity as Severity} />
                </div>
                
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 dark:border-red-500 text-gray-700 dark:text-gray-300 font-serif italic text-sm rounded-r-md">
                    "{issue.quotedText}"
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{issue.explanation}</p>

                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          <span className="font-bold mr-1">Совет:</span> 
                          {issue.suggestion}
                      </p>
                    </div>
                    {/* Apply Button */}
                    {onApplyFix && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onApplyFix(issue, result.issues.indexOf(issue)); }}
                          className="ml-2 bg-white dark:bg-gray-700 border border-green-200 dark:border-green-800 shadow-sm rounded-md px-2 py-1 text-xs font-bold text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors shrink-0"
                          title="Заменить текст на предложенный"
                        >
                          Применить
                        </button>
                    )}
                </div>
                
                <div className="mt-2 text-xs text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-right">
                    Нажмите, чтобы показать в тексте →
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
