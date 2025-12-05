
import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-300"></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 zoom-in-95 duration-300">
        
        {/* Hero Section */}
        <div className="bg-rose-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white text-rose-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-serif font-black italic text-white mb-2 tracking-tight">RedPen AI</h1>
                <p className="text-rose-100 font-medium text-lg">Профессиональная среда для работы с текстом</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-8">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center leading-relaxed">
                Добро пожаловать, коллега! Это не просто редактор, а ваш персональный цифровой Главред. 
                Мы объединили мощь нейросетей с лучшими редакционными практиками.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="text-2xl">🎭</div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Симулятор читателя</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Протестируйте текст на 12 типажах: от Бабушки до Гендиректора.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="text-2xl">🌍</div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Режим «Новости»</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Проверка по стандартам журналистики: перевернутая пирамида и факты.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="text-2xl">🏷️</div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Студия Заголовков</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Генерация SEO, кликбейтных и деловых заголовков в один клик.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="text-2xl">🧘‍♂️</div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Режим Дзен</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Пишите без отвлекающих факторов. Только вы и текст.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs text-gray-400 text-center sm:text-left">
                    <p>💡 Совет: Нажмите <strong>?</strong> в шапке,</p>
                    <p>чтобы изучить все возможности.</p>
                </div>
                <button 
                    onClick={onClose}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    Начать работу 🚀
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
