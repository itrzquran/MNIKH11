import React, { useState } from 'react';
import { MaintenanceRecord } from '../types';
import { Plus, Trash2, Wrench, FileSpreadsheet, Calendar, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaintenanceManagerProps {
  records: MaintenanceRecord[];
  setRecords: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>;
}

export const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ records, setRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    supplier: ''
  });

  const handleAddRecord = () => {
    if (!newRecord.description || !newRecord.amount) return;

    const record: MaintenanceRecord = {
      id: Date.now().toString(),
      date: newRecord.date!,
      description: newRecord.description!,
      amount: Number(newRecord.amount),
      supplier: newRecord.supplier || 'نامشخص'
    };

    setRecords([record, ...records]);
    setIsModalOpen(false);
    setNewRecord({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, supplier: '' });
  };

  const deleteRecord = (id: string) => {
    if(confirm('آیا از حذف این هزینه اطمینان دارید؟')) {
        setRecords(records.filter(r => r.id !== id));
    }
  };

  const exportToExcel = () => {
    const data = records.map(r => ({
      'تاریخ': r.date,
      'شرح هزینه': r.description,
      'مبلغ (تومان)': r.amount,
      'تامین کننده / تعمیرکار': r.supplier,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Maintenance Costs");
    XLSX.writeFile(wb, "Gozaresh_Hazine_Ha.xlsx");
  };

  const totalCost = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">هزینه‌ها و تعمیرات</h2>
          <p className="text-gray-500 mt-1">ثبت و مدیریت مخارج نگهداری ساختمان</p>
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
                <span>ثبت هزینه جدید</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600">
                    <Wrench size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">مجموع هزینه‌های ثبت شده</p>
                    <h3 className="text-2xl font-bold text-gray-800">{totalCost.toLocaleString()} تومان</h3>
                </div>
            </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">تاریخ</th>
                        <th className="px-6 py-3">شرح هزینه</th>
                        <th className="px-6 py-3">تامین کننده</th>
                        <th className="px-6 py-3">مبلغ</th>
                        <th className="px-6 py-3 text-center">عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {record.date}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">{record.description}</td>
                            <td className="px-6 py-4">{record.supplier}</td>
                            <td className="px-6 py-4 text-red-600 font-bold">
                                {record.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => deleteRecord(record.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {records.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                هیچ هزینه‌ای ثبت نشده است.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">ثبت هزینه تعمیرات/خرید</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newRecord.date}
                  onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شرح هزینه (کالا یا خدمات)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="مثلا: تعمیر آسانسور"
                  value={newRecord.description}
                  onChange={e => setNewRecord({...newRecord, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ (تومان)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newRecord.amount}
                  onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام تعمیرکار / فروشگاه</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newRecord.supplier}
                  onChange={e => setNewRecord({...newRecord, supplier: e.target.value})}
                />
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
                onClick={handleAddRecord}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                ثبت هزینه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};