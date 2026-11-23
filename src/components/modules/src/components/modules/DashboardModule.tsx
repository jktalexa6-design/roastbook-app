'use client';

import React, { useRef } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatKg, formatPercent } from '@/lib/formatters';
import {
  DollarSign,
  Package,
  TrendingUp,
  Wallet,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Layers,
  Calendar,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Edit3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const DashboardModule: React.FC = () => {
  const {
    summary,
    selectedMonth,
    setSelectedMonth,
    businessName,
    businessTagline,
    businessSubtitle,
    logoUrl,
    updateLogoUrl,
    stockMutations,
    cashTransactions,
    isManualHpp,
  } = useRoastBook();

  const dashboardLogoFileRef = useRef<HTMLInputElement>(null);

  const handleUploadLogoFromDashboard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 2 MB agar performa cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Pie chart data: Komposisi Struktur HPP
  const hppCompositionData = [
    {
      name: 'Biji Kopi Terjual (Kulak)',
      value: summary.rawBeanHppSold,
      color: '#9A3412', // Warm amber / terracotta
    },
    {
      name: 'Tenaga Kerja Packing/QC',
      value: summary.totalTkl,
      color: '#D97706', // Crema amber
    },
    {
      name: 'Overhead Kemasan & Gudang',
      value: summary.totalOverhead,
      color: '#3E1A0E', // Deep espresso
    },
  ];

  // Bar chart data: Perbandingan Finansial Utama
  const financialComparisonData = [
    {
      name: 'Omzet Penjualan',
      amount: summary.totalOmzetSales,
      fill: '#15803D', // Green 700
    },
    {
      name: 'HPP Total',
      amount: summary.totalHpp,
      fill: '#DC2626', // Red 600
    },
    {
      name: 'Biaya Kantor',
      amount: summary.totalOfficeExpenses,
      fill: '#EA580C', // Orange 600
    },
    {
      name: 'Laba Bersih',
      amount: summary.netProfit,
      fill: summary.netProfit >= 0 ? '#059669' : '#B91C1C',
    },
  ];

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = ((data.value / summary.totalHpp) * 100).toFixed(1);
      return (
        <div className="bg-roast-charcoal text-white p-3 rounded-lg shadow-lg border border-stone-700 text-xs">
          <p className="font-semibold text-stone-200">{data.name}</p>
          <p className="text-amber-400 font-bold mt-1">{formatRupiah(data.value)}</p>
          <p className="text-stone-400 mt-0.5">Porsi: {percent}% dari Total HPP</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-roast-charcoal text-white p-3 rounded-lg shadow-lg border border-stone-700 text-xs">
          <p className="font-semibold text-stone-200">{label}</p>
          <p className="text-amber-300 font-bold mt-1">{formatRupiah(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Brand Identity & Logo Customizer Banner */}
      <div className="bg-white rounded-2xl border border-roast-border shadow-warm-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div
              onClick={() => dashboardLogoFileRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-amber-300 p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-roast-amber cursor-pointer transition-all"
              title="Klik untuk memilih file logo baru"
            >
              <img
                src={logoUrl || '/logo.png'}
                alt={businessName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => dashboardLogoFileRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-roast-amber text-white p-1 rounded-full shadow hover:bg-roast-caramel transition-transform hover:scale-110"
              title="Ganti Logo Aplikasi"
            >
              <Upload className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-roast-charcoal tracking-tight">
                {businessName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                {businessTagline}
              </span>
              {isManualHpp && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400 font-bold">
                  HPP Manual: {formatRupiah(summary.hppAllInPerKg)}/Kg
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {businessSubtitle}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500">
              <span>Mutasi Stok: <strong>{stockMutations.length} entri</strong></span>
              <span>•</span>
              <span>Buku Kas: <strong>{cashTransactions.length} transaksi</strong></span>
              {stockMutations.length === 0 && (
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Data Bersih (Mulai Baru)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={dashboardLogoFileRef}
            accept="image/*"
            onChange={handleUploadLogoFromDashboard}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => dashboardLogoFileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors shadow-sm"
            title="Pilih gambar dari komputer atau HP untuk mengganti logo aplikasi"
          >
            <ImageIcon className="w-3.5 h-3.5 text-roast-amber" />
            <span>Ganti Logo Utama</span>
          </button>
        </div>
      </div>

      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-roast-border">
        <div>
          <h1 className="text-2xl font-bold text-roast-charcoal tracking-tight flex items-center gap-2">
            Dashboard Eksekutif & Laporan Laba Rugi
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-roast-amber border border-amber-300 font-medium">
              Real-time Average Method
            </span>
          </h1>
          <p className="text-sm text-roast-subtle mt-0.5">
            Ringkasan kinerja keuangan, perputaran stok roasted bean, dan kalkulasi profitabilitas otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-roast-border rounded-lg shadow-sm text-xs text-roast-muted">
            <Calendar className="w-3.5 h-3.5 text-roast-amber" />
            <span>Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-medium bg-transparent text-roast-charcoal focus:outline-none cursor-pointer"
            >
              <option value="2026-11">November 2026 (Bulan Berjalan)</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="all">Semua Periode</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Omzet Penjualan */}
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100/60 to-transparent rounded-bl-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>1. Total Omzet Penjualan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-roast-charcoal tracking-tight mt-1">
            {formatRupiah(summary.totalOmzetSales)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-700 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Volume: {formatKg(summary.totalSoldKg)}</span>
          </div>
        </div>

        {/* KPI 2: HPP Total */}
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-bl-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>2. HPP Total Terjual</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-roast-charcoal tracking-tight mt-1">
            {formatRupiah(summary.totalHpp)}
          </div>
          <div className="mt-2 text-xs text-roast-subtle flex items-center justify-between">
            <span>Biji + TKL + Overhead Kemas</span>
            {isManualHpp && (
              <span className="text-[10px] text-amber-900 font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                Manual
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Laba Bersih Operasional */}
        <div className={`p-4 rounded-xl border shadow-warm-sm hover:shadow-warm-md transition-shadow relative overflow-hidden ${
          summary.netProfit >= 0
            ? 'bg-gradient-to-br from-emerald-50/50 via-white to-white border-emerald-200'
            : 'bg-gradient-to-br from-rose-50/50 via-white to-white border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className={summary.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
              3. Laba Bersih Operasional
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              summary.netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-bold tracking-tight mt-1 ${
            summary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatRupiah(summary.netProfit)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 font-semibold">
            {summary.netProfit >= 0 ? (
              <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Profit Margin {formatPercent(summary.netMarginPercent)}
              </span>
            ) : (
              <span className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> Defisit Margin {formatPercent(summary.netMarginPercent)}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Saldo Kas Akhir */}
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100/60 to-transparent rounded-bl-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>4. Saldo Kas & Bank Akhir</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-roast-amber flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-roast-charcoal tracking-tight mt-1">
            {formatRupiah(summary.finalCashBalance)}
          </div>
          <div className="mt-2 text-xs text-roast-subtle">
            Kas Riil di Rekening
          </div>
        </div>

        {/* KPI 5: Total Nilai Aset Stok */}
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-stone-200/60 to-transparent rounded-bl-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>5. Nilai Aset Stok Gudang</span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-roast-charcoal tracking-tight mt-1">
            {formatRupiah(summary.endingStockValue)}
          </div>
          <div className="mt-2 text-xs text-roast-subtle">
            Fisik: {formatKg(summary.endingStockKg)} Tersedia
          </div>
        </div>
      </div>

      {/* Main Grid: Laporan Laba Rugi Otomatis & Panel Posisi Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formal Laporan Laba Rugi (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
          <div className="px-5 py-4 bg-roast-parchment/60 border-b border-roast-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-roast-amber"></div>
              <h2 className="font-bold text-base text-roast-charcoal">
                Laporan Laba Rugi Operasional Otomatis
              </h2>
            </div>
            <span className="text-xs text-roast-subtle bg-white px-2 py-0.5 rounded border border-roast-border">
              Terhubung Real-time
            </span>
          </div>

          <div className="p-5">
            <div className="space-y-4 text-sm">
              {/* 1. Pendapatan Penjualan */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-roast-charcoal">
                  <span>1. Pendapatan Penjualan Roasted Bean</span>
                  <span className="text-base font-bold text-emerald-700">{formatRupiah(summary.totalOmzetSales)}</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Total Volume Biji Kopi Terjual</span>
                  <span className="font-medium text-stone-700">{formatKg(summary.totalSoldKg)}</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Rata-rata Harga Realisasi Jual</span>
                  <span className="font-medium text-stone-700">
                    {summary.totalSoldKg > 0 ? formatRupiah(summary.totalOmzetSales / summary.totalSoldKg) : 'Rp 0'} / Kg
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-stone-200"></div>

              {/* 2. Harga Pokok Penjualan (HPP) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-roast-charcoal">
                  <span>2. Dikurangi: Harga Pokok Penjualan (HPP)</span>
                  <span className="text-base font-bold text-rose-700">({formatRupiah(summary.totalHpp)})</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Pokok Biji Sangrai Terjual (Kulak Weighted Average)</span>
                  <span className="font-medium text-stone-700">{formatRupiah(summary.rawBeanHppSold)}</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Tenaga Kerja Langsung (Packing, Sealing & QC)</span>
                  <span className="font-medium text-stone-700">{formatRupiah(summary.totalTkl)}</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Biaya Overhead Kemasan, Valve, Listrik & Gudang</span>
                  <span className="font-medium text-stone-700">{formatRupiah(summary.totalOverhead)}</span>
                </div>
              </div>

              {/* Laba Kotor Subtotal */}
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 flex justify-between items-center">
                <div>
                  <span className="font-bold text-roast-charcoal">LABA KOTOR (GROSS PROFIT)</span>
                  <p className="text-xs text-roast-amber">Gross Profit Margin: {formatPercent(summary.grossMarginPercent)}</p>
                </div>
                <span className="text-base font-extrabold text-roast-charcoal">
                  {formatRupiah(summary.grossProfit)}
                </span>
              </div>

              {/* 3. Biaya Operasional Kantor */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center font-semibold text-roast-charcoal">
                  <span>3. Dikurangi: Biaya Operasional Kantor & Komersial</span>
                  <span className="text-base font-bold text-rose-700">({formatRupiah(summary.totalOfficeExpenses)})</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Beban Pemasaran Digital, Ads & Sampel Kafe</span>
                  <span className="font-medium text-stone-700">{formatRupiah(summary.marketingExpense)}</span>
                </div>
                <div className="pl-4 text-xs text-roast-subtle flex justify-between">
                  <span>• Beban Gaji Admin, Kasir & Umum Kantor</span>
                  <span className="font-medium text-stone-700">{formatRupiah(summary.adminExpense)}</span>
                </div>
              </div>

              {/* Laba Bersih Final Box */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${
                summary.netProfit >= 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div>
                  <div className="font-bold text-base flex items-center gap-1.5">
                    LABA BERSIH OPERASIONAL (NET PROFIT)
                    {summary.netProfit >= 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">PROFIT</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">RUGI</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    Net Profit Margin: <strong>{formatPercent(summary.netMarginPercent)}</strong> dari total penjualan
                  </p>
                </div>
                <div className="text-xl font-extrabold">
                  {formatRupiah(summary.netProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Panel Posisi Stok Akhir & Summary Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel Posisi Stok Akhir */}
          <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm p-5">
            <div className="flex items-center justify-between pb-3 border-b border-roast-border">
              <h2 className="font-bold text-base text-roast-charcoal flex items-center gap-2">
                <Boxes className="w-5 h-5 text-roast-amber" />
                Posisi Persediaan Stok Akhir
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                Metode Rata-Rata
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-roast-parchment/60 p-3 rounded-lg border border-roast-border">
                <span className="text-xs text-roast-subtle">Sisa Fisik Stok Gudang</span>
                <p className="text-xl font-bold text-roast-charcoal mt-1">
                  {formatKg(summary.endingStockKg)}
                </p>
                <span className="text-[11px] text-stone-500">Tersedia siap jual/pack</span>
              </div>

              <div className="bg-roast-parchment/60 p-3 rounded-lg border border-roast-border">
                <span className="text-xs text-roast-subtle">HPP Rata-Rata per Kg</span>
                <p className="text-xl font-bold text-roast-charcoal mt-1">
                  {formatRupiah(summary.endingAvgHppPerKg)}
                </p>
                <span className="text-[11px] text-stone-500">Nilai weighted avg</span>
              </div>
            </div>

            <div className="mt-3 p-3.5 bg-gradient-to-r from-stone-900 to-roast-charcoal text-white rounded-lg shadow-sm">
              <div className="text-xs text-stone-300">Total Nilai Persediaan Akhir:</div>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {formatRupiah(summary.endingStockValue)}
              </div>
              <div className="text-[11px] text-stone-400 mt-1 flex justify-between">
                <span>Saldo Awal: {formatKg(summary.initialStockKg)} ({formatRupiah(summary.initialStockValue)})</span>
                <span>Masuk: +{formatKg(summary.totalPurchasesKg)}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box UMKM Roasted Bean */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-roast-amber text-sm">
              <Sparkles className="w-4 h-4" />
              Karakteristik Finansial Bisnis Roasted Bean
            </div>
            <p className="leading-relaxed">
              Sebagai pelaku usaha <strong>Roasted Bean Trading (tanpa mesin roasting)</strong>, margin kotor didapat dari selisih harga kulak curah dari mitra roastery terhadap harga kemasan siap seduh (retail pouch valve atau bulk pack kafe).
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-medium">
              <div className="bg-white/90 p-2 rounded border border-amber-200">
                <span className="text-stone-500 block text-[10px]">HPP Biji</span>
                <span className="font-bold text-stone-800">{((summary.rawBeanHppSold / summary.totalHpp) * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-white/90 p-2 rounded border border-amber-200">
                <span className="text-stone-500 block text-[10px]">TKL Packing</span>
                <span className="font-bold text-stone-800">{((summary.totalTkl / summary.totalHpp) * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-white/90 p-2 rounded border border-amber-200">
                <span className="text-stone-500 block text-[10px]">Overhead Kemas</span>
                <span className="font-bold text-stone-800">{((summary.totalOverhead / summary.totalHpp) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Interactive Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Pie Chart - Komposisi Struktur HPP */}
        <div className="bg-white p-5 rounded-xl border border-roast-border shadow-warm-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-roast-charcoal">
                Struktur & Komposisi HPP
              </h3>
              <p className="text-xs text-roast-subtle">
                Biji Sangrai vs Tenaga Packing/QC vs Biaya Kemasan Valve & Gudang
              </p>
            </div>
            <span className="text-xs font-semibold text-roast-amber bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Total: {formatRupiah(summary.totalHpp)}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hppCompositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hppCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltipPie />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-stone-700 font-medium">
                      {value} ({((entry.payload.value / summary.totalHpp) * 100).toFixed(1)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart - Perbandingan Finansial */}
        <div className="bg-white p-5 rounded-xl border border-roast-border shadow-warm-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-roast-charcoal">
                Perbandingan Finansial Operasional
              </h3>
              <p className="text-xs text-roast-subtle">
                Omzet Penjualan vs HPP Terjual vs Biaya Kantor vs Laba Bersih
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              Net Profit: {formatRupiah(summary.netProfit)}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialComparisonData}
                margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                />
                <RechartsTooltip content={<CustomTooltipBar />} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={42}>
                  {financialComparisonData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
