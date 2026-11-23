export type CashCategory =
  | 'Saldo Awal'
  | 'Penjualan Roasted Bean'
  | 'Pembelian Roasted Bean'
  | 'Tenaga Packing & QC'
  | 'Overhead Kemasan & Gudang'
  | 'Pemasaran & Sampel'
  | 'Gaji & Umum Kantor'
  | 'Lain-lain';

export interface CashTransaction {
  id: string;
  date: string;
  evidenceNo: string;
  description: string;
  category: CashCategory;
  type: 'IN' | 'OUT';
  amount: number;
  runningBalance?: number;
  source?: 'manual' | 'stock_sync' | 'tkl_sync' | 'overhead_sync';
}

export interface StockMutation {
  id: string;
  date: string;
  evidenceNo: string;
  variant: string;
  roastProfile?: string;
  type: 'IN' | 'OUT';
  // If IN (Kulak)
  inKg: number;
  buyPricePerKg: number;
  inTotal: number;
  // If OUT (Penjualan)
  outKg: number;
  sellingPricePerKg?: number; // Selling price to customer
  revenueTotal?: number;      // outKg * sellingPricePerKg
  outCostPerKg: number;       // Weighted average cost at this point
  outTotalCost: number;       // outKg * outCostPerKg
  // Balance
  balanceKg: number;
  balanceValue: number;
  avgHppPerKg: number;
  // Metadata
  customerOrVendor?: string;
  notes?: string;
  syncedToCash: boolean;
}

export interface DirectLabor {
  id: string;
  role: string;
  headcount: number;
  monthlyWage: number;
  allowanceOvertime: number;
  total: number;
}

export type OverheadCategory = 'Tetap' | 'Variabel' | 'Semi-Variabel';

export interface OverheadCost {
  id: string;
  name: string;
  category: OverheadCategory;
  amount: number;
  portionPercent: number; // e.g. 100%
  description?: string;
}

export interface OfficeExpense {
  id: string;
  category: 'Pemasaran & Sampel' | 'Gaji & Umum Kantor' | 'Operasional Kantor';
  description: string;
  amount: number;
  date: string;
}

export interface CoffeeVariant {
  id: string;
  name: string;
  roastProfile: string;
  origin: string;
  defaultPricePerKg: number;
}
