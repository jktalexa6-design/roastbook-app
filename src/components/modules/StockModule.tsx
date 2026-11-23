'use client';

import React, { useState, useMemo } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatKg, formatDateIndo } from '@/lib/formatters';
import {
  Boxes,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  Info,
  Coffee,
  X,
} from 'lucide-react';

export const StockModule: React.FC = () => {
  const { stockMutations, addStockMutation, deleteStockMutation, variants, summary } = useRoastBook();

  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [mutationType, setMutationType] = useState<'IN' | 'OUT'>('IN');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [evidenceNo, setEvidenceNo] = useState('');
  const [variant, setVariant] = useState('Arabika Gayo Full Wash');
  const [roastProfile, setRoastProfile] = useState('Medium Roast (Filter/Espresso)');
  const [inKg, setInKg] = useState<number>(100);
  const [buyPricePerKg, setBuyPricePerKg] = useState<number>(140000);
  const [outKg, setOutKg] = useState<number>(50);
  const [sellingPricePerKg, setSellingPricePerKg] = useState<number>(200000);
  const [customerOrVendor, setCustomerOrVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [syncToCash, setSyncToCash] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [selectedVariantFilter, setSelectedVariantFilter] = useState<string>('ALL');

  // List of all available variants (from master and transaction history)
  const availableVariantNames = useMemo(() => {
    const names = new Set<string>();
    variants.forEach((v) => names.add(v.name));
    stockMutations.forEach((m) => {
      if (!m.evidenceNo.startsWith('OPN')) {
        names.add(m.variant);
      }
    });
    return Array.from(names);
  }, [variants, stockMutations]);

  // Variant-specific statistics when filtered
  const variantStats = useMemo(() => {
    if (selectedVariantFilter === 'ALL') return null;

    let totalIn = 0;
    let totalInVal = 0;
    let totalOut = 0;
    let totalRevenue = 0;

    stockMutations.forEach((m) => {
      const match = m.variant.toLowerCase().includes(selectedVariantFilter.toLowerCase());
      if (match) {
        if (m.type === 'IN') {
          totalIn += m.inKg;
          totalInVal += m.inTotal;
        } else if (m.type === 'OUT') {
          totalOut += m.outKg;
          if (m.revenueTotal) totalRevenue += m.revenueTotal;
        }
      }
    });

    const netStock = totalIn - totalOut;

    return {
      name: selectedVariantFilter,
      totalIn,
      totalInVal,
      totalOut,
      totalRevenue,
      netStock,
    };
  }, [selectedVariantFilter, stockMutations]);

  const handleOpenAdd = (type: 'IN' | 'OUT') => {
    setMutationType(type);
    const count = stockMutations.filter((m) => m.type === type).length + 1;
    setEvidenceNo(type === 'IN' ? `BEL-0${count}` : `JUAL-0${count}`);
    if (type === 'IN') {
      setCustomerOrVendor('CV Kopi Dataran Tinggi Gayo');
      setNotes('Pengiriman kulak biji kopi sangrai dari roastery mitra');
    } else {
      setCustomerOrVendor('Kafe Pelanggan B2B');
      setNotes('Penjualan roasted bean kemasan');
    }
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceNo || !variant) {
      alert('Mohon isi Nomor Bukti dan Varian Biji Kopi.');
      return;
    }

    if (mutationType === 'OUT' && outKg > summary.endingStockKg) {
      if (!confirm(`Peringatan: Jumlah keluar (${outKg} Kg) melebihi sisa fisik stok gudang (${summary.endingStockKg} Kg). Tetap lanjutkan?`)) {
        return;
      }
    }

    addStockMutation(
      {
        date,
        evidenceNo,
        variant,
        roastProfile,
        type: mutationType,
        inKg: mutationType === 'IN' ? Number(inKg) : 0,
        buyPricePerKg: mutationType === 'IN' ? Number(buyPricePerKg) : 0,
        inTotal: mutationType === 'IN' ? Number(inKg) * Number(buyPricePerKg) : 0,
        outKg: mutationType === 'OUT' ? Number(outKg) : 0,
        sellingPricePerKg: mutationType === 'OUT' ? Number(sellingPricePerKg) : 0,
        revenueTotal: mutationType === 'OUT' ? Number(outKg) * Number(sellingPricePerKg) : 0,
        customerOrVendor,
        notes,
      },
      syncToCash
    );

    setShowAddForm(false);
  };

  // Filtered rows
  const filteredMutations = stockMutations.filter((m) => {
    const matchesSearch =
      m.evidenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.customerOrVendor && m.customerOrVendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || m.type === filterType;

    const matchesVariant =
      selectedVariantFilter === 'ALL' ||
      m.variant.toLowerCase().includes(selectedVariantFilter.toLowerCase());

    return matchesSearch && matchesType && matchesVariant;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-roast-border">
        <div>
          <h1 className="text-2xl font-bold text-roast-charcoal tracking-tight flex items-center gap-2">
            Kartu Persediaan Roasted Bean
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 font-medium">
              Metode Rata-Rata Tertimbang (Weighted Average)
            </span>
          </h1>
          <p className="text-sm text-roast-subtle mt-0.5">
            Pencatatan mutasi masuk (kulak roastery) dan keluar (terjual B2B/Retail) dengan evaluasi HPP otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('IN')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Stok Masuk (Kulak)</span>
          </button>

          <button
            onClick={() => handleOpenAdd('OUT')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-roast-amber hover:bg-roast-caramel text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Stok Keluar (Terjual)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Saldo Awal, Total Pembelian, Total Terjual, Sisa Fisik & Nilai Persediaan Akhir */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-roast-subtle block font-medium">1. Saldo Awal</span>
          <div className="text-lg font-bold text-roast-charcoal mt-1">
            {formatKg(summary.initialStockKg)}
          </div>
          <span className="text-xs text-stone-500 font-medium">{formatRupiah(summary.initialStockValue)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-emerald-800 block font-medium">2. Total Kulak (Masuk)</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            +{formatKg(summary.totalPurchasesKg)}
          </div>
          <span className="text-xs text-emerald-600 font-medium">{formatRupiah(summary.totalPurchasesValue)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-rose-800 block font-medium">3. Total Terjual (Keluar)</span>
          <div className="text-lg font-bold text-rose-700 mt-1">
            -{formatKg(summary.totalSoldKg)}
          </div>
          <span className="text-xs text-rose-600 font-medium">HPP: {formatRupiah(summary.rawBeanHppSold)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-warm-sm">
          <span className="text-xs text-roast-amber block font-bold">4. Sisa Fisik Stok</span>
          <div className="text-xl font-extrabold text-roast-charcoal mt-1">
            {formatKg(summary.endingStockKg)}
          </div>
          <span className="text-xs text-amber-900 font-medium">Avg: {formatRupiah(summary.endingAvgHppPerKg)}/Kg</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-stone-900 to-roast-charcoal text-white p-3.5 rounded-xl shadow-warm-sm">
          <span className="text-xs text-stone-300 block font-medium">5. Nilai Persediaan Akhir</span>
          <div className="text-lg font-black text-amber-300 mt-1">
            {formatRupiah(summary.endingStockValue)}
          </div>
          <span className="text-xs text-stone-400">Metode Average</span>
        </div>
      </div>

      {/* Weighted Average Formula Banner */}
      <div className="bg-roast-parchment/80 border border-roast-border rounded-xl p-3.5 text-xs text-roast-muted flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-roast-amber flex-shrink-0" />
          <div>
            <span className="font-bold text-roast-charcoal">Aturan Logika Weighted Average: </span>
            <span>
              Saat <strong>Kulak Masuk</strong>, HPP Rata-Rata diperbarui = <code>Nilai Total Persediaan / Sisa Stok</code>. Saat <strong>Terjual Keluar</strong>, Nilai Pokok dihitung menggunakan HPP Rata-Rata baris sebelumnya.
            </span>
          </div>
        </div>
        <div className="text-stone-500 font-mono text-[11px] whitespace-nowrap bg-white px-2.5 py-1 rounded border border-roast-border">
          Total Baris: {stockMutations.length} Mutasi
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-roast-border shadow-warm-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no bukti, varian, customer/vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-roast-border focus:outline-none focus:border-roast-amber bg-roast-warmbg/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Dropdown Filter Varian Kopi */}
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-roast-amber flex-shrink-0" />
            <span className="text-xs text-stone-600 font-medium whitespace-nowrap">Varian:</span>
            <select
              value={selectedVariantFilter}
              onChange={(e) => setSelectedVariantFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-roast-border bg-white text-stone-800 font-medium focus:outline-none focus:border-roast-amber cursor-pointer max-w-[200px] sm:max-w-xs truncate shadow-sm"
              title="Pilih Varian Kopi / Semua Varian"
            >
              <option value="ALL">Semua Varian Kopi</option>
              {availableVariantNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipe Mutasi: Semua / Masuk / Keluar */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500 font-medium">Tipe:</span>
            {(['ALL', 'IN', 'OUT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  filterType === t
                    ? 'bg-roast-charcoal text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t === 'ALL' ? 'Semua' : t === 'IN' ? 'Kulak (In)' : 'Jual (Out)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variant Focus Highlight Banner (muncul jika ada varian spesifik yang dipilih) */}
      {variantStats && (
        <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/70 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-warm-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-roast-caramel to-roast-amber text-white flex items-center justify-center font-bold shadow-sm">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-roast-charcoal">{variantStats.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                  Filter Varian Aktif
                </span>
              </div>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Total Kulak: <strong>{formatKg(variantStats.totalIn)}</strong> ({formatRupiah(variantStats.totalInVal)}) • Terjual: <strong>{formatKg(variantStats.totalOut)}</strong> ({formatRupiah(variantStats.totalRevenue)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 block">Sisa Mutasi Bersih:</span>
              <span className="font-extrabold text-sm text-roast-amber">{formatKg(variantStats.netStock)}</span>
            </div>
            <button
              onClick={() => setSelectedVariantFilter('ALL')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 font-medium transition-colors shadow-sm"
              title="Reset Filter ke Semua Varian"
            >
              <X className="w-3.5 h-3.5 text-stone-500" />
              <span>Semua Varian</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Stock Mutation Table */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 text-stone-700 font-bold border-b border-roast-border">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">No. Bukti</th>
                <th className="py-2.5 px-3">Varian & Profil Sangrai</th>
                <th className="py-2.5 px-3">Tipe</th>
                {/* Kolom Masuk */}
                <th className="py-2.5 px-3 text-right bg-emerald-50/50">Masuk (Kg)</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/50">Beli / Kg</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/50">Nilai Masuk (Rp)</th>
                {/* Kolom Keluar */}
                <th className="py-2.5 px-3 text-right bg-rose-50/50">Keluar (Kg)</th>
                <th className="py-2.5 px-3 text-right bg-rose-50/50">Nilai Pokok Terjual</th>
                {/* Kolom Saldo */}
                <th className="py-2.5 px-3 text-right bg-amber-50/60 font-black">Sisa Stok</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/60 font-black">HPP Rata-Rata/Kg</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/60 font-black">Nilai Persediaan</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roast-border text-stone-800">
              {filteredMutations.map((row) => {
                const isOpname = row.evidenceNo.startsWith('OPN');
                return (
                  <tr key={row.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-600">
                      {formatDateIndo(row.date)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-stone-700 whitespace-nowrap">
                      {row.evidenceNo}
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="font-semibold text-roast-charcoal truncate" title={row.variant}>
                        {row.variant}
                      </div>
                      <div className="text-[11px] text-roast-subtle truncate" title={row.customerOrVendor}>
                        {row.customerOrVendor || row.roastProfile}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.type === 'IN' ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isOpname ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <ArrowDownLeft className="w-3 h-3" />
                          {isOpname ? 'Saldo Awal' : 'Kulak'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                          <ArrowUpRight className="w-3 h-3" />
                          Terjual
                        </span>
                      )}
                    </td>

                    {/* Masuk */}
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-800 bg-emerald-50/20">
                      {row.inKg > 0 ? formatKg(row.inKg) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-stone-600 bg-emerald-50/20">
                      {row.buyPricePerKg > 0 ? formatRupiah(row.buyPricePerKg) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-900 bg-emerald-50/20">
                      {row.inTotal > 0 ? formatRupiah(row.inTotal) : '-'}
                    </td>

                    {/* Keluar */}
                    <td className="py-2.5 px-3 text-right font-medium text-rose-800 bg-rose-50/20">
                      {row.outKg > 0 ? formatKg(row.outKg) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-rose-900 bg-rose-50/20">
                      {row.outTotalCost > 0 ? formatRupiah(row.outTotalCost) : '-'}
                    </td>

                    {/* Saldo Average */}
                    <td className="py-2.5 px-3 text-right font-bold text-roast-charcoal bg-amber-50/30">
                      {formatKg(row.balanceKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-roast-amber bg-amber-50/30">
                      {formatRupiah(row.avgHppPerKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-roast-charcoal bg-amber-50/30">
                      {formatRupiah(row.balanceValue)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {!isOpname && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus mutasi ${row.evidenceNo}? Saldo weighted average akan otomatis dihitung ulang.`)) {
                              deleteStockMutation(row.id);
                            }
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Transaksi Mutasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mutation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-roast-border">
            <div className="flex items-center justify-between pb-3 border-b border-roast-border">
              <h2 className="text-lg font-bold text-roast-charcoal flex items-center gap-2">
                {mutationType === 'IN' ? (
                  <>
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    Tambah Mutasi Stok Masuk (Kulak dari Roastery)
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-roast-amber" />
                    Tambah Mutasi Stok Keluar (Penjualan Roasted Bean)
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">No. Bukti Transaksi</label>
                  <input
                    type="text"
                    value={evidenceNo}
                    onChange={(e) => setEvidenceNo(e.target.value)}
                    required
                    placeholder="BEL-04 atau JUAL-04"
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Varian Roasted Bean</label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                    <option value="House Blend Espresso 70:30">House Blend Espresso 70:30</option>
                    <option value="Single Origin Filter Custom">Single Origin Filter Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Profil Sangrai / Kategori</label>
                  <input
                    type="text"
                    value={roastProfile}
                    onChange={(e) => setRoastProfile(e.target.value)}
                    placeholder="Medium Roast / Espresso Roast"
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
              </div>

              {mutationType === 'IN' ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-semibold text-emerald-900 mb-1">Jumlah Masuk (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={inKg}
                      onChange={(e) => setInKg(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none bg-white font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-emerald-900 mb-1">Harga Beli per Kg (Rp)</label>
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={buyPricePerKg}
                      onChange={(e) => setBuyPricePerKg(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none bg-white font-bold text-sm"
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-emerald-800">
                    Total Nilai Pembelian: {formatRupiah(inKg * buyPricePerKg)}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <div>
                    <label className="block font-semibold text-rose-900 mb-1">Jumlah Keluar / Terjual (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={outKg}
                      onChange={(e) => setOutKg(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none bg-white font-bold text-sm"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Stok saat ini: {formatKg(summary.endingStockKg)}
                    </span>
                  </div>
                  <div>
                    <label className="block font-semibold text-rose-900 mb-1">Harga Jual per Kg (Rp)</label>
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={sellingPricePerKg}
                      onChange={(e) => setSellingPricePerKg(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none bg-white font-bold text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex justify-between text-xs font-bold text-rose-900">
                    <span>Estimasi HPP Pokok: {formatRupiah(outKg * summary.endingAvgHppPerKg)}</span>
                    <span className="text-emerald-800 font-extrabold">Omzet Kas: {formatRupiah(outKg * sellingPricePerKg)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    {mutationType === 'IN' ? 'Nama Mitra Roastery (Supplier)' : 'Nama Pelanggan (Kafe/Retail/Horeca)'}
                  </label>
                  <input
                    type="text"
                    value={customerOrVendor}
                    onChange={(e) => setCustomerOrVendor(e.target.value)}
                    placeholder={mutationType === 'IN' ? 'Roastery Mitra Aceh / Bandung' : 'Kafe Ruang Seduh / B2B'}
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="No batch, kemasan 200g, PO kafe..."
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
              </div>

              {/* Quick Sync to Cashbook Checkbox */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="syncCash"
                  checked={syncToCash}
                  onChange={(e) => setSyncToCash(e.target.checked)}
                  className="w-4 h-4 text-roast-amber accent-roast-amber rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="syncCash" className="font-semibold text-stone-800 cursor-pointer text-xs">
                  Catat otomatis ke Buku Kas Umum{' '}
                  <span className="font-normal text-stone-600">
                    ({mutationType === 'IN' ? 'Pengeluaran Kas Pembelian' : 'Penerimaan Kas Penjualan'})
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-roast-border">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-white font-bold shadow-md ${
                    mutationType === 'IN'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-roast-amber hover:bg-roast-caramel'
                  }`}
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
