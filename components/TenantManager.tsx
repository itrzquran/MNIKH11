import React, { useState } from 'react';
import { Tenant } from '../types';
import { Plus, Trash2, User, Phone, Calendar, Bell, BellRing, Edit } from 'lucide-react';

interface TenantManagerProps {
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
}

export const TenantManager: React.FC<TenantManagerProps> = ({ tenants, setTenants }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: '',
    phone: '',
    nationalId: '',
    startDate: '',
    endDate: '',
    rentDay: 1
  });

  const handleSaveTenant = () => {
    if (!formData.name || !formData.phone) return;

    if (editingId) {
      // Update existing
      setTenants(tenants.map(t => t.id === editingId ? { ...t, ...formData } as Tenant : t));
    } else {
      // Add new
      const newTenant: Tenant = {
        id: Date.now().toString(),
        name: formData.name!,
        phone: formData.phone!,
        nationalId: formData.nationalId || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        rentDay: formData.rentDay || 1
      };
      setTenants([...tenants, newTenant]);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData(tenant);
    setEditingId(tenant.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این مستاجر اطمینان دارید؟')) {
      setTenants(tenants.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', nationalId: '', startDate: '', endDate: '', rentDay: 1 });
    setEditingId(null);
  };

  const sendReminder = (id: string, name: string) => {
    // In a real app, this would trigger a backend email/SMS service
    setNotificationSent(id);
    setTimeout(() => setNotificationSent(null), 3000);
    alert(`یادآوری پرداخت اجاره برای ${name} ارسال شد.`);
  };

  const isRentDueSoon = (day: number) => {
    const today = new Date().getDate();
    // Simple logic: if we are within 5 days before the due date
    return day - today <= 5 && day - today >= 0;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت مستاجرین</h2>
          <p className="text-gray-500 mt-1">ثبت اطلاعات و مدیریت قراردادها و یادآوری‌ها</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
        >
          <Plus size={18} />
          <span>افزودن مستاجر</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map(tenant => (
          <div key={tenant.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{tenant.name}</h3>
                    <p className="text-xs text-gray-500">{tenant.nationalId || 'کد ملی نامشخص'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(tenant)} className="text-gray-400 hover:text-primary-600 p-1">
                    <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(tenant.id)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>قرارداد: {tenant.startDate} تا {tenant.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Bell size={14} className="text-gray-400" />
                    <span>روز سررسید اجاره: <span className="font-bold text-gray-800">{tenant.rentDay}م هر ماه</span></span>
                </div>
            </div>

            <button 
                onClick={() => sendReminder(tenant.id, tenant.name)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    notificationSent === tenant.id 
                    ? 'bg-green-100 text-green-700' 
                    : isRentDueSoon(tenant.rentDay || 1) 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 animate-pulse'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
                {notificationSent === tenant.id ? (
                    <>یادآوری ارسال شد</>
                ) : (
                    <>
                       <BellRing size={16} />
                       ارسال یادآوری پرداخت
                    </>
                )}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'ویرایش اطلاعات' : 'ثبت مستاجر جدید'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.nationalId}
                        onChange={e => setFormData({...formData, nationalId: e.target.value})}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">روز سررسید اجاره</label>
                     <input 
                        type="number" 
                        min="1" max="31"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        placeholder="مثلا 1"
                        value={formData.rentDay}
                        onChange={e => setFormData({...formData, rentDay: Number(e.target.value)})}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ شروع قرارداد</label>
                    <input 
                        type="text" 
                        placeholder="1402/01/01"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ پایان قرارداد</label>
                    <input 
                        type="text" 
                        placeholder="1403/01/01"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
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
                onClick={handleSaveTenant}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                ذخیره اطلاعات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};