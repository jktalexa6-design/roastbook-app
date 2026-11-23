'use client';

import React, { useState } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { CashCategory } from '@/types';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Wallet,
  Check,
  Calendar,
} from 'lucide-react';

export const CashbookModule: React.FC = () => {
  const {
    cashTransactions,
    addCashTransaction,
    deleteCashTransaction,
    syncTklAndOverheadToCash,
    summary,
  } = useRoastBook();

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [evidenceNo, setEvidenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CashCategory>('Penjualan Roasted Bean');
  const [amount, setAmount] = useState<number>(1000000);

  // Sync feedback
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const categories: CashCategory[] = [
    'Saldo Awal',
    'Penjualan Roasted Bean',
    'Pembelian Roasted Bean',
    'Tenaga Packing & QC',
    'Overhead Kemasan & Gudang',
    'Pemasaran & Sampel',
    'Gaji & Umum Kantor',
    'Lain-lain',
  ];

  const handleOpenAdd = (type: 'IN' | 'OUT') => {
    setTxType(type);
    const count = cashTransactions.length + 1;
    setEvidenceNo(type === 'IN' ? `BKM-0${count}` : `BKK-0${count}`);
    setCategory(type === 'IN' ? 'Penjualan Roasted Bean' : 'Gaji & Umum Kantor');
    setShowAddForm(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceNo || !description || amount <= 0) {
      alert('Mohon isi semua data dengan benar.');
      return;
    }

    addCashTransaction({
      date,
      evidenceNo,
      description,
      category,
      type: txType,
      amount: Number(amount),
      source: 'manual',
    });

    setShowAddForm(false);
    setDescription('');
  };

  const handleSyncOverheadTkl = () => {
    const res = syncTklAndOverheadToCash();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Totals
  const totalDebit = cashTransactions
    .filter((t) => t.type === 'IN' && t.category !== 'Saldo Awal')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalKredit = cashTransactions
    .filter((t) => t.type === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  const initialBalance = cashTransactions
    .filter((t) => t.category === 'Saldo Awal')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered transactions
  const filtered = cashTransactions.filter((t) => {
    const matchSearch =
      t.evidenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-roast-border">
        <div>
          <h1 className="text-2xl font-bold text-roast-charcoal tracking-tight flex items-center gap-2">
            Buku Kas Umum (Cash Flow & Bank Ledger)
          </h1>
          <p className="text-sm text-roast-subtle mt-0.5">
            Pencatatan arus kas masuk (Debit) & kas keluar (Kredit) dengan perhitungan saldo berjalan otomatis
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleSyncOverheadTkl}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors border border-stone-700"
            title="Sinkronkan beban TKL & Overhead bulan berjalan ke buku kas"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sinkronkan Beban TKL & Overhead</span>
          </button>

          <button
            onClick={() => handleOpenAdd('IN')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Kas Masuk (Debit)</span>
          </button>

          <button
            onClick={() => handleOpenAdd('OUT')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Kas Keluar (Kredit)</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-roast-subtle font-medium block">1. Saldo Awal Kas</span>
          <div className="text-lg font-bold text-roast-charcoal mt-1">
            {formatRupiah(initialBalance)}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Awal Bulan November</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-emerald-800 font-medium block">2. Total Penerimaan (Debit)</span>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            +{formatRupiah(totalDebit)}
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">Penjualan B2B, Horeca, Retail</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <span className="text-xs text-rose-800 font-medium block">3. Total Pengeluaran (Kredit)</span>
          <div className="text-lg font-bold text-rose-700 mt-1">
            -{formatRupiah(totalKredit)}
          </div>
          <span className="text-xs text-rose-600 mt-1 block">Kulak, TKL, Kemasan, Kantor</span>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-roast-charcoal text-white p-4 rounded-xl shadow-warm-sm">
          <span className="text-xs text-stone-300 font-medium block">4. Saldo Kas & Bank Akhir</span>
          <div className="text-xl font-black text-amber-300 mt-1">
            {formatRupiah(summary.finalCashBalance)}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Saldo Berjalan Real-Time</span>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-roast-border shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari transaksi, no bukti, keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-roast-border focus:outline-none focus:border-roast-amber bg-roast-warmbg/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-roast-border bg-white text-stone-700 focus:outline-none focus:border-roast-amber cursor-pointer"
          >
            <option value="ALL">Semua Kategori Akun</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Cashbook Table with Running Balance */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 text-stone-700 font-bold border-b border-roast-border">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">No. Bukti</th>
                <th className="py-2.5 px-4">Keterangan Transaksi</th>
                <th className="py-2.5 px-3">Kategori Akun</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/50">Penerimaan / Debit (Rp)</th>
                <th className="py-2.5 px-3 text-right bg-rose-50/50">Pengeluaran / Kredit (Rp)</th>
                <th className="py-2.5 px-4 text-right font-black text-roast-charcoal bg-amber-50/70">
                  Saldo Berjalan (Rp)
                </th>
                <th className="py-2.5 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roast-border text-stone-800">
              {filtered.map((row) => {
                const isDebit = row.type === 'IN';
                const isInitial = row.category === 'Saldo Awal';
                return (
                  <tr key={row.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-600">
                      {formatDateIndo(row.date)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-stone-700 whitespace-nowrap">
                      {row.evidenceNo}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-roast-charcoal">
                      <div className="truncate max-w-xs sm:max-w-md" title={row.description}>
                        {row.description}
                      </div>
                      {row.source && row.source !== 'manual' && (
                        <span className="text-[10px] text-stone-500 font-normal">
                          (Sinkronisasi: {row.source})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isInitial
                          ? 'bg-purple-100 text-purple-800'
                          : row.category === 'Penjualan Roasted Bean'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.category === 'Pembelian Roasted Bean'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {row.category}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                      {isDebit ? `+${formatRupiah(row.amount)}` : '-'}
                    </td>

                    {/* Kredit */}
                    <td className="py-2.5 px-3 text-right font-semibold text-rose-700 bg-rose-50/20 whitespace-nowrap">
                      {!isDebit ? `-${formatRupiah(row.amount)}` : '-'}
                    </td>

                    {/* Running Balance */}
                    <td className="py-2.5 px-4 text-right font-bold text-roast-charcoal bg-amber-50/30 whitespace-nowrap">
                      {formatRupiah(row.runningBalance || 0)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-2 text-center">
                      {!isInitial && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus transaksi ${row.evidenceNo}? Saldo berjalan akan otomatis disesuaikan.`)) {
                              deleteCashTransaction(row.id);
                            }
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-stone-100 font-bold border-t border-roast-border text-roast-charcoal text-xs">
                <td colSpan={4} className="py-3 px-4 text-right">
                  TOTAL KAS MASUK (DEBIT) & KAS KELUAR (KREDIT):
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 bg-emerald-100/50">
                  +{formatRupiah(totalDebit)}
                </td>
                <td className="py-3 px-3 text-right text-rose-800 bg-rose-100/50">
                  -{formatRupiah(totalKredit)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-black text-roast-amber bg-amber-100/80">
                  {formatRupiah(summary.finalCashBalance)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Cash Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-roast-border">
            <h2 className="text-base font-bold text-roast-charcoal pb-2 border-b border-roast-border flex items-center gap-2">
              {txType === 'IN' ? (
                <>
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  Tambah Transaksi Kas Masuk (Penerimaan / Debit)
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                  Tambah Transaksi Kas Keluar (Pengeluaran / Kredit)
                </>
              )}
            </h2>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
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
                  <label className="block font-medium text-stone-700 mb-1">No. Bukti (BKM/BKK)</label>
                  <input
                    type="text"
                    value={evidenceNo}
                    onChange={(e) => setEvidenceNo(e.target.value)}
                    required
                    placeholder="BKM-05 atau BKK-05"
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Kategori Akun Kas</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CashCategory)}
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Penerimaan pembayaran termin PO Kafe Sejiwa"
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-roast-border">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-bold text-white rounded shadow-sm ${
                    txType === 'IN' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
