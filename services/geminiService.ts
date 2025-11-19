import { GoogleGenAI } from "@google/genai";

// In a real app, this comes from env. For this demo, we assume it's available.
// If process.env.API_KEY is not set, the app should handle it gracefully or prompt (handled in UI).
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateLeaseAgreement = async (tenantName: string, unitNumber: string, rentAmount: number, startDate: string): Promise<string> => {
  if (!apiKey) return "کلید API یافت نشد.";

  try {
    const prompt = `
      یک پیش‌نویس قرارداد اجاره ساده و رسمی به زبان فارسی بنویس.
      اطلاعات:
      موجر: مدیریت ساختمان هما
      مستاجر: ${tenantName}
      واحد: ${unitNumber}
      مبلغ اجاره ماهیانه: ${rentAmount} تومان
      تاریخ شروع: ${startDate}
      
      لطفا متن را در قالب Markdown و بسیار مرتب ارائه بده.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "خطا در تولید متن قرارداد.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "متاسفانه در برقراری ارتباط با هوش مصنوعی خطایی رخ داد.";
  }
};

export const analyzeFinancials = async (invoices: any[]): Promise<string> => {
  if (!apiKey) return "کلید API یافت نشد.";

  try {
    const prompt = `
      من یک لیست از فاکتورهای ساختمان دارم. لطفا یک تحلیل کوتاه مدیریتی و پیشنهاد برای بهبود وضعیت مالی بده.
      داده‌ها (JSON):
      ${JSON.stringify(invoices.slice(0, 20))}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "خطا در تحلیل داده‌ها.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "خطا در تحلیل هوشمند.";
  }
};
