import React from 'react';
import { Unit, Invoice, MaintenanceRecord } from '../types';
import {  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Wallet, AlertCircle, Wrench, PiggyBank } from 'lucide-react';

interface DashboardProps {
  units: Unit[];
  invoices: Invoice[];
  maintenanceRecords: MaintenanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ units, invoices, maintenanceRecords }) => {
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'پر').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const totalRevenue = invoices
    .filter(i => i.isPaid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = invoices
    .filter(i => !i.isPaid)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpenses = maintenanceRecords.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Chart Data: Revenue by Month (Mock logic for demo)
  const chartData = [
    { name: 'فروردین', income: totalRevenue * 0.1 },
    { name: 'اردیبهشت', income: totalRevenue * 0.15 },
    { name: 'خرداد', income: totalRevenue * 0.12 },
    { name: 'تیر', income: totalRevenue * 0.2 },
    { name: 'مرداد', income: totalRevenue * 0.18 },
    { name: 'شهریور', income: totalRevenue * 0.25 },
  ];

  const stats = [
    { label: 'درآمد کل', value: `${totalRevenue.toLocaleString()} تومان`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'هزینه‌ها', value: `${totalExpenses.toLocaleString()} تومان`, icon: Wrench, color: 'bg-red-500' },
    { label: 'سود خالص', value: `${netProfit.toLocaleString()} تومان`, icon: PiggyBank, color: 'bg-emerald-600' },
    { label: 'نرخ اشغال', value: `${occupancyRate}%`, icon: Users, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">داشبورد مدیریتی</h2>
        <p className="text-gray-500 mt-1">خلاصه وضعیت ساختمان، درآمد و هزینه‌ها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
            <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-${stat.color}/30`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">نمودار درآمد ۶ ماهه</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="income" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#0284c7'} />
                          ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4">آخرین فاکتورها</h3>
            <div className="space-y-4 flex-1">
                {invoices.slice(0, 4).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-bold text-gray-700">{inv.tenantName}</p>
                            <p className="text-xs text-gray-400">{inv.date}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-primary-600">{inv.amount.toLocaleString()}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {inv.isPaid ? 'پرداخت' : 'معوق'}
                            </span>
                        </div>
                    </div>
                ))}
                {invoices.length === 0 && <p className="text-center text-gray-400 text-sm">داده‌ای موجود نیست</p>}
            </div>
        </div>
      </div>
    </div>
  );
};