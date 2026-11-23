'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  StockMutation,
  CashTransaction,
  DirectLabor,
  OverheadCost,
  OfficeExpense,
  CoffeeVariant,
} from '@/types';
import {
  INITIAL_STOCK_DATA,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_TKL_DATA,
  INITIAL_OVERHEAD_DATA,
  INITIAL_OFFICE_EXPENSES,
  INITIAL_VARIANTS,
} from '@/data/seedData';
import {
  calculateAccountingSummary,
  recalculateStockWeightedAverage,
  calculateRunningBalances,
} from '@/lib/calculations';

interface RoastBookContextType {
  // State
  businessName: string;
  businessTagline: string;
  businessSubtitle: string;
  logoUrl: string;
  stockMutations: StockMutation[];
  cashTransactions: CashTransaction[];
  directLabors: DirectLabor[];
  overheads: OverheadCost[];
  officeExpenses: OfficeExpense[];
  variants: CoffeeVariant[];
  selectedMonth: string;
  targetMargin: number;
  actualPricePerKg: number;
  isManualHpp: boolean;
  manualHppPerKg: number;
  isLoaded: boolean;

  // Actions
  updateBusinessInfo: (name: string, tagline: string, subtitle: string) => void;
  resetBusinessInfo: () => void;
  updateLogoUrl: (url: string) => void;
  resetLogoUrl: () => void;
  setIsManualHpp: (val: boolean) => void;
  setManualHppPerKg: (val: number) => void;
  setSelectedMonth: (month: string) => void;
  setTargetMargin: (val: number) => void;
  setActualPricePerKg: (val: number) => void;
  addStockMutation: (
    data: Omit<StockMutation, 'id' | 'balanceKg' | 'balanceValue' | 'avgHppPerKg' | 'outCostPerKg' | 'outTotalCost' | 'syncedToCash'>,
    syncToCash: boolean
  ) => void;
  deleteStockMutation: (id: string) => void;
  addCashTransaction: (data: Omit<CashTransaction, 'id' | 'runningBalance'>) => void;
  deleteCashTransaction: (id: string) => void;
  addDirectLabor: (data: Omit<DirectLabor, 'id' | 'total'>) => void;
  updateDirectLabor: (item: DirectLabor) => void;
  deleteDirectLabor: (id: string) => void;
  addOverheadCost: (data: Omit<OverheadCost, 'id'>) => void;
  updateOverheadCost: (item: OverheadCost) => void;
  deleteOverheadCost: (id: string) => void;
  syncTklAndOverheadToCash: () => { tklSynced: boolean; ovhSynced: boolean; message: string };
  resetToDefaultData: () => void;
  resetToZeroData: () => void;

  // Summary
  summary: ReturnType<typeof calculateAccountingSummary>;
}

const RoastBookContext = createContext<RoastBookContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BIZ_NAME: 'roastbook_biz_name_v1',
  BIZ_TAGLINE: 'roastbook_biz_tagline_v1',
  BIZ_SUBTITLE: 'roastbook_biz_subtitle_v1',
  LOGO: 'roastbook_logo_url_v1',
  STOCK: 'roastbook_stock_v1',
  CASH: 'roastbook_cash_v1',
  TKL: 'roastbook_tkl_v1',
  OVERHEAD: 'roastbook_overhead_v1',
  EXPENSES: 'roastbook_expenses_v1',
  MARGIN: 'roastbook_margin_v1',
  PRICE: 'roastbook_price_v1',
  IS_MANUAL_HPP: 'roastbook_is_manual_hpp_v1',
  MANUAL_HPP: 'roastbook_manual_hpp_v1',
};

const DEFAULT_BIZ_NAME = 'RoastBook';
const DEFAULT_BIZ_TAGLINE = 'POS & Accounting';
const DEFAULT_BIZ_SUBTITLE = 'Sistem Pembukuan & HPP Otomatis • UMKM Jual Beli Biji Kopi Sangrai';
const DEFAULT_LOGO_URL = '/logo.png';

export const RoastBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessName, setBusinessName] = useState<string>(DEFAULT_BIZ_NAME);
  const [businessTagline, setBusinessTagline] = useState<string>(DEFAULT_BIZ_TAGLINE);
  const [businessSubtitle, setBusinessSubtitle] = useState<string>(DEFAULT_BIZ_SUBTITLE);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);

  const [stockMutations, setStockMutations] = useState<StockMutation[]>(INITIAL_STOCK_DATA);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(INITIAL_CASH_TRANSACTIONS);
  const [directLabors, setDirectLabors] = useState<DirectLabor[]>(INITIAL_TKL_DATA);
  const [overheads, setOverheads] = useState<OverheadCost[]>(INITIAL_OVERHEAD_DATA);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>(INITIAL_OFFICE_EXPENSES);
  const [variants] = useState<CoffeeVariant[]>(INITIAL_VARIANTS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [targetMargin, setTargetMargin] = useState<number>(30); // 30%
  const [actualPricePerKg, setActualPricePerKg] = useState<number>(206538); // Weighted avg actual price
  const [isManualHpp, setIsManualHpp] = useState<boolean>(false);
  const [manualHppPerKg, setManualHppPerKg] = useState<number>(153000);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedBizName = localStorage.getItem(STORAGE_KEYS.BIZ_NAME);
      const savedBizTagline = localStorage.getItem(STORAGE_KEYS.BIZ_TAGLINE);
      const savedBizSubtitle = localStorage.getItem(STORAGE_KEYS.BIZ_SUBTITLE);

      if (savedBizName) setBusinessName(savedBizName);
      if (savedBizTagline) setBusinessTagline(savedBizTagline);
      if (savedBizSubtitle) setBusinessSubtitle(savedBizSubtitle);

      const savedLogo = localStorage.getItem(STORAGE_KEYS.LOGO);
      if (savedLogo) setLogoUrl(savedLogo);

      const savedStock = localStorage.getItem(STORAGE_KEYS.STOCK);
      const savedCash = localStorage.getItem(STORAGE_KEYS.CASH);
      const savedTkl = localStorage.getItem(STORAGE_KEYS.TKL);
      const savedOvh = localStorage.getItem(STORAGE_KEYS.OVERHEAD);
      const savedExp = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const savedMargin = localStorage.getItem(STORAGE_KEYS.MARGIN);
      const savedPrice = localStorage.getItem(STORAGE_KEYS.PRICE);
      const savedIsManualHpp = localStorage.getItem(STORAGE_KEYS.IS_MANUAL_HPP);
      const savedManualHpp = localStorage.getItem(STORAGE_KEYS.MANUAL_HPP);

      if (savedStock) setStockMutations(JSON.parse(savedStock));
      if (savedCash) setCashTransactions(JSON.parse(savedCash));
      if (savedTkl) setDirectLabors(JSON.parse(savedTkl));
      if (savedOvh) setOverheads(JSON.parse(savedOvh));
      if (savedExp) setOfficeExpenses(JSON.parse(savedExp));
      if (savedMargin) setTargetMargin(Number(savedMargin));
      if (savedPrice) setActualPricePerKg(Number(savedPrice));
      if (savedIsManualHpp !== null) setIsManualHpp(savedIsManualHpp === 'true');
      if (savedManualHpp) setManualHppPerKg(Number(savedManualHpp));
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BIZ_NAME, businessName);
      localStorage.setItem(STORAGE_KEYS.BIZ_TAGLINE, businessTagline);
      localStorage.setItem(STORAGE_KEYS.BIZ_SUBTITLE, businessSubtitle);
      localStorage.setItem(STORAGE_KEYS.LOGO, logoUrl);

      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stockMutations));
      localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(cashTransactions));
      localStorage.setItem(STORAGE_KEYS.TKL, JSON.stringify(directLabors));
      localStorage.setItem(STORAGE_KEYS.OVERHEAD, JSON.stringify(overheads));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(officeExpenses));
      localStorage.setItem(STORAGE_KEYS.MARGIN, targetMargin.toString());
      localStorage.setItem(STORAGE_KEYS.PRICE, actualPricePerKg.toString());
      localStorage.setItem(STORAGE_KEYS.IS_MANUAL_HPP, isManualHpp.toString());
      localStorage.setItem(STORAGE_KEYS.MANUAL_HPP, manualHppPerKg.toString());
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    businessName,
    businessTagline,
    businessSubtitle,
    logoUrl,
    stockMutations,
    cashTransactions,
    directLabors,
    overheads,
    officeExpenses,
    targetMargin,
    actualPricePerKg,
    isManualHpp,
    manualHppPerKg,
    isLoaded,
  ]);

  const updateBusinessInfo = (name: string, tagline: string, subtitle: string) => {
    setBusinessName(name.trim() || DEFAULT_BIZ_NAME);
    setBusinessTagline(tagline.trim() || DEFAULT_BIZ_TAGLINE);
    setBusinessSubtitle(subtitle.trim() || DEFAULT_BIZ_SUBTITLE);
  };

  const resetBusinessInfo = () => {
    setBusinessName(DEFAULT_BIZ_NAME);
    setBusinessTagline(DEFAULT_BIZ_TAGLINE);
    setBusinessSubtitle(DEFAULT_BIZ_SUBTITLE);
    localStorage.removeItem(STORAGE_KEYS.BIZ_NAME);
    localStorage.removeItem(STORAGE_KEYS.BIZ_TAGLINE);
    localStorage.removeItem(STORAGE_KEYS.BIZ_SUBTITLE);
  };

  const updateLogoUrl = (url: string) => {
    const cleanUrl = url.trim() || DEFAULT_LOGO_URL;
    setLogoUrl(cleanUrl);
    try {
      localStorage.setItem(STORAGE_KEYS.LOGO, cleanUrl);
    } catch (e) {
      console.warn('Failed to save logoUrl to localStorage:', e);
    }
  };

  const resetLogoUrl = () => {
    setLogoUrl(DEFAULT_LOGO_URL);
    localStorage.removeItem(STORAGE_KEYS.LOGO);
  };

  // Recalculate accounting summary
  const summary = useMemo(() => {
    return calculateAccountingSummary(
      stockMutations,
      directLabors,
      overheads,
      cashTransactions,
      officeExpenses,
      isManualHpp,
      manualHppPerKg
    );
  }, [stockMutations, directLabors, overheads, cashTransactions, officeExpenses, isManualHpp, manualHppPerKg]);

  // Add Stock Mutation with Weighted Average and optional Cashbook sync
  const addStockMutation = (
    data: Omit<StockMutation, 'id' | 'balanceKg' | 'balanceValue' | 'avgHppPerKg' | 'outCostPerKg' | 'outTotalCost' | 'syncedToCash'>,
    syncToCash: boolean
  ) => {
    const newId = `STK-${Date.now().toString().slice(-4)}`;
    const rawList = [...stockMutations, { ...data, id: newId, syncedToCash: syncToCash }];
    const recalculated = recalculateStockWeightedAverage(rawList);
    setStockMutations(recalculated);

    // If syncToCash is selected:
    if (syncToCash) {
      if (data.type === 'IN') {
        const cashAmount = data.inKg * data.buyPricePerKg;
        const newCashTx: CashTransaction = {
          id: `CSH-${Date.now().toString().slice(-4)}`,
          date: data.date,
          evidenceNo: data.evidenceNo,
          description: `Pembelian ${data.inKg} Kg ${data.variant} (${data.customerOrVendor || 'Supplier'})`,
          category: 'Pembelian Roasted Bean',
          type: 'OUT',
          amount: cashAmount,
          source: 'stock_sync',
        };
        const updatedCash = calculateRunningBalances([...cashTransactions, newCashTx]);
        setCashTransactions(updatedCash);
      } else if (data.type === 'OUT') {
        const sellingPrice = data.sellingPricePerKg || 0;
        const cashAmount = data.outKg * sellingPrice;
        if (cashAmount > 0) {
          const newCashTx: CashTransaction = {
            id: `CSH-${Date.now().toString().slice(-4)}`,
            date: data.date,
            evidenceNo: data.evidenceNo,
            description: `Penjualan ${data.outKg} Kg ${data.variant} (${data.customerOrVendor || 'Customer'})`,
            category: 'Penjualan Roasted Bean',
            type: 'IN',
            amount: cashAmount,
            source: 'stock_sync',
          };
          const updatedCash = calculateRunningBalances([...cashTransactions, newCashTx]);
          setCashTransactions(updatedCash);
        }
      }
    }
  };

  const deleteStockMutation = (id: string) => {
    const filtered = stockMutations.filter((s) => s.id !== id);
    const recalculated = recalculateStockWeightedAverage(filtered);
    setStockMutations(recalculated);
  };

  // Cash Transaction actions
  const addCashTransaction = (data: Omit<CashTransaction, 'id' | 'runningBalance'>) => {
    const newTx: CashTransaction = {
      ...data,
      id: `CSH-${Date.now().toString().slice(-4)}`,
    };
    const updated = calculateRunningBalances([...cashTransactions, newTx]);
    setCashTransactions(updated);
  };

  const deleteCashTransaction = (id: string) => {
    const filtered = cashTransactions.filter((c) => c.id !== id);
    const updated = calculateRunningBalances(filtered);
    setCashTransactions(updated);
  };

  // TKL actions
  const addDirectLabor = (data: Omit<DirectLabor, 'id' | 'total'>) => {
    const total = data.headcount * (data.monthlyWage + data.allowanceOvertime);
    const newItem: DirectLabor = {
      ...data,
      id: `TKL-${Date.now().toString().slice(-4)}`,
      total,
    };
    setDirectLabors([...directLabors, newItem]);
  };

  const updateDirectLabor = (item: DirectLabor) => {
    const total = item.headcount * (item.monthlyWage + item.allowanceOvertime);
    setDirectLabors(
      directLabors.map((t) => (t.id === item.id ? { ...item, total } : t))
    );
  };

  const deleteDirectLabor = (id: string) => {
    setDirectLabors(directLabors.filter((t) => t.id !== id));
  };

  // Overhead actions
  const addOverheadCost = (data: Omit<OverheadCost, 'id'>) => {
    const newItem: OverheadCost = {
      ...data,
      id: `OVH-${Date.now().toString().slice(-4)}`,
    };
    setOverheads([...overheads, newItem]);
  };

  const updateOverheadCost = (item: OverheadCost) => {
    setOverheads(overheads.map((o) => (o.id === item.id ? item : o)));
  };

  const deleteOverheadCost = (id: string) => {
    setOverheads(overheads.filter((o) => o.id !== id));
  };

  // Quick Sync: Sinkronkan TKL & Overhead bulan ini ke Buku Kas
  const syncTklAndOverheadToCash = () => {
    const totalTkl = directLabors.reduce((acc, cur) => acc + cur.total, 0);
    const totalOverhead = overheads.reduce((acc, cur) => acc + (cur.amount * (cur.portionPercent / 100)), 0);

    const todayDate = new Date().toISOString().split('T')[0];
    const newTransactions: CashTransaction[] = [];
    let tklSynced = false;
    let ovhSynced = false;

    // Check if TKL already has a sync entry for current month
    const existingTkl = cashTransactions.find(
      (c) => c.category === 'Tenaga Packing & QC' && c.source === 'tkl_sync'
    );
    if (!existingTkl && totalTkl > 0) {
      newTransactions.push({
        id: `CSH-TKL-${Date.now().toString().slice(-4)}`,
        date: todayDate,
        evidenceNo: `BKK-TKL-${Date.now().toString().slice(-3)}`,
        description: `Beban Total Upah & Tunjangan Tenaga Packing/QC (${directLabors.length} Posisi)`,
        category: 'Tenaga Packing & QC',
        type: 'OUT',
        amount: totalTkl,
        source: 'tkl_sync',
      });
      tklSynced = true;
    }

    // Check if Overhead already has a sync entry
    const existingOvh = cashTransactions.find(
      (c) => c.category === 'Overhead Kemasan & Gudang' && c.source === 'overhead_sync'
    );
    if (!existingOvh && totalOverhead > 0) {
      newTransactions.push({
        id: `CSH-OVH-${Date.now().toString().slice(-4)}`,
        date: todayDate,
        evidenceNo: `BKK-OVH-${Date.now().toString().slice(-3)}`,
        description: `Beban Total Overhead Kemasan, Listrik, Sewa & Gudang (${overheads.length} Komponen)`,
        category: 'Overhead Kemasan & Gudang',
        type: 'OUT',
        amount: totalOverhead,
        source: 'overhead_sync',
      });
      ovhSynced = true;
    }

    if (newTransactions.length > 0) {
      const updated = calculateRunningBalances([...cashTransactions, ...newTransactions]);
      setCashTransactions(updated);
      return {
        tklSynced,
        ovhSynced,
        message: `Berhasil mencatat ${newTransactions.length} transaksi beban ke Buku Kas Umum.`,
      };
    } else {
      return {
        tklSynced: false,
        ovhSynced: false,
        message: 'Beban TKL dan Overhead bulan ini sudah tercatat sebelumnya di Buku Kas Umum.',
      };
    }
  };

  const resetToDefaultData = () => {
    setStockMutations(INITIAL_STOCK_DATA);
    setCashTransactions(INITIAL_CASH_TRANSACTIONS);
    setDirectLabors(INITIAL_TKL_DATA);
    setOverheads(INITIAL_OVERHEAD_DATA);
    setOfficeExpenses(INITIAL_OFFICE_EXPENSES);
    setTargetMargin(30);
    setActualPricePerKg(206538);
    setIsManualHpp(false);
    setManualHppPerKg(153000);
    resetBusinessInfo();
    resetLogoUrl();
    localStorage.clear();
  };

  // Reset Pembukuan Mulai Dari Nol (Blank fresh state for real UMKM operation)
  const resetToZeroData = () => {
    setStockMutations([]);
    setCashTransactions([]);
    setDirectLabors([]);
    setOverheads([]);
    setOfficeExpenses([]);
    setTargetMargin(30);
    setActualPricePerKg(0);
    setIsManualHpp(false);
    setManualHppPerKg(0);

    try {
      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TKL, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.OVERHEAD, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MARGIN, '30');
      localStorage.setItem(STORAGE_KEYS.PRICE, '0');
      localStorage.setItem(STORAGE_KEYS.IS_MANUAL_HPP, 'false');
      localStorage.setItem(STORAGE_KEYS.MANUAL_HPP, '0');
    } catch (e) {
      console.warn('Failed to clear data in localStorage:', e);
    }
  };

  return (
    <RoastBookContext.Provider
      value={{
        businessName,
        businessTagline,
        businessSubtitle,
        logoUrl,
        updateBusinessInfo,
        resetBusinessInfo,
        updateLogoUrl,
        resetLogoUrl,
        stockMutations,
        cashTransactions,
        directLabors,
        overheads,
        officeExpenses,
        variants,
        selectedMonth,
        targetMargin,
        actualPricePerKg,
        isManualHpp,
        manualHppPerKg,
        isLoaded,
        setIsManualHpp,
        setManualHppPerKg,
        setSelectedMonth,
        setTargetMargin,
        setActualPricePerKg,
        addStockMutation,
        deleteStockMutation,
        addCashTransaction,
        deleteCashTransaction,
        addDirectLabor,
        updateDirectLabor,
        deleteDirectLabor,
        addOverheadCost,
        updateOverheadCost,
        deleteOverheadCost,
        syncTklAndOverheadToCash,
        resetToDefaultData,
        resetToZeroData,
        summary,
      }}
    >
      {children}
    </RoastBookContext.Provider>
  );
};

export const useRoastBook = () => {
  const context = useContext(RoastBookContext);
  if (!context) {
    throw new Error('useRoastBook must be used within a RoastBookProvider');
  }
  return context;
};
