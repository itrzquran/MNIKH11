import React from 'react';
import { LayoutDashboard, Home, FileText, BarChart3, Bot, Building, Users, Wrench } from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'UNITS', label: 'مدیریت واحدها', icon: Home },
    { id: 'TENANTS', label: 'مدیریت مستاجرین', icon: Users },
    { id: 'INVOICES', label: 'صدور فاکتور', icon: FileText },
    { id: 'MAINTENANCE', label: 'هزینه‌ها و تعمیرات', icon: Wrench },
    { id: 'REPORTS', label: 'گزارشات و اکسل', icon: BarChart3 },
    { id: 'AI_ASSISTANT', label: 'دستیار هوشمند', icon: Bot },
  ];

  return (
    <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col h-full shadow-lg z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-primary-600 p-2 rounded-lg text-white">
            <Building size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">مدیریت هما</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4 text-white text-sm">
          <p className="font-bold mb-1">نسخه حرفه‌ای</p>
          <p className="opacity-90 text-xs">اشتراک شما تا ۱۴۰۴/۰۱/۰۱ فعال است.</p>
        </div>
      </div>
    </aside>
  );
};