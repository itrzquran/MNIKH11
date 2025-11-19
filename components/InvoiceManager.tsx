import React, { useState } from 'react';
import { Invoice, Unit, Tenant } from '../types';
import { Printer, Trash2, CheckCircle, XCircle, Plus, FileSpreadsheet, X, ZoomIn, ZoomOut, Download, Share2, Mail, MessageCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { InvoiceTemplate } from './InvoiceTemplate';

interface InvoiceManagerProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  units: Unit[];
  tenants: Tenant[];
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ invoices, setInvoices, units, tenants }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [scale, setScale] = useState(0.8);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    type: 'RENT',
    date: new Date().toISOString().split('T')[0],
    isPaid: false
  });

  // Auto-fill tenant info when unit is selected
  const handleUnitSelect = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    let tenantName = '';
    let tenantId = undefined;

    if (unit && unit.tenantId) {
        const tenant = tenants.find(t => t.id === unit.tenantId);
        if (tenant) {
            tenantName = tenant.name;
            tenantId = tenant.id;
        }
    }

    setNewInvoice({
        ...newInvoice,
        unitId,
        tenantName,
        tenantId
    });
  };

  const handleAddInvoice = () => {
    if (!newInvoice.unitId || !newInvoice.amount) return;
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      unitId: newInvoice.unitId,
      tenantName: newInvoice.tenantName || 'نامشخص',
      tenantId: newInvoice.tenantId,
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    try {
      const element = document.querySelector('.printable-area') as HTMLElement;
      if (!element) return;

      // Store original style to reset later
      const originalTransform = element.style.transform;
      element.style.transform = 'scale(1)'; // Reset scale for capture

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // Restore scale
      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${printInvoice?.id}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('خطا در تولید فایل PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = (invoice: Invoice, tenant?: Tenant) => {
    if (!tenant?.phone) {
        alert('شماره تماس مستاجر یافت نشد.');
        return;
    }
    const text = `سلام ${tenant.name} عزیز،\nفاکتور ${invoice.type === 'RENT' ? 'اجاره' : 'شارژ'} شما به مبلغ ${invoice.amount.toLocaleString()} تومان صادر شد.\nشماره فاکتور: ${invoice.id.slice(-6)}\nمهلت پرداخت: ${invoice.dueDate}\n\nمدیریت ساختمان هما`;
    const url = `https://wa.me/${tenant.phone.replace(/^0/, '+98')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = (invoice: Invoice, tenant?: Tenant) => {
    const subject = `فاکتور جدید: ${invoice.type === 'RENT' ? 'اجاره' : 'شارژ'} ساختمان`;
    const body = `با سلام،\n\nفاکتور جدید برای واحد شما صادر گردید.\n\nمبلغ: ${invoice.amount.toLocaleString()} تومان\nتاریخ سررسید: ${invoice.dueDate}\n\nلطفا نسبت به پرداخت آن اقدام فرمایید.\n\nمدیریت ساختمان هما`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
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
                    <button 
                        onClick={() => setPrintInvoice(invoice)} 
                        className="text-gray-400 hover:text-gray-600" 
                        title="چاپ فاکتور"
                    >
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
                    onChange={e => handleUnitSelect(e.target.value)}
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

      {/* Print Preview Modal */}
      {printInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-100 rounded-xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg hidden sm:block">پیش‌نمایش فاکتور</h3>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1.5 hover:bg-gray-200 rounded" title="کوچک‌نمایی">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-mono min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-1.5 hover:bg-gray-200 rounded" title="بزرگ‌نمایی">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                </div>
                <button onClick={() => setPrintInvoice(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-500 flex justify-center relative">
                <div 
                    className="printable-area shadow-2xl origin-top transition-transform duration-200 bg-white"
                    style={{ transform: `scale(${scale})`, minWidth: '210mm', minHeight: '297mm' }}
                >
                    <InvoiceTemplate 
                        invoice={printInvoice} 
                        unit={units.find(u => u.id === printInvoice.unitId)}
                        tenant={tenants.find(t => t.id === printInvoice.tenantId) || tenants.find(t => t.name === printInvoice.tenantName)}
                    />
                </div>
            </div>

            <div className="p-4 bg-white border-t flex flex-wrap justify-end gap-3">
                 <button 
                    onClick={() => {
                        const tenant = tenants.find(t => t.id === printInvoice.tenantId) || tenants.find(t => t.name === printInvoice.tenantName);
                        handleWhatsAppShare(printInvoice, tenant);
                    }} 
                    className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2"
                >
                    <MessageCircle size={18} />
                    <span className="hidden sm:inline">واتساپ</span>
                </button>

                <button 
                    onClick={() => {
                        const tenant = tenants.find(t => t.id === printInvoice.tenantId) || tenants.find(t => t.name === printInvoice.tenantName);
                        handleEmailShare(printInvoice, tenant);
                    }} 
                    className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                >
                    <Mail size={18} />
                    <span className="hidden sm:inline">ایمیل</span>
                </button>

                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span className="hidden sm:inline">دانلود PDF</span>
                </button>

                <button 
                    onClick={handlePrint} 
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-lg shadow-primary-500/30"
                >
                    <Printer size={18} />
                    <span className="hidden sm:inline">چاپ فاکتور</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};