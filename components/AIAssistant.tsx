import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { generateLeaseAgreement, analyzeFinancials } from '../services/geminiService';
import { Invoice, Unit } from '../types';

interface AIAssistantProps {
  invoices: Invoice[];
  units: Unit[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ invoices, units }) => {
  const [mode, setMode] = useState<'CHAT' | 'CONTRACT' | 'ANALYSIS'>('CHAT');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  // Contract Form State
  const [contractDetails, setContractDetails] = useState({
    tenant: '',
    unit: '',
    amount: 0,
    date: ''
  });

  const handleGenerateContract = async () => {
    setLoading(true);
    const result = await generateLeaseAgreement(
        contractDetails.tenant, 
        contractDetails.unit, 
        contractDetails.amount, 
        contractDetails.date
    );
    setResponse(result);
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeFinancials(invoices);
    setResponse(result);
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    try {
        // Direct chat for general queries
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `تو یک دستیار مدیر ساختمان هستی. به این سوال پاسخ بده: ${chatInput}`
        });
        setResponse(result.text || 'پاسخی دریافت نشد.');
    } catch (e) {
        setResponse('خطا در ارتباط با هوش مصنوعی.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="text-yellow-300" />
                دستیار هوشمند هما
            </h2>
            <p className="opacity-90 mt-1 text-indigo-100">ساخته شده با Gemini 2.5 - مشاور حقوقی و مالی شما</p>
        </div>
        <Sparkles className="text-yellow-300 opacity-50 w-12 h-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
            onClick={() => { setMode('CHAT'); setResponse(''); }}
            className={`p-4 rounded-xl border transition-all ${mode === 'CHAT' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        >
            <span className="font-bold block mb-1">چت عمومی</span>
            <span className="text-xs opacity-70">سوالات حقوقی و عمومی</span>
        </button>
        <button 
            onClick={() => { setMode('CONTRACT'); setResponse(''); }}
            className={`p-4 rounded-xl border transition-all ${mode === 'CONTRACT' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        >
            <span className="font-bold block mb-1">تولید قرارداد</span>
            <span className="text-xs opacity-70">تنظیم اجاره‌نامه رسمی</span>
        </button>
        <button 
            onClick={() => { setMode('ANALYSIS'); setResponse(''); handleAnalyze(); }}
            className={`p-4 rounded-xl border transition-all ${mode === 'ANALYSIS' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        >
            <span className="font-bold block mb-1">تحلیل مالی</span>
            <span className="text-xs opacity-70">بررسی وضعیت درآمدها</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Input Area based on Mode */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
            {mode === 'CHAT' && (
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                        placeholder="هر سوالی در مورد قوانین آپارتمان نشینی دارید بپرسید..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat()}
                    />
                    <button onClick={handleChat} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            )}

            {mode === 'CONTRACT' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-500">نام مستاجر</label>
                        <input type="text" className="w-full border p-2 rounded bg-white" value={contractDetails.tenant} onChange={e => setContractDetails({...contractDetails, tenant: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">شماره واحد</label>
                        <input type="text" className="w-full border p-2 rounded bg-white" value={contractDetails.unit} onChange={e => setContractDetails({...contractDetails, unit: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">اجاره ماهیانه</label>
                        <input type="number" className="w-full border p-2 rounded bg-white" value={contractDetails.amount} onChange={e => setContractDetails({...contractDetails, amount: Number(e.target.value)})} />
                    </div>
                    <button onClick={handleGenerateContract} disabled={loading} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'تولید قرارداد'}
                    </button>
                </div>
            )}
             {mode === 'ANALYSIS' && (
                <div className="flex items-center gap-2 text-gray-600">
                    <Sparkles size={18} className="text-yellow-500" />
                    <span>هوش مصنوعی در حال بررسی {invoices.length} فاکتور ثبت شده شماست...</span>
                </div>
             )}
        </div>

        {/* Output Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                    <span>در حال تفکر...</span>
                </div>
            ) : response ? (
                <div className="prose prose-indigo max-w-none rtl:prose-p:text-justify text-gray-800 whitespace-pre-line">
                    {response}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                    <Bot size={48} className="mb-2 opacity-20" />
                    <p>منتظر دستور شما هستم</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};