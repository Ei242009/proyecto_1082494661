export interface AddExpenseRequest {
  category: string;
  amount: number;
  description: string;
}

export interface Expense {
  id: string;
  shift_id: string;
  category: string;
  amount: number;
  description: string;
  status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ExpenseWithShift {
  id: string;
  shift_id: string;
  shift_date: string;
  conductor_name: string;
  category: string;
  amount: number;
  description: string;
  status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  rejection_reason: string | null;
  created_at: string;
}

export interface ReceiptData {
  shiftId: string;
  conductor_name: string;
  closed_by_name: string;
  closed_at: string;
  gross_income: number;
  daily_fee_snapshot: number;
  base_post_fee: number;
  approved_expenses: Array<{
    category: string;
    amount: number;
    description: string;
    time: string;
  }>;
  net_income: number;
}

export interface DashboardData {
  totalGrossIncome: number;
  totalDailyFee: number;
  totalApprovedExpenses: number;
  netIncome: number;
  closedShiftsCount: number;
  pendingExpensesCount: number;
}

export interface AuditShiftRow {
  date: string;
  conductor_name: string;
  gross_income: number;
  daily_fee_snapshot: number;
  status: 'ABIERTO' | 'CERRADO';
}
