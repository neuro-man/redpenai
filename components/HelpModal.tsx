
import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionKey = 'basics' | 'modes' | 'rewrite' | 'simulator' | 'tools' | 'history';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('basics');

  if (!isOpen) return null;

  const sections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    { 
        key: 'basics', 
        label: 'Основы и Хоткеи', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    },
    { 
        key: 'modes', 
        label: 'Режимы анализа', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
    },
    { 
        key: 'rewrite', 
        label: 'Контекстный рерайт', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
    },
    { 
        key: 'simulator', 
        label: 'Симулятор читателя', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
    },
    { 
        key: 'tools', 
        label: 'Инструменты', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
    },
    { 
        key: 'history', 
        label: 'Машина времени', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  const renderContent = () => {
      switch(activeSection) {
          case 'basics':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-xl font-serif font-bold mb-2">Как это работает</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              RedPen AI — это профессиональная среда для работы с текстом. Слева вы задаете правила (Редполитику), справа пишете текст, а нейросеть выступает в роли неподкупного Главреда.
                          </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-3">⌨️ Горячие клавиши (для Профи)</h4>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="text-gray-500">Ctrl + Enter</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">Запустить анализ</div>
                              
                              <div className="text-gray-500">Ctrl + S</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">Сохранить версию (Snapshot)</div>
                              
                              <div className="text-gray-500">Ctrl + E</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">Режим Дзен (Вкл/Выкл)</div>
                              
                              <div className="text-gray-500">Esc</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">Выйти из Дзена / Закрыть окна</div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-serif font-bold mb-2">Начало проверки</h3>
                          <p className="text-gray-600 dark:text-gray-300">
                              Нажмите кнопку <strong className="text-rose-600 dark:text-rose-400">«Сделать колдунство!»</strong>. 
                              Система выдаст ошибки с приоритетами: 
                              <span className="inline-block px-2 py-0.5 mx-1 bg-red-100 text-red-700 rounded text-xs font-bold">!!! Критично</span>
                              <span className="inline-block px-2 py-0.5 mx-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">!! Важно</span>
                          </p>
                      </div>
                  </div>
              );
          case 'modes':
               return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-xl font-serif font-bold mb-4">Настройка под задачу</h3>
                          <div className="space-y-4">
                              <div className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">А</div>
                                  <div>
                                      <h4 className="font-bold">Полный анализ</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Глубокая проверка смысла и стиля. В настройках можно выбрать тип текста:
                                          <br/>• <strong>Инфостиль:</strong> для статей, новостей и маркетинга.
                                          <br/>• <strong>Проза:</strong> для рассказов и книг (оценивает ритм, образы, диалоги).
                                      </p>
                                  </div>
                              </div>
                              <div className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">Б</div>
                                  <div>
                                      <h4 className="font-bold">Только корректура</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Игнорирует редполитику. Исправляет только орфографию и пунктуацию.</p>
                                  </div>
                              </div>
                              <div className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">В</div>
                                  <div>
                                      <h4 className="font-bold">Строгие правила</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Чекбокс в настройках. Требует букву «ё», типографские кавычки («») и длинное тире (—).</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              );
          case 'rewrite':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                          <h3 className="text-xl font-serif font-bold mb-2">Магия выделения ✨</h3>
                          <p className="leading-relaxed opacity-90">
                              Выделите любой фрагмент текста мышкой, чтобы вызвать меню рерайта.
                          </p>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 dark:text-white mt-4">Инструменты:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">✨</span> <span>Исправить</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">✂️</span> <span>Сократить</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">🧱</span> <span>Расширить</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">👔</span> <span>Формально</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">🦄</span> <span>Креативно</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <span className="text-2xl">📜</span> <span>Канцелярит</span>
                          </li>
                      </ul>
                  </div>
              );
          case 'simulator':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                       <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <h3 className="text-xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
                             🎭 Симулятор читателя
                          </h3>
                          <p className="leading-relaxed text-emerald-800 dark:text-emerald-200">
                              Уникальная функция RedPen. Позволяет увидеть ваш текст глазами разных людей до публикации.
                          </p>
                      </div>

                      <div className="space-y-4">
                          <p className="text-gray-600 dark:text-gray-300">
                              Нажмите кнопку <strong>«Симулятор»</strong> внизу экрана и выберите персонажа:
                          </p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <li className="flex items-center gap-2">👨🏻 <strong>Батя:</strong> Прагматик, ищет подвох.</li>
                              <li className="flex items-center gap-2">🤳 <strong>Инста-мама:</strong> Визуал и тренды.</li>
                              <li className="flex items-center gap-2">🥑 <strong>Зожник:</strong> Эко, био, без химии.</li>
                              <li className="flex items-center gap-2">🏷️ <strong>Экономный:</strong> Ищет скидки.</li>
                              <li className="flex items-center gap-2">💎 <strong>Мажор:</strong> Важен статус и VIP.</li>
                              <li className="flex items-center gap-2">👵 <strong>Бабушка:</strong> Не понимает сленг.</li>
                              <li className="flex items-center gap-2">🤡 <strong>Тролль:</strong> Токсичная критика.</li>
                              <li className="flex items-center gap-2">💼 <strong>CEO:</strong> Только суть и цифры.</li>
                              <li className="flex items-center gap-2">🤓 <strong>Хабр:</strong> Душный технарь.</li>
                              <li className="flex items-center gap-2">🛹 <strong>Зумер:</strong> Мемы и динамика.</li>
                              <li className="flex items-center gap-2">📢 <strong>Маркетолог:</strong> Воронки и CTA.</li>
                              <li className="flex items-center gap-2">👩‍👧 <strong>Мама:</strong> Тревога за безопасность.</li>
                          </ul>
                          <p className="text-gray-600 dark:text-gray-300 mt-2">
                              <strong>➕ Свой персонаж:</strong> Вы можете создать любую роль, например: <em>«Инвестор из Кремниевой долины, который спешит»</em>.
                          </p>
                      </div>
                  </div>
              );
          case 'tools':
               return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-xl font-serif font-bold mb-4">Инструменты автора</h3>
                          
                          <div className="space-y-6">
                             <div className="group">
                                 <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                     <span className="p-1 bg-indigo-100 text-indigo-600 rounded">🏷️</span> Студия Заголовков
                                 </h4>
                                 <p className="text-gray-600 dark:text-gray-400 mt-1 pl-9">
                                     Генерирует 5 вариантов заголовков (SEO, Кликбейт, Соцсети, Бизнес, Креатив).
                                 </p>
                             </div>

                             <div className="group">
                                 <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                     <span className="p-1 bg-slate-100 text-slate-600 rounded">🧘‍♂️</span> Режим Дзен (Focus)
                                 </h4>
                                 <p className="text-gray-600 dark:text-gray-400 mt-1 pl-9">
                                     Нажмите кнопку расширения в панели инструментов (или Ctrl+E). Интерфейс исчезнет, останется только чистый лист.
                                 </p>
                             </div>

                             <div className="group">
                                 <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                     <span className="p-1 bg-orange-100 text-orange-600 rounded">📄</span> Экспорт PDF
                                 </h4>
                                 <p className="text-gray-600 dark:text-gray-400 mt-1 pl-9">
                                     В меню экспорта выберите PDF. Приложение сгенерирует чистый, типографски верный документ для печати.
                                 </p>
                             </div>
                          </div>
                      </div>
                  </div>
              );
          case 'history':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-xl font-serif font-bold mb-2">Машина времени</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                              Мы сохраняем версии вашего текста, чтобы вы не боялись экспериментировать.
                          </p>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                              <li><strong>Автосохранение:</strong> Каждые 3 минуты или при изменении текста >5%.</li>
                              <li><strong>Ручное сохранение:</strong> Кнопка в окне истории или <code>Ctrl+S</code>.</li>
                          </ul>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sidebar Nav */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-serif font-bold text-lg text-gray-900 dark:text-white">Справка</h2>
                <p className="text-xs text-gray-500">RedPen AI v2.0</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sections.map(section => (
                    <button
                        key={section.key}
                        onClick={() => setActiveSection(section.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === section.key
                                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                    >
                        {section.icon}
                        {section.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-8">
                {renderContent()}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md"
                >
                    Всё понятно, спасибо!
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
