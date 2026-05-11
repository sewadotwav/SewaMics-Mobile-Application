export type AdminRole = 'super_admin' | 'inventory_manager' | 'order_manager';
export type AdminStatus = 'active' | 'inactive';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';
export type ModuleType = 'products' | 'orders' | 'settings' | 'admins';

export interface Admin {
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: Date;
  createdBy: string;
}

export interface ActivityLog {
  logId: string;
  adminId: string;
  adminName: string;
  action: ActionType;
  module: ModuleType;
  targetId: string;
  description: string;
  timestamp: Date;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
}

export interface StoreConfig {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  updatedAt: Date;
}

export interface PaymentMethod {
  name: string;
  isActive: boolean;
  type: string;
}

export interface Settings {
  storeConfig: StoreConfig;
  paymentMethods: PaymentMethod[];
}

export interface SalesReport {
  reportId: string;
  reportType: 'weekly' | 'monthly' | 'annual';
  period: string;
  startDate: Date;
  endDate: Date;
  data: ReportData;
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  ordersByStatus: OrderStatusBreakdown;
  breakdown: PeriodBreakdown[];
  growthRate?: number | null;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface OrderStatusBreakdown {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface PeriodBreakdown {
  period: string;
  revenue: number;
  orders: number;
}
