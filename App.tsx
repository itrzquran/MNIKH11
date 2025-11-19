import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UnitManager } from './components/UnitManager';
import { InvoiceManager } from './components/InvoiceManager';
import { AIAssistant } from './components/AIAssistant';
import { TenantManager } from './components/TenantManager';
import { MaintenanceManager } from './components/MaintenanceManager';
import { PageView, Unit, Tenant, Invoice, UnitStatus, MaintenanceRecord } from './types';
import { Menu } from 'lucide-react';

// Mock initial data
const MOCK_UNITS: Unit[] = [
  { id: '1', number: '101', floor: 1, area: 75, baseRent: 8000000, status: UnitStatus.OCCUPIED, tenantId: 't1' },
  { id: '2', number: '102', floor: 1, area: 80, baseRent: 8500000, status: UnitStatus.VACANT },
  { id: '3', number: '201', floor: 2, area: 90, baseRent: 9500000, status: UnitStatus.OCCUPIED, tenantId: 't2' },
];

const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'علی محمدی', phone: '09120000000', nationalId: '0011111111', startDate: '1402/01/01', endDate: '1403/01/01', rentDay: 1 },
  { id: 't2', name: 'زهرا رضایی', phone: '09120000001', nationalId: '0022222222', startDate: '1402/05/01', endDate: '1403/05/01', rentDay: 5 },
];

const MOCK_INVOICES: Invoice[] = [
    { id: 'i1', unitId: '1', tenantName: 'علی محمدی', tenantId: 't1', amount: 8000000, date: '1402/10/01', dueDate: '1402/10/05', isPaid: true, type: 'RENT', description: '' },
    { id: 'i2', unitId: '3', tenantName: 'زهرا رضایی', tenantId: 't2', amount: 9500000, date: '1402/10/01', dueDate: '1402/10/05', isPaid: false, type: 'RENT', description: '' },
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
    { id: 'm1', date: '1402/10/15', description: 'تعمیر موتورخانه', amount: 2500000, supplier: 'تاسیسات مرکزی' },
    { id: 'm2', date: '1402/11/02', description: 'تعویض لامپ‌های لابی', amount: 500000, supplier: 'الکتریکی پارس' },
];

function App() {
  const [page, setPage] = useState<PageView>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [units, setUnits] = useState<Unit[]>(() => {
      const saved = localStorage.getItem('homa_units');
      return saved ? JSON.parse(saved) : MOCK_UNITS;
  });
  const [tenants, setTenants] = useState<Tenant[]>(() => {
      const saved = localStorage.getItem('homa_tenants');
      return saved ? JSON.parse(saved) : MOCK_TENANTS;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
      const saved = localStorage.getItem('homa_invoices');
      return saved ? JSON.parse(saved) : MOCK_INVOICES;
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
      const saved = localStorage.getItem('homa_maintenance');
      return saved ? JSON.parse(saved) : MOCK_MAINTENANCE;
  });

  // Persistence
  useEffect(() => { localStorage.setItem('homa_units', JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem('homa_tenants', JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { localStorage.setItem('homa_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('homa_maintenance', JSON.stringify(maintenanceRecords)); }, [maintenanceRecords]);

  const renderPage = () => {
    switch (page) {
      case 'DASHBOARD':
        return <Dashboard units={units} invoices={invoices} maintenanceRecords={maintenanceRecords} />;
      case 'UNITS':
        return <UnitManager units={units} setUnits={setUnits} tenants={tenants} setTenants={setTenants} />;
      case 'TENANTS':
        return <TenantManager tenants={tenants} setTenants={setTenants} />;
      case 'INVOICES':
        return <InvoiceManager invoices={invoices} setInvoices={setInvoices} units={units} tenants={tenants} />;
      case 'MAINTENANCE':
        return <MaintenanceManager records={maintenanceRecords} setRecords={setMaintenanceRecords} />;
      case 'REPORTS':
        return <InvoiceManager invoices={invoices} setInvoices={setInvoices} units={units} tenants={tenants} />;
      case 'AI_ASSISTANT':
        return <AIAssistant invoices={invoices} units={units} />;
      default:
        return <Dashboard units={units} invoices={invoices} maintenanceRecords={maintenanceRecords} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 right-0 w-64 z-30 transform transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <Sidebar currentPage={page} onNavigate={(p) => { setPage(p); setSidebarOpen(false); }} />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar currentPage={page} onNavigate={setPage} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar for Mobile */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200 shadow-sm z-10">
          <span className="font-bold text-lg">مدیریت هما</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
            <Menu />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;