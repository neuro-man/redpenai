

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Severity, STRICT_RUSSIAN_RULES, ContentStyle, LITERARY_FRAMEWORK, NEWS_FRAMEWORK, HeadlineSuggestion, RewriteOption, AudiencePersona } from "../types";

// Define the schema for the structured output (Analysis)
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Оценка от 0 до 100, отражающая соответствие политике.",
    },
    summary: {
      type: Type.STRING,
      description: "Краткое резюме редакционного обзора на русском языке.",
    },
    toneAnalysis: {
      type: Type.STRING,
      description: "Краткое описание обнаруженного тона текста на русском языке.",
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ruleViolated: { type: Type.STRING, description: "Какое правило нарушено (на русском)." },
          quotedText: { type: Type.STRING, description: "Цитата из текста с ошибкой." },
          suggestion: { type: Type.STRING, description: "Как исправить или переписать (на русском)." },
          severity: { type: Type.STRING, enum: ["Critical", "Warning", "Nitpick", "Good"] },
          explanation: { type: Type.STRING, description: "Почему это ошибка согласно политике (на русском)." },
        },
        required: ["ruleViolated", "quotedText", "suggestion", "severity", "explanation"],
      },
    },
  },
  required: ["score", "summary", "issues", "toneAnalysis"],
};

// Define the schema for Headlines
const headlinesSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      style: { 
        type: Type.STRING, 
        enum: ["SEO", "Clickbait", "Social", "Business", "Creative"],
        description: "The style of the headline."
      },
      label: { type: Type.STRING, description: "Russian label for the style (e.g. 'Для поиска', 'Кликбейт', 'Для соцсетей')." },
      text: { type: Type.STRING, description: "The generated headline in Russian." },
      explanation: { type: Type.STRING, description: "Short explanation why this headline works." }
    },
    required: ["style", "label", "text", "explanation"]
  }
};

const getAIClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeText = async (
  content: string, 
  policy: string,
  mode: 'full' | 'proofread' = 'full',
  useStrictRules: boolean = false,
  contentStyle: ContentStyle = 'informational'
): Promise<AnalysisResult> => {
  try {
    const ai = getAIClient();

    let systemInstruction = "";
    let activePolicy = policy;

    if (mode === 'proofread') {
      // PROOFREAD MODE
      systemInstruction = "Ты — профессиональный корректор русского языка. Твоя задача — найти и исправить только орфографические, пунктуационные, грамматические и типографические ошибки. Стиль, tone of voice и смысловую нагрузку не трогай, если они не содержат грубых ошибок. Оценивай строго по правилам русского языка.";
      activePolicy = STRICT_RUSSIAN_RULES;
    } else {
      // FULL MODE
      if (contentStyle === 'news') {
        // --- NEWS / JOURNALISM MODE ---
        systemInstruction = "Действуй как Выпускающий Редактор (Senior News Editor) крупного информационного агентства (ТАСС, Reuters, РИА). Твоя задача: проверить новость на соответствие стандартам журналистики. Главные приоритеты: Перевернутая пирамида (Лид с ответами на Кто/Что/Где/Когда), Объективность (никаких мнений автора), Наличие источников (ссылки на лица или ведомства). Будь строг к структуре и фактам.";
        
        activePolicy = `${NEWS_FRAMEWORK}\n\nДОПОЛНИТЕЛЬНЫЕ ЗАМЕТКИ РЕДАКЦИИ:\n${policy}`;

        if (useStrictRules) {
          activePolicy += "\n\n" + STRICT_RUSSIAN_RULES;
        }

      } else if (contentStyle === 'creative') {
        // --- CREATIVE / LITERARY MODE ---
        systemInstruction = "Действуй как чуткий Литературный Редактор и Опытный Читатель (Literary Mentor). Твоя задача: проанализировать ХУДОЖЕСТВЕННЫЙ текст. Игнорируй правила 'инфостиля' (стоп-слова, длина предложений), если они не вредят художественности. Оценивай атмосферу, ритм текста, живость диалогов и принцип 'Show, Don't Tell'. Твоя цель — помочь автору сделать текст сильнее, глубже и эмоциональнее, а не 'высушить' его.";
        
        activePolicy = `${LITERARY_FRAMEWORK}\n\nДОПОЛНИТЕЛЬНЫЕ ЗАМЕТКИ АВТОРА:\n${policy}`;
        
        if (useStrictRules) {
             activePolicy += "\n\n" + STRICT_RUSSIAN_RULES;
        }

      } else {
        // --- INFORMATIONAL / INFOSTYLE MODE (Default) ---
        systemInstruction = "Действуй как строгий, профессиональный главный редактор (Senior News/Tech Editor). Твоя задача: проанализировать текст на соответствие РЕДПОЛИТИКЕ. Ты ценишь краткость, факты, активный залог и отсутствие воды. Будь безжалостен к канцеляриту и стоп-словам.";
        
        if (useStrictRules) {
          activePolicy = policy + "\n\n" + STRICT_RUSSIAN_RULES;
        }
      }
    }

    const prompt = `
      ${systemInstruction}
      
      КРИТЕРИИ ПРОВЕРКИ (POLICY / FRAMEWORK):
      ${activePolicy}
      
      КОНТЕНТ ДЛЯ АНАЛИЗА:
      ${content}
      
      Анализируй ИСКЛЮЧИТЕЛЬНО на основе переданных КРИТЕРИЕВ.
      Для стиля '${contentStyle}' используй соответствующий тон критики.
      Отвечай ИСКЛЮЧИТЕЛЬНО НА РУССКОМ ЯЗЫКЕ.
      Если текст идеален, поставь 100 баллов.
      Если есть нарушения (или слабые места в прозе), укажи их, объясни причину (почему это не работает) и предложи вариант улучшения.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: contentStyle === 'creative' ? 0.4 : 0.1, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("Не получен ответ от Gemini.");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateHeadlines = async (content: string, contentStyle: ContentStyle): Promise<HeadlineSuggestion[]> => {
    try {
        const ai = getAIClient();

        const prompt = `
          Проанализируй следующий текст и придумай 5 вариантов заголовков в разных стилях.
          
          Контекст: Текст написан в стиле "${contentStyle === 'informational' ? 'Информационный/Деловой' : contentStyle === 'news' ? 'Новостной/Журналистский' : 'Художественный/Сторителинг'}".
          
          Сгенерируй заголовки для следующих категорий:
          1. SEO (Для поиска, содержит ключевые слова)
          2. Clickbait (Интригующий, высокий CTR, но не обман)
          3. Social (Вовлекающий, для соцсетей)
          4. Business (Деловой, сдержанный, фактический)
          5. Creative (Необычный, метафоричный, игра слов)

          Текст:
          ${content.substring(0, 5000)} // Truncate to avoid token limits if too huge
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: headlinesSchema,
                temperature: 0.7, // Higher creative freedom for headlines
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as HeadlineSuggestion[];
        } else {
            throw new Error("No response");
        }

    } catch (error) {
        console.error("Headline generation failed:", error);
        throw error;
    }
};

export const rewriteSelection = async (selection: string, option: RewriteOption, context: string): Promise<string> => {
    try {
        const ai = getAIClient();
        
        let instruction = "";
        switch(option) {
            case 'shorten':
                instruction = "Сократи этот фрагмент, сохранив главный смысл. Удали воду и лишние слова.";
                break;
            case 'expand':
                instruction = "Раскрой мысль подробнее, добавь деталей или объяснений, но не лей воду.";
                break;
            case 'formal':
                instruction = "Перепиши этот фрагмент в формальном, деловом стиле. Используй профессиональную лексику.";
                break;
            case 'creative':
                instruction = "Сделай этот фрагмент более живым, креативным и образным. Используй метафоры или интересные обороты.";
                break;
            case 'fix':
                instruction = "Исправь грамматические, пунктуационные и стилистические ошибки в этом фрагменте, сохранив исходный смысл.";
                break;
            case 'bureaucratese':
                instruction = "Перепиши этот текст на тяжелом, канцелярском языке (бюрократ). Используй отглагольные существительные, пассивный залог, сложные конструкции, штампы вроде 'осуществляет деятельность', 'в рамках реализации', 'во избежание'. Текст должен звучать максимально сухо и сложно для восприятия.";
                break;
        }

        const prompt = `
          Твоя задача — переписать ВЫДЕЛЕННЫЙ ФРАГМЕНТ текста согласно инструкции.
          
          ИНСТРУКЦИЯ: ${instruction}
          
          КОНТЕКСТ (весь текст):
          ${context.substring(0, 1000)} ... (контекст нужен только для понимания смысла)
          
          ВЫДЕЛЕННЫЙ ФРАГМЕНТ (который нужно переписать):
          "${selection}"
          
          ВАЖНО: Верни ТОЛЬКО переписанный текст. Не добавляй кавычки, преамбулы (типа "Вот ваш текст") или объяснения. Текст должен грамматически вписываться в предложение, если это часть предложения.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        
        // Clean up potential quotes if the model adds them despite instructions
        let result = response.text || selection;
        if (result.startsWith('"') && result.endsWith('"')) {
            result = result.slice(1, -1);
        }
        return result.trim();

    } catch (error) {
        console.error("Rewrite failed:", error);
        throw error;
    }
};

export const simulateReader = async (content: string, persona: AudiencePersona): Promise<string> => {
    try {
        const ai = getAIClient();
        
        let rolePrompt = persona.systemPrompt || "";
        
        // --- CUSTOM PERSONA LOGIC ---
        if (persona.isCustom && persona.customDescription) {
            rolePrompt = `
                Ты — человек, который описывается так: "${persona.customDescription}".
                Вживись в эту роль максимально глубоко. 
                Подумай, какие у этого человека ценности, страхи, словарный запас.
                Твоя задача — прокомментировать текст именно с позиции этого человека.
            `;
        }

        const prompt = `
            РОЛЬ:
            ${rolePrompt}
            
            КОНТЕКСТ РОЛИ:
            Имя: ${persona.name} (${persona.emoji})
            Описание: ${persona.description || persona.customDescription}
            
            ЗАДАЧА:
            Прочитай следующий текст и дай честный фидбек от первого лица. 
            Твой ответ должен быть коротким (2-4 предложения) и эмоциональным. 
            Используй характерную лексику и манеру речи своего персонажа.
            Не стесняйся критиковать, если текст тебе не нравится, или хвалить, если он попадает в твои интересы.
            
            ТЕКСТ ДЛЯ ЧТЕНИЯ:
            ${content.substring(0, 3000)}
            
            ТВОЙ ОТВЕТ (в чате):
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8, // High temperature for creative roleplay
            }
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("No response from simulator");
        }
    } catch (error) {
        console.error("Simulation failed:", error);
        throw error;
    }
}