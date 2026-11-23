import {
  StockMutation,
  DirectLabor,
  OverheadCost,
  CashTransaction,
  OfficeExpense,
} from '@/types';

/**
 * Recomputes running balance for cash transactions
 */
export function calculateRunningBalances(
  transactions: CashTransaction[]
): CashTransaction[] {
  let running = 0;
  return transactions.map((t) => {
    if (t.type === 'IN') {
      running += t.amount;
    } else {
      running -= t.amount;
    }
    return {
      ...t,
      runningBalance: running,
    };
  });
}

/**
 * Weighted Average Calculation for Stock Mutations
 * Rule:
 * - IN (Pembelian):
 *   newBalanceKg = prevBalanceKg + inKg
 *   newBalanceVal = prevBalanceVal + (inKg * buyPricePerKg)
 *   newAvgHpp = newBalanceVal / newBalanceKg
 * - OUT (Penjualan):
 *   unitCost = prevAvgHpp
 *   totalCost = outKg * unitCost
 *   newBalanceKg = prevBalanceKg - outKg
 *   newBalanceVal = prevBalanceVal - totalCost
 *   newAvgHpp = prevAvgHpp
 */
export function recalculateStockWeightedAverage(
  mutations: Omit<StockMutation, 'balanceKg' | 'balanceValue' | 'avgHppPerKg' | 'outCostPerKg' | 'outTotalCost'>[]
): StockMutation[] {
  let prevBalanceKg = 0;
  let prevBalanceVal = 0;
  let prevAvgHpp = 0;

  return mutations.map((item) => {
    if (item.type === 'IN') {
      const inTotal = item.inKg * item.buyPricePerKg;
      const balanceKg = prevBalanceKg + item.inKg;
      const balanceValue = prevBalanceVal + inTotal;
      const avgHppPerKg = balanceKg > 0 ? balanceValue / balanceKg : 0;

      prevBalanceKg = balanceKg;
      prevBalanceVal = balanceValue;
      prevAvgHpp = avgHppPerKg;

      return {
        ...item,
        inTotal,
        outKg: 0,
        outCostPerKg: 0,
        outTotalCost: 0,
        balanceKg,
        balanceValue,
        avgHppPerKg,
      };
    } else {
      // OUT (Penjualan)
      const outCostPerKg = prevAvgHpp;
      const outTotalCost = item.outKg * outCostPerKg;
      const balanceKg = Math.max(0, prevBalanceKg - item.outKg);
      const balanceValue = Math.max(0, prevBalanceVal - outTotalCost);
      const avgHppPerKg = balanceKg > 0 ? balanceValue / balanceKg : prevAvgHpp;

      prevBalanceKg = balanceKg;
      prevBalanceVal = balanceValue;
      prevAvgHpp = avgHppPerKg;

      const revenueTotal = item.sellingPricePerKg ? item.outKg * item.sellingPricePerKg : 0;

      return {
        ...item,
        inKg: 0,
        buyPricePerKg: 0,
        inTotal: 0,
        outCostPerKg,
        outTotalCost,
        revenueTotal,
        balanceKg,
        balanceValue,
        avgHppPerKg,
      };
    }
  });
}

/**
 * Calculates HPP and Laba Rugi summaries from current state
 */
export function calculateAccountingSummary(
  stockMutations: StockMutation[],
  directLabors: DirectLabor[],
  overheads: OverheadCost[],
  cashTransactions: CashTransaction[],
  officeExpenses: OfficeExpense[],
  isManualHpp: boolean = false,
  manualHppPerKg: number = 0
) {
  // 1. Stock Metrics
  const initialStockItem = stockMutations.find((s) => s.evidenceNo.startsWith('OPN')) || stockMutations[0];
  const initialStockKg = initialStockItem ? (initialStockItem.evidenceNo.startsWith('OPN') ? initialStockItem.inKg : 0) : 0;
  const initialStockValue = initialStockItem ? (initialStockItem.evidenceNo.startsWith('OPN') ? initialStockItem.inTotal : 0) : 0;

  let totalPurchasesKg = 0;
  let totalPurchasesValue = 0;
  let totalSoldKg = 0;
  let totalCostOfSoldRawBeans = 0;
  let totalSalesRevenueFromStock = 0;

  stockMutations.forEach((m) => {
    if (m.type === 'IN' && !m.evidenceNo.startsWith('OPN')) {
      totalPurchasesKg += m.inKg;
      totalPurchasesValue += m.inTotal;
    } else if (m.type === 'OUT') {
      totalSoldKg += m.outKg;
      totalCostOfSoldRawBeans += m.outTotalCost;
      if (m.revenueTotal) {
        totalSalesRevenueFromStock += m.revenueTotal;
      }
    }
  });

  const lastStockItem = stockMutations[stockMutations.length - 1];
  const endingStockKg = lastStockItem ? lastStockItem.balanceKg : 0;
  const endingStockValue = lastStockItem ? lastStockItem.balanceValue : 0;
  const endingAvgHppPerKg = lastStockItem ? lastStockItem.avgHppPerKg : 0;

  // 2. Direct Labor (TKL)
  const totalTkl = directLabors.reduce((acc, cur) => acc + cur.total, 0);

  // 3. Overhead Breakdown
  let fixedOverhead = 0;
  let variableOverhead = 0;
  let semiVariableOverhead = 0;

  overheads.forEach((o) => {
    const effectiveAmount = o.amount * (o.portionPercent / 100);
    if (o.category === 'Tetap') fixedOverhead += effectiveAmount;
    else if (o.category === 'Variabel') variableOverhead += effectiveAmount;
    else if (o.category === 'Semi-Variabel') semiVariableOverhead += effectiveAmount;
  });

  const totalOverhead = fixedOverhead + variableOverhead + semiVariableOverhead;

  // 4. HPP Total
  // Formula: Persediaan Awal + Pembelian Bersih - Persediaan Akhir = Harga Pokok Roasted Bean Terjual
  const rawBeanHppSold = initialStockValue + totalPurchasesValue - endingStockValue;
  // Total HPP = Raw Bean Terjual + Total TKL + Total Overhead
  const totalHpp = rawBeanHppSold + totalTkl + totalOverhead;

  // HPP per unit (All-In per Kg)
  const volumeForHpp = totalSoldKg > 0 ? totalSoldKg : (endingStockKg > 0 ? endingStockKg : 1);
  const hppRawPerKg = volumeForHpp > 0 ? rawBeanHppSold / volumeForHpp : 0;
  const hppTklPerKg = volumeForHpp > 0 ? totalTkl / volumeForHpp : 0;
  const hppOverheadPerKg = volumeForHpp > 0 ? totalOverhead / volumeForHpp : 0;
  
  // Auto calculated HPP All-In
  const autoHppAllInPerKg = volumeForHpp > 0 ? totalHpp / volumeForHpp : 0;
  
  // Effective HPP: user manual override if enabled and greater than 0, else auto
  const effectiveHppPerKg = isManualHpp && manualHppPerKg > 0 ? manualHppPerKg : autoHppAllInPerKg;
  const hppAllInPerKg = effectiveHppPerKg;
  const hppPerPouch200g = hppAllInPerKg * 0.2;
  const hppPerPouch250g = hppAllInPerKg * 0.25;
  const hppPerPouch500g = hppAllInPerKg * 0.5;

  // 5. Revenue from Cash Transactions category 'Penjualan Roasted Bean'
  const salesRevenueFromCash = cashTransactions
    .filter((t) => t.category === 'Penjualan Roasted Bean' && t.type === 'IN')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOmzetSales = salesRevenueFromCash > 0 ? salesRevenueFromCash : totalSalesRevenueFromStock;

  // 6. Gross Profit & Margin
  const grossProfit = totalOmzetSales - totalHpp;
  const grossMarginPercent = totalOmzetSales > 0 ? (grossProfit / totalOmzetSales) * 100 : 0;

  // 7. Operating Office Expenses
  const officeExpensesFromCash = cashTransactions
    .filter((t) => (t.category === 'Pemasaran & Sampel' || t.category === 'Gaji & Umum Kantor') && t.type === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOfficeExpenses = officeExpensesFromCash > 0
    ? officeExpensesFromCash
    : officeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Marketing and Admin breakdown
  const marketingExpense = cashTransactions
    .filter((t) => t.category === 'Pemasaran & Sampel' && t.type === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  const adminExpense = cashTransactions
    .filter((t) => t.category === 'Gaji & Umum Kantor' && t.type === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  // 8. Net Operating Profit
  const netProfit = grossProfit - totalOfficeExpenses;
  const netMarginPercent = totalOmzetSales > 0 ? (netProfit / totalOmzetSales) * 100 : 0;

  // 9. Final Cash Balance
  const transactionsWithBal = calculateRunningBalances(cashTransactions);
  const finalCashBalance = transactionsWithBal.length > 0
    ? transactionsWithBal[transactionsWithBal.length - 1].runningBalance || 0
    : 0;

  return {
    // KPI Cards
    totalOmzetSales,
    totalHpp,
    grossProfit,
    grossMarginPercent,
    totalOfficeExpenses,
    marketingExpense,
    adminExpense,
    netProfit,
    netMarginPercent,
    finalCashBalance,
    endingStockValue,
    endingStockKg,
    endingAvgHppPerKg,
    // Stock Breakdown
    initialStockKg,
    initialStockValue,
    totalPurchasesKg,
    totalPurchasesValue,
    totalSoldKg,
    rawBeanHppSold,
    // Cost Breakdown
    totalTkl,
    fixedOverhead,
    variableOverhead,
    semiVariableOverhead,
    totalOverhead,
    // Per Unit Costs
    autoHppAllInPerKg,
    isManualHpp,
    manualHppPerKg,
    hppRawPerKg,
    hppTklPerKg,
    hppOverheadPerKg,
    hppAllInPerKg,
    hppPerPouch200g,
    hppPerPouch250g,
    hppPerPouch500g,
  };
}
