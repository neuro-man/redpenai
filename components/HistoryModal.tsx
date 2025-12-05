
import React, { useState } from 'react';
import { EditorSnapshot } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: EditorSnapshot[];
  onRestore: (snapshot: EditorSnapshot) => void;
  onForceSave?: () => Promise<boolean>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, snapshots, onRestore, onForceSave }) => {
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<EditorSnapshot | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'no-changes'>('idle');

  // Auto-select first snapshot when opening
  React.useEffect(() => {
    if (isOpen && snapshots.length > 0 && !selectedSnapshot) {
        setSelectedSnapshot(snapshots[0]);
    }
  }, [isOpen, snapshots]);

  // Reset save status when modal closes
  React.useEffect(() => {
      if (!isOpen) setSaveStatus('idle');
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const handleManualSave = async () => {
      if (!onForceSave) return;
      setSaveStatus('saving');
      const saved = await onForceSave();
      if (saved) {
          setSaveStatus('success');
      } else {
          setSaveStatus('no-changes');
      }
      setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Left Sidebar: Timeline */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Машина времени
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">История изменений вашего текста</p>
                  </div>

                  {/* Force Save Button */}
                  {onForceSave && (
                      <div className="relative">
                          <button 
                            onClick={handleManualSave}
                            disabled={saveStatus === 'saving'}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-all shadow-sm active:scale-[0.98]"
                          >
                             {saveStatus === 'saving' ? (
                                <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                             ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                </svg>
                             )}
                             <span>Сохранить сейчас</span>
                          </button>
                          
                          {/* Feedback Toast */}
                          {saveStatus === 'success' && (
                              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-green-500 text-white rounded-lg text-xs font-bold animate-in fade-in zoom-in duration-200">
                                  Успешно сохранено!
                              </div>
                          )}
                          {saveStatus === 'no-changes' && (
                              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-600 text-white rounded-lg text-xs font-bold animate-in fade-in zoom-in duration-200">
                                  Нет изменений
                              </div>
                          )}
                      </div>
                  )}
              </div>

              <div className="flex-1 overflow-y-auto">
                 {snapshots.length === 0 ? (
                     <div className="p-8 text-center text-gray-400 text-sm">История пуста. Начните писать, и мы сохраним версии.</div>
                 ) : (
                     <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {snapshots.map((snap) => (
                            <div 
                                key={snap.id}
                                onClick={() => setSelectedSnapshot(snap)}
                                className={`p-4 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors ${selectedSnapshot?.id === snap.id ? 'bg-white dark:bg-gray-800 shadow-sm border-l-4 border-rose-500' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {formatDate(snap.id)}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${snap.type === 'manual' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                        {snap.type === 'manual' ? 'Вручную' : 'Авто'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 font-serif leading-snug">
                                    {snap.summary || "Пустой текст..."}
                                </p>
                            </div>
                        ))}
                     </div>
                 )}
              </div>
          </div>

          {/* Right Area: Preview */}
          <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900">
             <div className="flex-1 p-8 overflow-y-auto">
                {selectedSnapshot ? (
                    <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                            {selectedSnapshot.content}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Выберите версию слева для просмотра
                    </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                    Отмена
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                        *Текущий текст будет сохранен перед восстановлением
                    </span>
                    <button 
                        onClick={() => selectedSnapshot && onRestore(selectedSnapshot)}
                        disabled={!selectedSnapshot}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Восстановить эту версию
                    </button>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};
