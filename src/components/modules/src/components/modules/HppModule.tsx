'use client';

import React, { useState } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatKg, formatPercent } from '@/lib/formatters';
import {
  Calculator,
  Percent,
  Sliders,
  DollarSign,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Edit3,
  Check,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const HppModule: React.FC = () => {
  const {
    summary,
    targetMargin,
    setTargetMargin,
    actualPricePerKg,
    setActualPricePerKg,
    isManualHpp,
    setIsManualHpp,
    manualHppPerKg,
    setManualHppPerKg,
  } = useRoastBook();

  // Local state for temporary input editing if desired
  const [tempManualHpp, setTempManualHpp] = useState<number>(
    manualHppPerKg > 0 ? manualHppPerKg : Math.round(summary.autoHppAllInPerKg || 150000)
  );

  const handleApplyManualHpp = (val: number) => {
    setManualHppPerKg(val);
    setTempManualHpp(val);
    setIsManualHpp(true);
  };

  const handleResetToAutoHpp = () => {
    setIsManualHpp(false);
  };

  // Recommendations based on target margin
  // Selling Price = Cost / (1 - Target Margin / 100)
  const targetMarginDecimal = targetMargin / 100;
  const recommendedPricePerKg = targetMarginDecimal < 1
    ? summary.hppAllInPerKg / (1 - targetMarginDecimal)
    : summary.hppAllInPerKg * 1.5;

  const recommendedPrice200g = recommendedPricePerKg * 0.2;
  const recommendedPrice250g = recommendedPricePerKg * 0.25;
  const recommendedPrice500g = recommendedPricePerKg * 0.5;

  // Actual Performance
  const actualProfitPerKg = actualPricePerKg - summary.hppAllInPerKg;
  const actualMarginPercent = actualPricePerKg > 0 ? (actualProfitPerKg / actualPricePerKg) * 100 : 0;
  const actualProfit200g = (actualPricePerKg * 0.2) - summary.hppPerPouch200g;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-roast-border">
        <div>
          <h1 className="text-2xl font-bold text-roast-charcoal tracking-tight flex items-center gap-2">
            Kalkulator HPP & Simulasi Harga Jual (Pricing Simulator)
          </h1>
          <p className="text-sm text-roast-subtle mt-0.5">
            Perhitungan Harga Pokok Penjualan (HPP) All-In per Kilogram dan per Pouch Retail 200g, 250g, 500g
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManualHpp ? (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-200 text-amber-950 border border-amber-400 font-bold flex items-center gap-1.5 shadow-sm">
              <Edit3 className="w-3.5 h-3.5 text-roast-amber" />
              HPP Manual: {formatRupiah(summary.hppAllInPerKg)} / Kg
            </span>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              HPP Otomatis: {formatRupiah(summary.hppAllInPerKg)} / Kg
            </span>
          )}
        </div>
      </div>

      {/* Top Section: Laporan Formal HPP Otomatis */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
        <div className="px-5 py-4 bg-roast-parchment/60 border-b border-roast-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-roast-amber" />
            <h2 className="font-bold text-base text-roast-charcoal">
              Laporan Formal Harga Pokok Penjualan (HPP) Roasted Bean
            </h2>
          </div>
          <span className="text-xs font-medium text-stone-600 bg-white px-2.5 py-1 rounded border border-roast-border">
            Basis Volume Terjual: {formatKg(summary.totalSoldKg)}
          </span>
        </div>

        <div className="p-5">
          <div className="space-y-3.5 text-sm">
            {/* Step 1: Persediaan Awal */}
            <div className="flex justify-between items-center text-stone-700">
              <span className="font-medium">1. Persediaan Awal Roasted Bean ({formatKg(summary.initialStockKg)})</span>
              <span className="font-mono">{formatRupiah(summary.initialStockValue)}</span>
            </div>

            {/* Step 2: Pembelian Bersih */}
            <div className="flex justify-between items-center text-stone-700">
              <span className="font-medium">2. Ditambah: Pembelian Bersih / Kulak ({formatKg(summary.totalPurchasesKg)})</span>
              <span className="font-mono text-emerald-700">+{formatRupiah(summary.totalPurchasesValue)}</span>
            </div>

            <div className="border-t border-stone-200"></div>

            {/* Barang Tersedia untuk Dijual */}
            <div className="flex justify-between items-center font-semibold text-stone-800 bg-stone-50 px-3 py-2 rounded-lg">
              <span>Barang Tersedia untuk Dijual (Available for Sale)</span>
              <span className="font-mono">{formatRupiah(summary.initialStockValue + summary.totalPurchasesValue)}</span>
            </div>

            {/* Step 3: Persediaan Akhir */}
            <div className="flex justify-between items-center text-stone-700">
              <span className="font-medium">3. Dikurangi: Persediaan Akhir Roasted Bean ({formatKg(summary.endingStockKg)})</span>
              <span className="font-mono text-rose-700">-{formatRupiah(summary.endingStockValue)}</span>
            </div>

            <div className="border-t border-stone-200"></div>

            {/* Pokok Biji Sangrai Terjual */}
            <div className="flex justify-between items-center font-bold text-roast-charcoal bg-amber-50/60 px-3 py-2 rounded-lg border border-amber-200/60">
              <span>= Harga Pokok Biji Sangrai Terjual (Kulak Beans)</span>
              <span className="font-mono text-base font-extrabold">{formatRupiah(summary.rawBeanHppSold)}</span>
            </div>

            {/* Step 4: TKL */}
            <div className="flex justify-between items-center text-stone-700 pl-4">
              <span className="font-medium">+ Tenaga Kerja Langsung (TKL Packing, Sealing & QC)</span>
              <span className="font-mono">+{formatRupiah(summary.totalTkl)}</span>
            </div>

            {/* Step 5: Overhead */}
            <div className="flex justify-between items-center text-stone-700 pl-4">
              <span className="font-medium">+ Total Biaya Overhead (Kemasan Valve, Sewa, Listrik, Tester Cupping)</span>
              <span className="font-mono">+{formatRupiah(summary.totalOverhead)}</span>
            </div>

            {/* FINAL GRAND TOTAL HPP */}
            <div className="mt-3 p-4 bg-gradient-to-r from-stone-900 to-roast-charcoal text-white rounded-xl shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                  TOTAL HARGA POKOK PENJUALAN (HPP) BULAN INI
                </span>
                <span className="text-xs text-stone-300">
                  Total beban pokok atas {formatKg(summary.totalSoldKg)} roasted bean terjual
                </span>
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {formatRupiah(summary.totalHpp)}
              </div>
            </div>

            {isManualHpp && (
              <div className="p-3 bg-amber-100/90 border border-amber-300 rounded-lg text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm">
                <span className="font-semibold flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-roast-amber" />
                  HPP All-In Manual Diterapkan untuk Pricing: <strong>{formatRupiah(summary.hppAllInPerKg)} / Kg</strong>
                </span>
                <span className="text-[11px] text-stone-600">
                  (Hasil kalkulasi riil akuntansi: {formatRupiah(summary.autoHppAllInPerKg)} / Kg)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector & Pengaturan Penentuan HPP: Otomatis vs Manual Input */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-roast-border">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-roast-amber" />
              <h2 className="font-bold text-base text-roast-charcoal">
                Metode Penentuan HPP Produk Roasted Bean
              </h2>
            </div>
            <p className="text-xs text-roast-subtle mt-0.5">
              Pilih apakah HPP dihitung otomatis dari akuntansi biaya riil atau ditentukan manual sesuai strategi bisnis Anda
            </p>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-roast-border">
            <button
              type="button"
              onClick={handleResetToAutoHpp}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !isManualHpp
                  ? 'bg-white text-roast-charcoal shadow-sm border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hitung Otomatis (Biaya Riil)</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyManualHpp(tempManualHpp || 150000)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isManualHpp
                  ? 'bg-roast-amber text-white shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-200" />
              <span>Input Manual Sendiri</span>
            </button>
          </div>
        </div>

        {/* Status Indicator & Input Box if Manual */}
        {isManualHpp ? (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-300 animate-fadeIn space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-roast-amber" />
                  Mode Penentuan HPP Manual Sedang Aktif
                </span>
                <p className="text-xs text-stone-600 mt-0.5">
                  Nilai ini langsung menjadi acuan untuk seluruh simulasi harga jual & margin produk (Pouch 200g, 250g, 500g, 1Kg)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Hasil Hitung Otomatis:</span>
                <span className="text-xs font-mono font-bold text-stone-700 bg-white px-2 py-1 rounded border border-stone-300">
                  {formatRupiah(summary.autoHppAllInPerKg)} / Kg
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-500">Rp</span>
                <input
                  type="number"
                  step="500"
                  value={tempManualHpp}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTempManualHpp(val);
                    setManualHppPerKg(val);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm font-black text-roast-charcoal bg-white border-2 border-roast-amber rounded-lg focus:outline-none focus:ring-2 focus:ring-roast-amber/30"
                  placeholder="Masukkan HPP Manual per Kg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-stone-600 mr-1">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleApplyManualHpp(Math.round(summary.autoHppAllInPerKg))}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 rounded-lg border border-stone-300 font-medium text-stone-700"
                  title="Gunakan hasil kalkulasi biaya riil otomatis"
                >
                  Gunakan Otomatis ({formatRupiah(summary.autoHppAllInPerKg)})
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyManualHpp(140000)}
                  className="px-2 py-1 text-xs bg-white hover:bg-amber-100 rounded border border-amber-200 text-stone-700 font-medium"
                >
                  140rb
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyManualHpp(150000)}
                  className="px-2 py-1 text-xs bg-white hover:bg-amber-100 rounded border border-amber-200 text-stone-700 font-medium"
                >
                  150rb
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyManualHpp(160000)}
                  className="px-2 py-1 text-xs bg-white hover:bg-amber-100 rounded border border-amber-200 text-stone-700 font-medium"
                >
                  160rb
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyManualHpp(175000)}
                  className="px-2 py-1 text-xs bg-white hover:bg-amber-100 rounded border border-amber-200 text-stone-700 font-medium"
                >
                  175rb
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-lg bg-stone-50 border border-roast-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Saat ini menggunakan <strong>Perhitungan Otomatis</strong>: Persediaan Biji Bersih ({formatRupiah(summary.rawBeanHppSold)}) + TKL Packing ({formatRupiah(summary.totalTkl)}) + Overhead ({formatRupiah(summary.totalOverhead)}) / {formatKg(summary.totalSoldKg)} = <strong>{formatRupiah(summary.autoHppAllInPerKg)} / Kg</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleApplyManualHpp(tempManualHpp || Math.round(summary.autoHppAllInPerKg || 150000))}
              className="text-roast-amber hover:underline font-semibold whitespace-nowrap self-end sm:self-auto"
            >
              Ingin ubah manual? Klik di sini &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Middle Section: Breakdown HPP per Kg & per Pouch 200g */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-roast-subtle font-medium block">1. Pokok Biji Murni / Kg</span>
          <div className="text-lg font-bold text-roast-charcoal mt-1">
            {formatRupiah(summary.hppRawPerKg)} <span className="text-xs font-normal text-stone-500">/Kg</span>
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Porsi: {formatPercent((summary.rawBeanHppSold / summary.totalHpp) * 100)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-roast-subtle font-medium block">2. Beban TKL & Overhead / Kg</span>
          <div className="text-lg font-bold text-stone-800 mt-1">
            {formatRupiah(summary.hppTklPerKg + summary.hppOverheadPerKg)} <span className="text-xs font-normal text-stone-500">/Kg</span>
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            TKL: {formatRupiah(summary.hppTklPerKg)} | Ovh: {formatRupiah(summary.hppOverheadPerKg)}
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-warm-sm ${isManualHpp ? 'bg-amber-100/90 border-amber-400' : 'bg-amber-50/80 border-amber-300'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-roast-amber font-bold block">3. HPP Total All-In / Kg</span>
            {isManualHpp ? (
              <span className="text-[10px] px-1.5 py-0.5 bg-roast-amber text-white rounded font-bold">Manual</span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Otomatis</span>
            )}
          </div>
          <div className="text-xl font-black text-roast-charcoal mt-1">
            {formatRupiah(summary.hppAllInPerKg)} <span className="text-xs font-medium text-stone-600">/Kg</span>
          </div>
          <span className="text-xs text-amber-900 mt-1 block font-medium">
            {isManualHpp ? 'Ditetapkan Manual oleh Pengguna' : 'Biji + Tenaga Packing + Kemasan Valve'}
          </span>
        </div>

        <div className="bg-gradient-to-br from-roast-amber to-roast-caramel text-white p-4 rounded-xl shadow-warm-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-100 font-bold block">4. HPP Pouch Retail 200g</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-white/20 text-white rounded font-semibold">
              {isManualHpp ? 'Basis Manual' : 'Basis Otomatis'}
            </span>
          </div>
          <div className="text-xl font-black text-white mt-1">
            {formatRupiah(summary.hppPerPouch200g)} <span className="text-xs font-normal text-amber-100">/Pouch</span>
          </div>
          <span className="text-xs text-amber-200 mt-1 block">
            = HPP All-In × 0,2 (200 Gram)
          </span>
        </div>
      </div>

      {/* Bottom Section: Pricing Simulator (Target Margin Slider & Actual Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Pricing Simulator (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-roast-border shadow-warm-sm p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-roast-border">
            <h3 className="font-bold text-base text-roast-charcoal flex items-center gap-2">
              <Sliders className="w-5 h-5 text-roast-amber" />
              Simulasi Target Margin & Rekomendasi Harga Jual
            </h3>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold">
              Target: {targetMargin}%
            </span>
          </div>

          {/* Slider Target Margin */}
          <div className="space-y-2 bg-roast-parchment/40 p-4 rounded-xl border border-roast-border">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="marginSlider" className="font-bold text-stone-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-roast-amber" />
                Target Margin Laba Kotor (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-center font-bold text-roast-charcoal bg-white border border-roast-border rounded focus:outline-none focus:border-roast-amber text-xs"
                />
                <span className="font-bold text-stone-600">%</span>
              </div>
            </div>

            <input
              id="marginSlider"
              type="range"
              min="10"
              max="70"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-roast-amber"
            />

            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Konservatif (15%)</span>
              <span>Standar B2B (30%)</span>
              <span>Retail Specialty (45%)</span>
              <span>Premium Drip (60%)</span>
            </div>
          </div>

          {/* Rekomendasi Harga Jual Berdasarkan Target Margin */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-700 block">
              Rekomendasi Harga Jual Minimal Berdasarkan Target Margin ({targetMargin}%):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rekomendasi per Kg */}
              <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/60">
                <span className="text-xs text-amber-900 font-semibold block">Kemasan Bulk 1 Kg (B2B Kafe / Horeca)</span>
                <div className="text-xl font-extrabold text-roast-charcoal mt-1">
                  {formatRupiah(recommendedPricePerKg)} <span className="text-xs font-normal text-stone-600">/Kg</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1 flex justify-between">
                  <span>HPP: {formatRupiah(summary.hppAllInPerKg)}</span>
                  <span className="font-bold">Laba Kotor: +{formatRupiah(recommendedPricePerKg - summary.hppAllInPerKg)}</span>
                </div>
              </div>

              {/* Rekomendasi per Pouch 200g */}
              <div className="p-3.5 rounded-xl border-2 border-emerald-300 bg-emerald-50/60">
                <span className="text-xs text-emerald-900 font-semibold block">Kemasan Retail 200g (Pouch Valve Konsumen)</span>
                <div className="text-xl font-extrabold text-emerald-900 mt-1">
                  {formatRupiah(recommendedPrice200g)} <span className="text-xs font-normal text-stone-600">/Pouch</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 flex justify-between">
                  <span>HPP: {formatRupiah(summary.hppPerPouch200g)}</span>
                  <span className="font-bold">Laba Kotor: +{formatRupiah(recommendedPrice200g - summary.hppPerPouch200g)}</span>
                </div>
              </div>
            </div>

            {/* Alternatif Kemasan 250g & 500g */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-stone-50 rounded-lg border border-roast-border">
                <span className="text-[11px] text-stone-600 block">Kemasan Pouch 250g:</span>
                <span className="text-sm font-bold text-stone-800">{formatRupiah(recommendedPrice250g)}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">HPP: {formatRupiah(summary.hppPerPouch250g)}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-roast-border">
                <span className="text-[11px] text-stone-600 block">Kemasan Pouch 500g:</span>
                <span className="text-sm font-bold text-stone-800">{formatRupiah(recommendedPrice500g)}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">HPP: {formatRupiah(summary.hppPerPouch500g)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actual Selling Price vs Margin Evaluation (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-roast-border shadow-warm-sm p-5 space-y-4">
          <div className="pb-3 border-b border-roast-border">
            <h3 className="font-bold text-base text-roast-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Evaluasi Harga Jual Aktual Realisasi
            </h3>
            <p className="text-xs text-roast-subtle mt-0.5">
              Bandingkan harga jual riil Anda dengan HPP All-In untuk melihat margin nyata
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Harga Jual Aktual Rata-Rata per Kg (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-xs">Rp</span>
                <input
                  type="number"
                  step="1000"
                  value={actualPricePerKg}
                  onChange={(e) => setActualPricePerKg(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-lg border border-roast-border focus:outline-none focus:border-roast-amber"
                />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Default: Rata-rata realisasi transaksi penjualan bulan berjalan (B2B, Horeca, Retail)
              </span>
            </div>

            {/* Margin Evaluation Card */}
            <div className={`p-4 rounded-xl border ${
              actualProfitPerKg >= 0
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-rose-50 border-rose-300'
            }`}>
              <span className="text-xs font-bold text-stone-700 block">
                Hasil Margin Kotor Aktual per Kg:
              </span>
              <div className="text-2xl font-black mt-1 text-roast-charcoal">
                {formatRupiah(actualProfitPerKg)} <span className="text-xs font-semibold text-stone-600">/Kg</span>
              </div>
              <div className="mt-2 text-xs flex items-center justify-between font-semibold">
                <span className={actualProfitPerKg >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                  Margin Aktual: {formatPercent(actualMarginPercent)}
                </span>
                <span className="text-stone-600 font-normal">
                  (Target: {targetMargin}%)
                </span>
              </div>
            </div>

            {/* Equivalent per 200g pouch */}
            <div className="p-3 bg-stone-50 rounded-lg border border-roast-border text-xs space-y-1">
              <div className="flex justify-between font-medium text-stone-700">
                <span>Harga Jual Aktual per Pouch 200g:</span>
                <span className="font-bold">{formatRupiah(actualPricePerKg * 0.2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>HPP per Pouch 200g:</span>
                <span>{formatRupiah(summary.hppPerPouch200g)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-stone-200">
                <span>Laba Kotor per Pouch 200g:</span>
                <span>+{formatRupiah(actualProfit200g)}</span>
              </div>
            </div>

            {/* Tips for Roastery Trading */}
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-roast-amber flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Tips Negosiasi B2B:</strong> Untuk pelanggan kafe volume besar (&gt;100 Kg/bulan), margin 25-30% sudah sangat sehat karena perputaran kas cepat dan biaya kemasan lebih rendah (karung 5kg/10kg tanpa stiker retail).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
