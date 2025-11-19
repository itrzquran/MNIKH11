import React, { useState } from 'react';
import { Unit, UnitStatus, Tenant } from '../types';
import { Plus, User, Trash2, Edit } from 'lucide-react';

interface UnitManagerProps {
  units: Unit[];
  tenants: Tenant[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
}

export const UnitManager: React.FC<UnitManagerProps> = ({ units, setUnits, tenants, setTenants }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({
    status: UnitStatus.VACANT,
    baseRent: 0,
    area: 0,
    floor: 1
  });

  const handleAddUnit = () => {
    if (!newUnit.number) return;
    const unit: Unit = {
      id: Date.now().toString(),
      number: newUnit.number,
      floor: newUnit.floor || 1,
      area: newUnit.area || 0,
      baseRent: newUnit.baseRent || 0,
      status: newUnit.status as UnitStatus,
    };
    setUnits([...units, unit]);
    setIsModalOpen(false);
    setNewUnit({ status: UnitStatus.VACANT, baseRent: 0, area: 0, floor: 1 });
  };

  const handleDelete = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case UnitStatus.OCCUPIED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case UnitStatus.VACANT: return 'bg-gray-100 text-gray-600 border-gray-200';
      case UnitStatus.MAINTENANCE: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت واحدها</h2>
          <p className="text-gray-500 mt-1">لیست تمامی واحدهای ساختمان و وضعیت سکونت</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
        >
          <Plus size={18} />
          <span>افزودن واحد جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map(unit => (
          <div key={unit.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button onClick={() => handleDelete(unit.id)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md">
                 <Trash2 size={16} />
               </button>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-50 rounded-lg p-3 min-w-[3rem] text-center">
                <span className="block text-xs text-gray-400">واحد</span>
                <span className="text-xl font-bold text-gray-800">{unit.number}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(unit.status)}`}>
                {unit.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                <span>طبقه: {unit.floor}</span>
                <span>متراژ: {unit.area} متر</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>اجاره پایه:</span>
                <span className="font-bold text-gray-800">{unit.baseRent.toLocaleString()} تومان</span>
              </div>
              
              {unit.status === UnitStatus.OCCUPIED && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-primary-600 bg-primary-50 p-2 rounded-lg">
                  <User size={16} />
                  <span className="font-medium">مستاجر: {tenants.find(t => t.id === unit.tenantId)?.name || 'ناشناس'}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">افزودن واحد جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره واحد</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newUnit.number || ''}
                  onChange={e => setNewUnit({...newUnit, number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طبقه</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={newUnit.floor || ''}
                    onChange={e => setNewUnit({...newUnit, floor: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">متراژ</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={newUnit.area || ''}
                    onChange={e => setNewUnit({...newUnit, area: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اجاره پایه (تومان)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newUnit.baseRent || ''}
                  onChange={e => setNewUnit({...newUnit, baseRent: Number(e.target.value)})}
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
                onClick={handleAddUnit}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                ثبت واحد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};