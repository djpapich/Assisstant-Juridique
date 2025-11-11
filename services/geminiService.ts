import { GoogleGenAI, Part } from "@google/genai";
import type { ChatMessage, Language, Attachment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageInstruction = (language: Language) => {
  return language === 'fr' ? 'Répondez exclusivement en français.' : 'أجب باللغة العربية فقط.';
};

const getBaseSystemInstruction = (language: Language) => `
Vous êtes un assistant juridique expert spécialisé dans le droit marocain. 
Votre base de connaissances est fondée sur les lois, décrets (Dahirs), codes et jurisprudences les plus récents provenant de sources gouvernementales marocaines officielles (par exemple, 9anoun.ma, justice.gov.ma).
Fournissez des réponses précises, factuelles et professionnelles.
${getLanguageInstruction(language)}
`;

export const getChatResponse = async (history: ChatMessage[], newMessage: ChatMessage, language: Language): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getBaseSystemInstruction(language),
      },
      history: history.map(msg => {
          const parts: Part[] = [{ text: msg.text }];
          if (msg.attachments) {
            msg.attachments.forEach(att => {
              parts.push({ inlineData: { data: att.data, mimeType: att.mimeType } });
            });
          }
          return { role: msg.role, parts };
      })
    });

    const messageParts: Part[] = [{ text: newMessage.text }];
    if (newMessage.attachments) {
        for (const attachment of newMessage.attachments) {
            messageParts.push({
                inlineData: {
                    data: attachment.data,
                    mimeType: attachment.mimeType,
                },
            });
        }
    }

    const response = await chat.sendMessage({ message: { parts: messageParts }});
    return response.text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    return language === 'fr' ? "Désolé, une erreur s'est produite. Veuillez réessayer." : "عذرا، حدث خطأ. يرجى المحاولة مرة أخرى.";
  }
};

export const analyzeDocument = async (document: Attachment, question: string, language: Language): Promise<string> => {
  const userPrompt = {
      parts: [
          { inlineData: { data: document.data, mimeType: document.mimeType } },
          { text: `Analysez ce document et répondez à la question suivante : "${question}"` }
      ]
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: getBaseSystemInstruction(language)
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing document:", error);
    return language === 'fr' ? "Désolé, une erreur est survenue lors de l'analyse du document." : "عذرا، حدث خطأ أثناء تحليل المستند.";
  }
};

export const generateDocument = async (documentTypeName: string, formData: Record<string, string>, language: Language): Promise<string> => {
  const userPrompt = `
    Générez un document juridique/administratif de type "${documentTypeName}" en utilisant les informations suivantes.
    Le document doit être formel, bien structuré et conforme aux normes et usages en vigueur au Maroc.
    
    INFORMATIONS:
    ---
    ${JSON.stringify(formData, null, 2)}
    ---
    
    Générez uniquement le contenu du document, sans commentaires additionnels.
  `;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: getBaseSystemInstruction(language)
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating document:", error);
    return language === 'fr' ? "Désolé, une erreur est survenue lors de la génération du document." : "عذرا، حدث خطأ أثناء إنشاء المستند.";
  }
};