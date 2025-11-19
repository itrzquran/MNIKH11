import React from 'react';
import { Invoice, Unit, Tenant } from '../types';
import { Building } from 'lucide-react';

interface InvoiceTemplateProps {
  invoice: Invoice;
  unit?: Unit;
  tenant?: Tenant;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, unit, tenant }) => {
  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-800 relative overflow-hidden flex flex-col">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Building size={400} />
      </div>

      {/* Paid Stamp */}
      {invoice.isPaid && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-[6px] border-green-600 text-green-600 rounded-2xl w-80 h-40 flex items-center justify-center opacity-20 rotate-[-15deg] pointer-events-none z-0 print:opacity-20">
          <div className="text-center">
            <span className="block text-5xl font-black uppercase tracking-widest mb-2">پرداخت شد</span>
            <span className="block text-lg font-bold bg-green-600 text-white px-2 rounded">{invoice.date}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative flex justify-between items-start border-b-4 border-gray-800 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-900 text-white flex items-center justify-center rounded-lg print:bg-black print:text-white">
            <Building size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">مدیریت ساختمان هما</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Homa Building Management System</p>
            <p className="text-xs text-gray-400 mt-1">شماره ثبت: ۱۲۳۴۵۶</p>
          </div>
        </div>
        <div className="text-left">
          <h2 className="text-4xl font-black text-gray-200 print:text-gray-600 mb-4">صورتحساب</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-8 items-center bg-gray-50 px-3 py-1 rounded print:bg-gray-100">
              <span className="text-gray-500 font-bold">شماره فاکتور:</span>
              <span className="font-mono font-bold text-lg">{invoice.id.slice(-6)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-500">تاریخ صدور:</span>
              <span className="font-medium">{invoice.date}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-500">تاریخ سررسید:</span>
              <span className="font-medium text-red-600">{invoice.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
        <div className="bg-gray-50 p-6 rounded-xl print:bg-gray-50 border border-gray-100 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            فروشنده / دریافت کننده
          </h3>
          <div className="text-lg font-bold text-gray-900 mb-2">هیئت مدیره ساختمان هما</div>
          <div className="text-sm text-gray-600 leading-relaxed space-y-1">
            <p>آدرس: تهران، خیابان ولیعصر، برج هما</p>
            <p>تلفن: ۰۲۱-۸۸۸۸۸۸۸۸</p>
            <p>شماره کارت: <span className="font-mono font-bold">۶۰۳۷-۹۹۱۸-۹۹۹۹-۰۰۰۰</span></p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl print:bg-gray-50 border border-gray-100 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
             <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
             خریدار / پرداخت کننده
          </h3>
          <div className="text-lg font-bold text-gray-900 mb-2">{invoice.tenantName}</div>
          <div className="text-sm text-gray-600 leading-relaxed space-y-1">
            {tenant ? (
                <>
                  <p>شماره تماس: {tenant.phone}</p>
                  <p>کد ملی: {tenant.nationalId}</p>
                </>
            ) : (
                <p className="text-gray-400 italic">اطلاعات تکمیلی ثبت نشده است</p>
            )}
            {unit && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <span className="inline-block bg-white px-3 py-1 rounded border text-xs font-bold shadow-sm">
                        واحد {unit.number} - طبقه {unit.floor}
                    </span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 mb-12">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white print:bg-black print:text-white">
              <th className="py-4 px-4 text-sm font-bold w-16 rounded-r-lg">ردیف</th>
              <th className="py-4 px-4 text-sm font-bold">شرح کالا / خدمات</th>
              <th className="py-4 px-4 text-sm font-bold w-32">نوع</th>
              <th className="py-4 px-4 text-sm font-bold text-left w-48 rounded-l-lg">مبلغ (تومان)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-6 px-4 text-sm text-gray-500 font-mono text-center">1</td>
              <td className="py-6 px-4">
                <p className="text-base font-bold text-gray-900">
                    {invoice.description || (invoice.type === 'RENT' ? 'اجاره ماهیانه' : invoice.type === 'CHARGE' ? 'شارژ ماهیانه ساختمان' : 'هزینه تعمیرات')}
                </p>
                {unit && <p className="text-xs text-gray-500 mt-2">مربوط به دوره {invoice.date.substring(0, 7)} برای واحد {unit.number}</p>}
              </td>
              <td className="py-6 px-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-gray-200">
                    {invoice.type === 'RENT' ? 'اجاره' : invoice.type === 'CHARGE' ? 'شارژ' : 'سایر'}
                </span>
              </td>
              <td className="py-6 px-4 text-lg font-bold text-gray-900 text-left">{invoice.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-end mb-12">
        <div className="w-72 bg-gray-50 p-6 rounded-xl print:bg-gray-50 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">جمع کل</span>
            <span className="font-bold text-gray-800">{invoice.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <span className="text-sm text-gray-500">مالیات و عوارض</span>
            <span className="font-bold text-gray-800">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-black text-primary-700 print:text-black">مبلغ قابل پرداخت</span>
            <span className="text-xl font-black text-primary-700 print:text-black">{invoice.amount.toLocaleString()} <span className="text-xs font-normal text-gray-500">تومان</span></span>
          </div>
        </div>
      </div>

      {/* Footer Note & Signatures */}
      <div className="mt-auto pt-8 border-t-2 border-gray-100">
        <div className="flex justify-between items-end">
            <div className="text-xs text-gray-500 max-w-md leading-relaxed">
            <p className="mb-2 font-bold text-gray-800">توضیحات پرداخت:</p>
            <p className="text-justify">لطفا مبلغ فاکتور را تا تاریخ سررسید به شماره حساب اعلام شده واریز نمایید. این فاکتور بدون مهر و امضای مدیریت فاقد اعتبار است.</p>
            </div>
            <div className="flex gap-16 text-center">
            <div className="space-y-16">
                <span className="text-sm font-bold text-gray-900 block">مهر و امضاء مدیر ساختمان</span>
                <div className="border-b-2 border-gray-300 w-40 border-dashed"></div>
            </div>
            </div>
        </div>
        <div className="text-center mt-8">
            <p className="text-[10px] text-gray-300">این فاکتور به صورت سیستمی توسط نرم‌افزار مدیریت ساختمان هما صادر شده است.</p>
        </div>
      </div>
    </div>
  );
};