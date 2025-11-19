export enum UnitStatus {
  OCCUPIED = 'پر',
  VACANT = 'خالی',
  MAINTENANCE = 'تعمیرات'
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  startDate: string;
  endDate: string;
  rentDay?: number; // Day of month rent is due (e.g., 1st, 5th)
}

export interface Unit {
  id: string;
  number: string;
  floor: number;
  area: number; // in square meters
  baseRent: number;
  status: UnitStatus;
  tenantId?: string;
}

export interface Invoice {
  id: string;
  unitId: string;
  tenantName: string;
  tenantId?: string;
  amount: number;
  date: string; // ISO string
  dueDate: string; // ISO string
  description: string;
  isPaid: boolean;
  type: 'RENT' | 'CHARGE' | 'REPAIR' | 'OTHER';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  supplier: string; // Name of repairman or supplier
}

export type PageView = 'DASHBOARD' | 'UNITS' | 'TENANTS' | 'INVOICES' | 'MAINTENANCE' | 'REPORTS' | 'AI_ASSISTANT';