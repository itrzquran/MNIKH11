import React, { useState } from 'react';
import { Invoice, Unit } from '../types';
import { Printer, Trash2, CheckCircle, XCircle, Plus, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface InvoiceManagerProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  units: Unit[];
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ invoices, setInvoices, units }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    type: 'RENT',
    date: new Date().toISOString().split('T')[0],
    isPaid: false
  });

  const handleAddInvoice = () => {
    if (!newInvoice.unitId || !newInvoice.amount) return;
    
    const unit = units.find(u => u.id === newInvoice.unitId);
    const invoice: Invoice = {
      id: Date.now().toString(),
      unitId: newInvoice.unitId,
      tenantName: newInvoice.tenantName || 'نامشخص', // Usually fetched from Unit's tenant
      amount: newInvoice.amount,
      date: newInvoice.date!,
      dueDate: newInvoice.dueDate || newInvoice.date!,
      description: newInvoice.description || '',
      isPaid: false,
      type: newInvoice.type as any
    };

    setInvoices([invoice, ...invoices]);
    setIsModalOpen(false);
    setNewInvoice({ type: 'RENT', date: new Date().toISOString().split('T')[0], isPaid: false });
  };

  const toggleStatus = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, isPaid: !inv.isPaid } : inv));
  };

  const deleteInvoice = (id: string) => {
    if(confirm('آیا از حذف این فاکتور اطمینان دارید؟')) {
        setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const exportToExcel = () => {
    const data = invoices.map(inv => ({
      'شماره فاکتور': inv.id,
      'شماره واحد': units.find(u => u.id === inv.unitId)?.number || 'حذف شده',
      'نام مستاجر': inv.tenantName,
      'مبلغ (تومان)': inv.amount,
      'تاریخ صدور': inv.date,
      'تاریخ سررسید': inv.dueDate,
      'نوع': inv.type === 'RENT' ? 'اجاره' : inv.type === 'CHARGE' ? 'شارژ' : 'سایر',
      'وضعیت': inv.isPaid ? 'پرداخت شده' : 'پرداخت نشده'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "Gozaresh_Factor_Ha.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت فاکتورها</h2>
          <p className="text-gray-500 mt-1">صدور صورت‌حساب و پیگیری پرداخت‌ها</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all"
            >
                <FileSpreadsheet size={18} />
                <span>خروجی اکسل</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
            >
                <Plus size={18} />
                <span>صدور فاکتور جدید</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">واحد</th>
                <th className="px-6 py-3">مستاجر</th>
                <th className="px-6 py-3">مبلغ (تومان)</th>
                <th className="px-6 py-3">تاریخ</th>
                <th className="px-6 py-3">نوع</th>
                <th className="px-6 py-3">وضعیت</th>
                <th className="px-6 py-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {units.find(u => u.id === invoice.unitId)?.number || '---'}
                  </td>
                  <td className="px-6 py-4">{invoice.tenantName}</td>
                  <td className="px-6 py-4 font-bold">{invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                        {invoice.type === 'RENT' ? 'اجاره' : invoice.type === 'CHARGE' ? 'شارژ' : 'سایر'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(invoice.id)} className="flex items-center gap-1">
                      {invoice.isPaid ? (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs">
                          <CheckCircle size={14} /> پرداخت شده
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
                          <XCircle size={14} /> ناموفق
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button className="text-gray-400 hover:text-gray-600" title="چاپ">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => deleteInvoice(invoice.id)} className="text-gray-400 hover:text-red-500" title="حذف">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        هنوز فاکتوری صادر نشده است.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold mb-4">صدور فاکتور جدید</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">انتخاب واحد</label>
                 <select 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={newInvoice.unitId || ''}
                    onChange={e => setNewInvoice({...newInvoice, unitId: e.target.value})}
                 >
                     <option value="">انتخاب کنید...</option>
                     {units.map(u => (
                         <option key={u.id} value={u.id}>واحد {u.number} - {u.status}</option>
                     ))}
                 </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام پرداخت کننده</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="نام مستاجر"
                  value={newInvoice.tenantName || ''}
                  onChange={e => setNewInvoice({...newInvoice, tenantName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ (تومان)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newInvoice.amount || ''}
                  onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ صدور</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newInvoice.date || ''}
                  onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع هزینه</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newInvoice.type}
                  onChange={e => setNewInvoice({...newInvoice, type: e.target.value as any})}
                >
                    <option value="RENT">اجاره ماهیانه</option>
                    <option value="CHARGE">شارژ ساختمان</option>
                    <option value="REPAIR">تعمیرات</option>
                    <option value="OTHER">سایر</option>
                </select>
              </div>
              <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    rows={3}
                    value={newInvoice.description || ''}
                    onChange={e => setNewInvoice({...newInvoice, description: e.target.value})}
                  ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                انصراف
              </button>
              <button 
                onClick={handleAddInvoice}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                تایید و صدور
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};