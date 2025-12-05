export interface LoadingPhrase {
  message: string;
  buttonText: string;
}

export const LOADING_PHRASES: LoadingPhrase[] = [
  { message: "Вычитываю рукопись...", buttonText: "Анализирую..." },
  { message: "Ищу лишние запятые с лупой...", buttonText: "Сканирую..." },
  { message: "Спорю с Ильяховым о стоп-словах...", buttonText: "Дискутирую..." },
  { message: "Выгоняю канцелярит метлой...", buttonText: "Зачищаю..." },
  { message: "Пытаюсь понять, что хотел сказать автор...", buttonText: "Расшифровываю..." },
  { message: "Заменяю «осуществляет деятельность» на «работает»...", buttonText: "Упрощаю..." },
  { message: "Проверяю, не робот ли вы (шутка)...", buttonText: "Проверяю..." },
  { message: "Считаю количество букв «ё»...", buttonText: "Считаю..." },
  { message: "Ищу потерянный смысл...", buttonText: "Ищу..." },
  { message: "Удаляю воду, оставляю суть...", buttonText: "Сушу..." },
  { message: "Полирую стиль до блеска...", buttonText: "Полирую..." },
  { message: "Ловлю тавтологии сачком...", buttonText: "Ловлю..." },
  { message: "Превращаю черновик в шедевр...", buttonText: "Творю..." },
  { message: "Сверяюсь со словарем Даля...", buttonText: "Листаю..." },
  { message: "Вырезаю штампы и клише...", buttonText: "Режу..." },
  { message: "Добавляю немного магии...", buttonText: "Колдую..." },
  { message: "Расставляю точки над i (и над ё)...", buttonText: "Расставляю..." },
  { message: "Устраняю пассивный залог...", buttonText: "Активирую..." },
  { message: "Проверяю факты (нет, я же языковая модель)...", buttonText: "Думаю..." },
  { message: "Ищу деепричастные обороты, висящие в воздухе...", buttonText: "Балансирую..." },
  { message: "Сокращаю текст, чтобы он влез в голову...", buttonText: "Сокращаю..." },
  { message: "Делаю текст вкусным и полезным...", buttonText: "Готовлю..." },
  { message: "Убираю «в данный момент времени»...", buttonText: "Ускоряю..." },
  { message: "Заменяю оценки на факты...", buttonText: "Фиксирую..." },
  { message: "Проверяю логику повествования...", buttonText: "Связываю..." },
  { message: "Ищу глаголы действия...", buttonText: "Действую..." },
  { message: "Убираю лишние прилагательные...", buttonText: "Чищу..." },
  { message: "Делаю текст понятным для бабушки...", buttonText: "Адаптирую..." },
  { message: "Сражаюсь с опечатками...", buttonText: "Бьюсь..." },
  { message: "Навожу красоту в типографике...", buttonText: "Оформляю..." },
  { message: "Меняю минусы на тире...", buttonText: "Типографлю..." },
  { message: "Расставляю кавычки-ёлочки...", buttonText: "Ёлочки..." },
  { message: "Убираю двойные пробелы...", buttonText: "Сжимаю..." },
  { message: "Делаю синтаксис прозрачным...", buttonText: "Проясняю..." },
  { message: "Сжигаю словесный мусор...", buttonText: "Жгу..." },
  { message: "Превращаю «воду» в «вино»...", buttonText: "Винифицирую..." },
  { message: "Ищу подлежащее и сказуемое...", buttonText: "Парсю..." },
  { message: "Делаю текст ритмичным...", buttonText: "Дирижирую..." },
  { message: "Убираю вводные конструкции, разумеется...", buttonText: "Убираю..." },
  { message: "Проверяю соответствие редполитике...", buttonText: "Сверяю..." },
  { message: "Включаю режим «строгий редактор»...", buttonText: "Включаю..." },
  { message: "Ищу логические дыры...", buttonText: "Латаю..." },
  { message: "Заменяю существительные глаголами...", buttonText: "Глаголю..." },
  { message: "Пытаюсь не уснуть от скучного абзаца...", buttonText: "Бодрюсь..." },
  { message: "Вспоминаю правила Розенталя...", buttonText: "Вспоминаю..." },
  { message: "Отсекаю лишнее, как Микеланджело...", buttonText: "Ваяю..." },
  { message: "Взвешиваю каждое слово...", buttonText: "Взвешиваю..." },
  { message: "Анализирую tone of voice...", buttonText: "Слушаю..." },
  { message: "Проверяю читабельность...", buttonText: "Читаю..." },
  { message: "Загружаю граммар-наци модуль...", buttonText: "Загружаю..." },
  { message: "Ищу плеоназмы (масло масляное)...", buttonText: "Фильтрую..." },
  { message: "Убираю бюрократщину...", buttonText: "Дебюрократизирую..." },
  { message: "Делаю текст продающим (надеюсь)...", buttonText: "Продаю..." },
  { message: "Структурирую хаос...", buttonText: "Строю..." },
  { message: "Добавляю воздуха в абзацы...", buttonText: "Вентилирую..." }
];

export const getRandomLoadingPhrase = (): LoadingPhrase => {
  const index = Math.floor(Math.random() * LOADING_PHRASES.length);
  return LOADING_PHRASES[index];
};
