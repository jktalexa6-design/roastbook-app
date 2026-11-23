'use client';

import React, { useState, useRef } from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah } from '@/lib/formatters';
import { exportFullAccountingReport } from '@/lib/exportUtils';
import {
  Coffee,
  LayoutDashboard,
  Boxes,
  Users,
  Calculator,
  BookOpen,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Edit3,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenPrint }) => {
  const {
    businessName,
    businessTagline,
    businessSubtitle,
    logoUrl,
    updateBusinessInfo,
    resetBusinessInfo,
    updateLogoUrl,
    resetLogoUrl,
    summary,
    stockMutations,
    cashTransactions,
    directLabors,
    overheads,
    resetToDefaultData,
    resetToZeroData,
  } = useRoastBook();

  // Branding & Logo edit modal state
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [tempName, setTempName] = useState(businessName);
  const [tempTagline, setTempTagline] = useState(businessTagline);
  const [tempSubtitle, setTempSubtitle] = useState(businessSubtitle);
  const [tempLogoUrl, setTempLogoUrl] = useState(logoUrl);

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditTitle = () => {
    setTempName(businessName);
    setTempTagline(businessTagline);
    setTempSubtitle(businessSubtitle);
    setTempLogoUrl(logoUrl);
    setShowEditTitleModal(true);
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessInfo(tempName, tempTagline, tempSubtitle);
    if (tempLogoUrl !== logoUrl) {
      updateLogoUrl(tempLogoUrl);
    }
    setShowEditTitleModal(false);
  };

  const handleResetTitleAndLogo = () => {
    resetBusinessInfo();
    resetLogoUrl();
    setTempName('RoastBook');
    setTempTagline('POS & Accounting');
    setTempSubtitle('Sistem Pembukuan & HPP Otomatis • UMKM Jual Beli Biji Kopi Sangrai');
    setTempLogoUrl('/logo.png');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 2 MB agar performa aplikasi tetap cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setTempLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    exportFullAccountingReport(
      summary,
      stockMutations,
      cashTransactions,
      directLabors,
      overheads,
      `${businessName} ${businessTagline}`,
      businessSubtitle
    );
  };

  const handleExecuteResetToZero = () => {
    resetToZeroData();
    setShowResetModal(false);
    alert('Pembukuan berhasil dikosongkan (0 Kg stok & Kas Rp 0). Silakan mulai mencatat transaksi riil Anda dari awal.');
  };

  const handleExecuteResetToDemo = () => {
    resetToDefaultData();
    setShowResetModal(false);
    alert('Data simulasi contoh (demo seed data) berhasil dimuat kembali.');
  };

  const navItems = [
    { id: 'dashboard', label: '1. Ringkasan Laba Rugi', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: '2. Kartu Persediaan Stok', shortLabel: 'Kartu Stok', icon: Boxes },
    { id: 'overhead', label: '3. Biaya Overhead & TKL', shortLabel: 'Overhead & TKL', icon: Users },
    { id: 'hpp', label: '4. Kalkulator HPP & Pricing', shortLabel: 'Kalkulator HPP', icon: Calculator },
    { id: 'cashbook', label: '5. Buku Kas Umum', shortLabel: 'Buku Kas', icon: BookOpen },
  ];

  return (
    <header className="bg-roast-charcoal text-roast-warmbg sticky top-0 z-40 border-b border-stone-800 shadow-md">
      {/* Top Banner / Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3 border-b border-stone-800/80">
          {/* Logo & UMKM Identity (Bisa diklik untuk ubah judul & ganti logo) */}
          <div className="flex items-center gap-3">
            <div
              onClick={handleOpenEditTitle}
              className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shadow-md shadow-amber-950/40 border border-stone-700/80 flex items-center justify-center flex-shrink-0 cursor-pointer group hover:border-amber-400 hover:scale-105 transition-all"
              title="Klik untuk mengubah logo & identitas usaha Anda"
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
            <div
              onClick={handleOpenEditTitle}
              className="group cursor-pointer select-none"
              title="Klik untuk mengubah nama usaha, logo & judul utama aplikasi"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                  {businessName}{' '}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-roast-amber/30 text-amber-300 font-medium border border-amber-500/30">
                    {businessTagline}
                  </span>
                  <Edit3 className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-300 transition-colors opacity-70 group-hover:opacity-100" />
                </span>
              </div>
              <p className="text-xs text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                {businessSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Cash & Stock Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 border border-stone-700/60 text-xs">
              <div className="flex items-center gap-1 text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Kas Akhir:</span>
                <span className="font-semibold text-emerald-400">{formatRupiah(summary.finalCashBalance)}</span>
              </div>
              <span className="text-stone-600">|</span>
              <div className="flex items-center gap-1 text-stone-300">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Stok:</span>
                <span className="font-semibold text-amber-300">{summary.endingStockKg.toFixed(1)} Kg</span>
              </div>
            </div>

            {/* Tombol Ubah Judul & Ganti Logo */}
            <button
              onClick={handleOpenEditTitle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors"
              title="Ubah Logo, Judul Utama & Nama Usaha Kopi Anda"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Ganti Logo / Brand</span>
            </button>

            {/* Action Buttons */}
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors border border-stone-700"
              title="Cetak Laporan Laba Rugi / Print View"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-roast-amber hover:bg-roast-caramel text-white shadow-sm transition-colors"
              title="Export Semua Modul ke File CSV / Excel (.xlsx compatible)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel (CSV)</span>
            </button>

            {/* Tombol Pilihan Reset (Mulai dari Nol / Muat Ulang Demo) */}
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700 transition-colors"
              title="Reset Pembukuan Mulai dari Nol atau Muat Ulang Demo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Pembukuan</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-roast-amber text-white shadow-sm shadow-amber-950/40 font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal Dialog 1: Ubah Identitas Usaha & Ganti Logo */}
      {showEditTitleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-stone-900">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-roast-border animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-roast-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-roast-amber flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-roast-charcoal">
                    Pengaturan Logo & Identitas Usaha
                  </h2>
                  <p className="text-xs text-stone-500">
                    Ganti logo aplikasi dan sesuaikan nama brand kopi roastery Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditTitleModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTitle} className="mt-4 space-y-5 text-xs">
              {/* Bagian Ganti Logo */}
              <div className="p-4 bg-stone-50 rounded-xl border border-roast-border space-y-3">
                <label className="block font-bold text-stone-800 text-xs">
                  Logo Aplikasi / Brand Usaha
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Logo Preview */}
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400 bg-white p-1.5 flex items-center justify-center shadow-inner flex-shrink-0 overflow-hidden relative group">
                    <img
                      src={tempLogoUrl || '/logo.png'}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>

                  {/* Actions for Logo */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-roast-amber hover:bg-roast-caramel text-white font-bold rounded-lg transition-colors shadow-sm text-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTempLogoUrl('/logo.png')}
                        className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium rounded-lg text-xs transition-colors"
                      >
                        Pakai Logo Default RoastBook
                      </button>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] text-stone-500 mb-0.5">
                        Atau masukkan link / URL gambar logo eksternal:
                      </label>
                      <input
                        type="text"
                        value={tempLogoUrl}
                        onChange={(e) => setTempLogoUrl(e.target.value)}
                        placeholder="Contoh: https://i.imgur.com/your-logo.png atau /logo.png"
                        className="w-full px-2.5 py-1.5 border border-roast-border rounded-lg bg-white focus:outline-none focus:border-roast-amber text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian Teks Identitas Usaha */}
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    1. Nama Brand / Usaha Utama
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Contoh: RoastBook, Kopi Sejiwa Roastery, Gayo Specialty"
                    required
                    className="w-full px-3 py-2 text-sm font-bold border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    2. Label / Badge Tagline
                  </label>
                  <input
                    type="text"
                    value={tempTagline}
                    onChange={(e) => setTempTagline(e.target.value)}
                    placeholder="Contoh: POS & Accounting, Roastery Trading, B2B Supplies"
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    3. Subjudul / Deskripsi Usaha
                  </label>
                  <textarea
                    rows={2}
                    value={tempSubtitle}
                    onChange={(e) => setTempSubtitle(e.target.value)}
                    placeholder="Contoh: Sistem Pembukuan & HPP Otomatis • UMKM Jual Beli Biji Kopi Sangrai"
                    required
                    className="w-full px-3 py-2 border border-roast-border rounded-lg focus:outline-none focus:border-roast-amber leading-relaxed"
                  />
                </div>
              </div>

              {/* Template Pilihan Cepat */}
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 block">
                  Pilihan Rekomendasi Cepat (Klik untuk menerapkan):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTempName('RoastBook');
                      setTempTagline('POS & Accounting');
                      setTempSubtitle('Sistem Pembukuan & HPP Otomatis • UMKM Jual Beli Biji Kopi Sangrai');
                      setTempLogoUrl('/logo.png');
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-800 rounded border border-amber-200 text-[11px] font-medium"
                  >
                    Default RoastBook
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName('Kopi Baraya Roastery');
                      setTempTagline('B2B Coffee Supplier');
                      setTempSubtitle('Penyuplai Biji Kopi Sangrai Kafe, Hotel, Restoran & Retail');
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-800 rounded border border-amber-200 text-[11px] font-medium"
                  >
                    Kopi Baraya Roastery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName('Sentra Kopi Nusantara');
                      setTempTagline('Roasted Bean Trading');
                      setTempSubtitle('Unit Dagang Biji Kopi Sangrai Single Origin & House Blend Espresso');
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-800 rounded border border-amber-200 text-[11px] font-medium"
                  >
                    Sentra Kopi Nusantara
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-roast-border">
                <button
                  type="button"
                  onClick={handleResetTitleAndLogo}
                  className="text-stone-500 hover:text-stone-700 underline text-xs"
                >
                  Kembalikan ke Default
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditTitleModal(false)}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-roast-amber hover:bg-roast-caramel text-white font-bold rounded-lg shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog 2: Pilihan Reset Pembukuan (Mulai dari Nol vs Muat Ulang Demo) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-stone-900">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-roast-border animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-roast-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-roast-charcoal">
                    Pilihan Reset & Mulai Pembukuan
                  </h2>
                  <p className="text-xs text-stone-500">
                    Tentukan apakah ingin mengosongkan data untuk operasional riil atau memuat data simulasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {/* Pilihan 1: Mulai Pembukuan Baru dari Nol */}
              <div className="p-4 rounded-xl border-2 border-stone-300 hover:border-roast-amber bg-stone-50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-roast-charcoal flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    1. Mulai Pembukuan Baru dari Nol (Data Bersih)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Operasional Riil
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Mengosongkan seluruh mutasi stok (0 Kg), mengosongkan buku kas (Rp 0), menghapus data TKL dan overhead. Sangat cocok jika Anda siap memulai pencatatan pembukuan riil UMKM kopi Anda sendiri.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('YAKIN INGIN MENGOSONGKAN SELURUH DATA? Seluruh mutasi stok dan transaksi kas akan dihapus menjadi 0 untuk memulai pembukuan baru.')) {
                        handleExecuteResetToZero();
                      }
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Semua Data & Mulai dari Nol</span>
                  </button>
                </div>
              </div>

              {/* Pilihan 2: Muat Ulang Data Simulasi Contoh */}
              <div className="p-4 rounded-xl border border-roast-border hover:border-amber-400 bg-amber-50/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-roast-charcoal flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-roast-amber" />
                    2. Muat Ulang Data Simulasi Contoh (Demo Seed)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Mode Latihan / Demo
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Mengisi kembali sistem dengan simulasi bulan berjalan (Saldo awal Rp 65 jt, stok 150 kg, pembelian 750 kg, dan penjualan 650 kg) untuk demonstrasi fitur dan rumus.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Muat ulang data simulasi contoh bulan berjalan? Data saat ini akan digantikan dengan data demo.')) {
                        handleExecuteResetToDemo();
                      }
                    }}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-amber-300 font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Muat Ulang Data Simulasi (Demo)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-roast-border">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
