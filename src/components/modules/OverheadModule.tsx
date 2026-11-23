'use client';

import React, { useState } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatPercent } from '@/lib/formatters';
import { DirectLabor, OverheadCost, OverheadCategory } from '@/types';
import {
  Users,
  Layers,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  Building2,
  PackageCheck,
  Zap,
} from 'lucide-react';

export const OverheadModule: React.FC = () => {
  const {
    directLabors,
    addDirectLabor,
    updateDirectLabor,
    deleteDirectLabor,
    overheads,
    addOverheadCost,
    updateOverheadCost,
    deleteOverheadCost,
    syncTklAndOverheadToCash,
    summary,
  } = useRoastBook();

  // TKL modal/form state
  const [showAddTkl, setShowAddTkl] = useState(false);
  const [tklRole, setTklRole] = useState('');
  const [tklHeadcount, setTklHeadcount] = useState(1);
  const [tklWage, setTklWage] = useState(3000000);
  const [tklOvertime, setTklOvertime] = useState(300000);

  // Overhead modal/form state
  const [showAddOvh, setShowAddOvh] = useState(false);
  const [ovhName, setOvhName] = useState('');
  const [ovhCategory, setOvhCategory] = useState<OverheadCategory>('Variabel');
  const [ovhAmount, setOvhAmount] = useState(1000000);
  const [ovhPortion, setOvhPortion] = useState(100);
  const [ovhDesc, setOvhDesc] = useState('');

  // Sync notification
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleAddTkl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tklRole) return;
    addDirectLabor({
      role: tklRole,
      headcount: Number(tklHeadcount),
      monthlyWage: Number(tklWage),
      allowanceOvertime: Number(tklOvertime),
    });
    setTklRole('');
    setShowAddTkl(false);
  };

  const handleAddOvh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ovhName) return;
    addOverheadCost({
      name: ovhName,
      category: ovhCategory,
      amount: Number(ovhAmount),
      portionPercent: Number(ovhPortion),
      description: ovhDesc,
    });
    setOvhName('');
    setOvhDesc('');
    setShowAddOvh(false);
  };

  const handleSyncToCash = () => {
    const res = syncTklAndOverheadToCash();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-roast-border">
        <div>
          <h1 className="text-2xl font-bold text-roast-charcoal tracking-tight flex items-center gap-2">
            Biaya Overhead Kemasan & Tenaga Kerja Langsung (TKL)
          </h1>
          <p className="text-sm text-roast-subtle mt-0.5">
            Komponen penambah HPP: Upah staf repacking & QC, kemasan valve, listrik grinder, sewa ruang simpan, dan tester
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToCash}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors border border-stone-700"
            title="Catat beban TKL dan Overhead ke Buku Kas Umum sebagai pengeluaran bulan berjalan"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sinkronkan ke Buku Kas</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>Total TKL (Packing & QC)</span>
            <Users className="w-4 h-4 text-roast-amber" />
          </div>
          <div className="text-xl font-bold text-roast-charcoal mt-1">
            {formatRupiah(summary.totalTkl)}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            {directLabors.reduce((sum, d) => sum + d.headcount, 0)} Pekerja Operasional
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>Overhead Variabel</span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {formatRupiah(summary.variableOverhead)}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Kemasan valve, ongkir, tester cupping</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-roast-border shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-roast-subtle font-medium mb-1">
            <span>Overhead Tetap & Semi-Var</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-800 mt-1">
            {formatRupiah(summary.fixedOverhead + summary.semiVariableOverhead)}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Tetap: {formatRupiah(summary.fixedOverhead)} | Semi: {formatRupiah(summary.semiVariableOverhead)}
          </span>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-roast-charcoal text-white p-4 rounded-xl shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-stone-300 font-medium mb-1">
            <span>TOTAL BEBAN OVERHEAD & TKL</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 mt-1">
            {formatRupiah(summary.totalTkl + summary.totalOverhead)}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            Ditambahkan ke HPP Biji Terjual
          </span>
        </div>
      </div>

      {/* BAGIAN A: TENAGA KERJA LANGSUNG (TKL) */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-roast-parchment/60 border-b border-roast-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-roast-amber" />
            <h2 className="font-bold text-sm text-roast-charcoal">
              Bagian A: Tenaga Kerja Langsung (TKL) Repacking & Quality Control
            </h2>
          </div>
          <button
            onClick={() => setShowAddTkl(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-roast-amber hover:bg-roast-caramel text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Posisi</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-700 font-bold border-b border-roast-border">
                <th className="py-2.5 px-4">Posisi Kerja</th>
                <th className="py-2.5 px-3 text-center">Jumlah (Orang)</th>
                <th className="py-2.5 px-3 text-right">Upah Pokok / Bulan (Rp)</th>
                <th className="py-2.5 px-3 text-right">Tunjangan & Lembur (Rp)</th>
                <th className="py-2.5 px-4 text-right font-black text-roast-charcoal bg-amber-50/50">
                  Total TKL / Bulan (Rp)
                </th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roast-border text-stone-800">
              {directLabors.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/20">
                  <td className="py-2.5 px-4 font-semibold text-roast-charcoal">
                    {item.role}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800">
                      {item.headcount} Orang
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-stone-600">
                    {formatRupiah(item.monthlyWage)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-stone-600">
                    {formatRupiah(item.allowanceOvertime)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-roast-amber bg-amber-50/30">
                    {formatRupiah(item.total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus posisi ${item.role}?`)) {
                          deleteDirectLabor(item.id);
                        }
                      }}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-100 font-bold border-t border-roast-border text-roast-charcoal">
                <td colSpan={4} className="py-2.5 px-4 text-right">
                  TOTAL BIAYA TENAGA KERJA LANGSUNG (TKL):
                </td>
                <td className="py-2.5 px-4 text-right text-sm font-black text-roast-amber bg-amber-100/60">
                  {formatRupiah(summary.totalTkl)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* BAGIAN B: BIAYA OVERHEAD PENANGANAN & KEMASAN */}
      <div className="bg-white rounded-xl border border-roast-border shadow-warm-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-roast-parchment/60 border-b border-roast-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-roast-amber" />
            <h2 className="font-bold text-sm text-roast-charcoal">
              Bagian B: Biaya Overhead Penanganan, Kemasan & Ruang Simpan
            </h2>
          </div>
          <button
            onClick={() => setShowAddOvh(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-roast-amber hover:bg-roast-caramel text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Komponen Overhead</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-700 font-bold border-b border-roast-border">
                <th className="py-2.5 px-4">Komponen Overhead</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Nominal Anggaran (Rp)</th>
                <th className="py-2.5 px-3 text-center">Alokasi Porsi (%)</th>
                <th className="py-2.5 px-4 text-right font-black text-roast-charcoal bg-amber-50/50">
                  Beban Efektif (Rp)
                </th>
                <th className="py-2.5 px-4">Keterangan / Spesifikasi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roast-border text-stone-800">
              {overheads.map((item) => {
                const effective = item.amount * (item.portionPercent / 100);
                return (
                  <tr key={item.id} className="hover:bg-amber-50/20">
                    <td className="py-2.5 px-4 font-semibold text-roast-charcoal">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.category === 'Tetap'
                          ? 'bg-blue-100 text-blue-800'
                          : item.category === 'Variabel'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-stone-600">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">
                      {item.portionPercent}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-roast-amber bg-amber-50/30">
                      {formatRupiah(effective)}
                    </td>
                    <td className="py-2.5 px-4 text-stone-500 text-[11px]">
                      {item.description || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus komponen overhead ${item.name}?`)) {
                            deleteOverheadCost(item.id);
                          }
                        }}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-stone-100 font-bold border-t border-roast-border text-roast-charcoal">
                <td colSpan={4} className="py-2.5 px-4 text-right">
                  TOTAL BIAYA OVERHEAD PENANGANAN & KEMASAN:
                </td>
                <td className="py-2.5 px-4 text-right text-sm font-black text-roast-amber bg-amber-100/60">
                  {formatRupiah(summary.totalOverhead)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modals for Add TKL */}
      {showAddTkl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-roast-border">
            <h2 className="text-base font-bold text-roast-charcoal pb-2 border-b border-roast-border flex items-center gap-2">
              <Users className="w-5 h-5 text-roast-amber" />
              Tambah Posisi Tenaga Kerja Langsung (TKL)
            </h2>
            <form onSubmit={handleAddTkl} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nama Posisi / Pekerjaan</label>
                <input
                  type="text"
                  value={tklRole}
                  onChange={(e) => setTklRole(e.target.value)}
                  placeholder="Contoh: Staf Labeling & Grinding"
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Jumlah Orang</label>
                  <input
                    type="number"
                    min="1"
                    value={tklHeadcount}
                    onChange={(e) => setTklHeadcount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Upah Pokok / Bulan (Rp)</label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={tklWage}
                    onChange={(e) => setTklWage(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tunjangan & Lembur / Orang (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={tklOvertime}
                  onChange={(e) => setTklOvertime(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-roast-amber font-bold text-right text-xs">
                Total Biaya: {formatRupiah(tklHeadcount * (tklWage + tklOvertime))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTkl(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-roast-amber hover:bg-roast-caramel text-white font-bold rounded shadow-sm"
                >
                  Simpan TKL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals for Add Overhead */}
      {showAddOvh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-roast-border">
            <h2 className="text-base font-bold text-roast-charcoal pb-2 border-b border-roast-border flex items-center gap-2">
              <Layers className="w-5 h-5 text-roast-amber" />
              Tambah Komponen Biaya Overhead
            </h2>
            <form onSubmit={handleAddOvh} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nama Komponen Overhead</label>
                <input
                  type="text"
                  value={ovhName}
                  onChange={(e) => setOvhName(e.target.value)}
                  placeholder="Contoh: Kemasan Pouch Flat Bottom 200g Valve"
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Kategori</label>
                  <select
                    value={ovhCategory}
                    onChange={(e) => setOvhCategory(e.target.value as OverheadCategory)}
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  >
                    <option value="Variabel">Variabel</option>
                    <option value="Tetap">Tetap</option>
                    <option value="Semi-Variabel">Semi-Variabel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Porsi Alokasi (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={ovhPortion}
                    onChange={(e) => setOvhPortion(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Nominal Anggaran (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={ovhAmount}
                  onChange={(e) => setOvhAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Keterangan / Spesifikasi</label>
                <input
                  type="text"
                  value={ovhDesc}
                  onChange={(e) => setOvhDesc(e.target.value)}
                  placeholder="Deskripsi bahan, vendor, daya listrik..."
                  className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-roast-amber font-bold text-right text-xs">
                Beban Efektif: {formatRupiah(ovhAmount * (ovhPortion / 100))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOvh(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-roast-amber hover:bg-roast-caramel text-white font-bold rounded shadow-sm"
                >
                  Simpan Overhead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
