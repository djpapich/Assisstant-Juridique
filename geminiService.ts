import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisReport, CaseDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        documentData: {
            type: Type.OBJECT,
            properties: {
                numeroDossier: { type: Type.STRING },
                tribunal: { type: Type.STRING },
                typeAffaire: { type: Type.STRING },
                etatDossier: { type: Type.STRING },
            },
            required: ['numeroDossier', 'tribunal', 'typeAffaire', 'etatDossier'],
        },
        onlineData: {
            type: Type.OBJECT,
            properties: {
                numeroDossier: { type: Type.STRING },
                tribunal: { type: Type.STRING },
                typeAffaire: { type: Type.STRING },
                etatDossier: { type: Type.STRING },
            },
            required: ['numeroDossier', 'tribunal', 'typeAffaire', 'etatDossier'],
        },
        analysisReport: {
            type: Type.OBJECT,
            properties: {
                resume: { type: Type.STRING },
                incoherences: { type: Type.ARRAY, items: { type: Type.STRING } },
                pointsCles: { type: Type.ARRAY, items: { type: Type.STRING } },
                prochainesEtapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "Date in ISO 8601 format (YYYY-MM-DD)" },
                            description: { type: Type.STRING },
                            source: { type: Type.STRING, enum: ['المستند', 'عبر الإنترنت'] },
                        },
                        required: ['date', 'description', 'source'],
                    }
                },
            },
            required: ['resume', 'incoherences', 'pointsCles', 'prochainesEtapes', 'timeline'],
        }
    },
    required: ['documentData', 'onlineData', 'analysisReport'],
};


export interface GeminiAnalysisResult {
  documentData: CaseDetails;
  onlineData: CaseDetails;
  analysisReport: AnalysisReport;
}

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const model = "gemini-pro-vision"; // Use a vision-capable model

  const prompt = `
    استخرج كل النص من الصورة التالية. أرجع النص المستخرج فقط، بدون أي تنسيق إضافي أو مقدمات.
    `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: 'image/png', // Assuming PNG, but should be dynamic based on actual image type
            data: base64Image.split(',')[1], // Extract base64 data part
          },
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error extracting text from image with Gemini:", error);
    throw new Error("فشل استخراج النص من الصورة. يرجى المحاولة مرة أخرى.");
  }
};

export const analyzeCaseDocument = async (documentText: string): Promise<GeminiAnalysisResult> => {
  const model = "gemini-2.5-pro";

  const prompt = `
    أنت خبير في تحليل المستندات القانونية المغربية. قم بتحليل النص التالي من مستند قضائي.
    النص: "${documentText}"

    مهامك هي:
    1.  **استخراج البيانات من المستند**: استخرج رقم القضية، المحكمة، نوع القضية، وحالة القضية من النص.
    2.  **محاكاة بيانات عبر الإنترنت**: بناءً على البيانات المستخرجة، قم بإنشاء مجموعة بيانات مماثلة كما لو تم العثور عليها عبر الإنترنت. يمكنك إدخال تناقض طفيف واحد (على سبيل المثال، حالة قضية مختلفة قليلاً أو تاريخ جلسة استماع مختلف ضمنيًا) لأغراض المقارنة.
    3.  **إنشاء تقرير تحليلي**:
        *   **ملخص**: اكتب ملخصًا موجزًا للقضية.
        *   **التناقضات**: قارن البيانات المستخرجة من المستند مع البيانات المحاكاة عبر الإنترنت وحدد أي تناقضات. إذا لم تجد أيًا، فذكر ذلك. اذكر أيضًا أي تناقضات داخلية في المستند نفسه.
        *   **النقاط الرئيسية**: حدد 3-4 نقاط رئيسية أو رؤى من المستند.
        *   **الخطوات التالية الموصى بها**: اقترح 2-3 خطوات تالية قابلة للتنفيذ للمحامي أو العميل.
        *   **الجدول الزمني**: قم بإنشاء جدول زمني للأحداث الرئيسية المذكورة في المستند أو التي يمكن استنتاجها منه. أضف حدثًا واحدًا على الأقل من المصدر "عبر الإنترنت" الذي قمت بمحاكاته.

    أرجع النتائج بتنسيق JSON صارم يتوافق مع المخطط المقدم.
    `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });
    
    const jsonText = response.text.trim();
    const result: GeminiAnalysisResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    throw new Error("فشل تحليل المستند. يرجى المحاولة مرة أخرى.");
  }
};

export const generateReportFromManualInput = async (manualData: CaseDetails): Promise<GeminiAnalysisResult> => {
    const model = "gemini-2.5-pro";
  
    const prompt = `
      أنت خبير في تحليل القضايا القانونية المغربية. لقد تم تزويدك بتفاصيل قضية تم إدخالها يدويًا.
  
      البيانات المدخلة:
      - رقم القضية: ${manualData.numeroDossier}
      - المحكمة: ${manualData.tribunal}
      - الفئة: ${manualData.category || 'غير محدد'}
  
      مهامك هي:
      1.  **استخدام البيانات المدخلة**: اعتبر البيانات المدخلة هي البيانات من "المستند" المرجعي.
      2.  **محاكاة بيانات عبر الإنترنت**: بناءً على البيانات المدخلة، قم بإنشاء مجموعة بيانات مماثلة كما لو تم العثور عليها عبر الإنترنت. يمكنك إدخال تناقض طفيف واحد (على سبيل المثال، حالة قضية مختلفة قليلاً أو تاريخ جلسة مختلف) لأغراض المقارنة. قم باختلاق نوع القضية وحالة القضية لكلا المصدرين (المستند والإنترنت) بطريقة منطقية.
      3.  **إنشاء تقرير تحليلي**:
          *   **ملخص**: اكتب ملخصًا موجزًا للقضية بناءً على المعلومات المتاحة.
          *   **التناقضات**: قارن البيانات المدخلة مع البيانات المحاكاة عبر الإنترنت وحدد أي تناقضات.
          *   **النقاط الرئيسية**: حدد 3-4 نقاط رئيسية أو رؤى يمكن استنتاجها.
          *   **الخطوات التالية الموصى بها**: اقترح 2-3 خطوات تالية قابلة للتنفيذ.
          *   **الجدول الزمني**: قم بإنشاء جدول زمني بسيط بافتراض تاريخ أو حدثين رئيسيين. يجب أن يأتي حدث واحد على الأقل من المصدر "عبر الإنترنت" الذي قمت بمحاكاته.
  
      أرجع النتائج بتنسيق JSON صارم يتوافق مع المخطط المقدم. في الكائن JSON النهائي، يجب أن يكون مفتاح "documentData" يحتوي على البيانات الأصلية المقدمة (مع إضافة نوع وحالة القضية المختلقة).
      `;
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2,
        },
      });
      
      const jsonText = response.text.trim();
      const result: GeminiAnalysisResult = JSON.parse(jsonText);
      return result;
  
    } catch (error) {
      console.error("Error generating report from manual input:", error);
      throw new Error("فشل إنشاء التقرير من البيانات اليدوية. يرجى المحاولة مرة أخرى.");
    }
  };
