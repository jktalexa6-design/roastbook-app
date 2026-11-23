'use client';

import React from 'react';
import { useRoastBook } from '@/context/RoastBookContext';
import { formatRupiah, formatKg, formatPercent, formatDateIndo } from '@/lib/formatters';
import { Printer, X, Coffee, CheckCircle2 } from 'lucide-react';

interface PrintReportViewProps {
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ onClose }) => {
  const {
    businessName,
    businessTagline,
    businessSubtitle,
    logoUrl,
    summary,
    stockMutations,
    directLabors,
    overheads,
    cashTransactions,
  } = useRoastBook();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-roast-border my-auto">
        {/* Print Toolbar (Hidden during print) */}
        <div className="no-print bg-stone-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Mode Cetak / Print Preview Laporan Laba Rugi & HPP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-roast-amber hover:bg-roast-caramel text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 space-y-6 text-stone-900 bg-white">
          {/* Official Letterhead */}
          <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-300 flex items-center justify-center bg-white flex-shrink-0 p-1 shadow-sm">
                  <img
                    src={logoUrl || '/logo.png'}
                    alt={businessName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight text-stone-900 uppercase">
                      {businessName}
                    </h1>
                    <span className="text-xs px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-700 border border-stone-300">
                      {businessTagline}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {businessSubtitle}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                Penyedia Pasokan Roasted Bean B2B Kafe, Hotel, Restoran & Retail Kemasan Valve
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold px-2 py-0.5 bg-stone-100 rounded border border-stone-300">
                LAPORAN KEUANGAN RESMI
              </span>
              <p className="mt-2 text-stone-600">
                Periode: <strong>November 2026</strong>
              </p>
              <p className="text-[11px] text-stone-500">
                Dicetak pada: {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {/* 1. Laporan Laba Rugi Operasional */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-300 pb-1">
              I. Laporan Laba Rugi Operasional (Income Statement)
            </h2>

            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="py-1.5 font-bold">1. Pendapatan Penjualan Roasted Bean ({formatKg(summary.totalSoldKg)})</td>
                  <td className="py-1.5 text-right font-bold text-emerald-900 font-mono">
                    {formatRupiah(summary.totalOmzetSales)}
                  </td>
                </tr>

                {/* HPP Section */}
                <tr className="border-b border-stone-200 text-stone-700">
                  <td className="py-1 pl-4">Harga Pokok Biji Sangrai Terjual (Kulak Weighted Average)</td>
                  <td className="py-1 text-right font-mono">{formatRupiah(summary.rawBeanHppSold)}</td>
                </tr>
                <tr className="border-b border-stone-200 text-stone-700">
                  <td className="py-1 pl-4">Tenaga Kerja Langsung (Packing, Grinding & QC)</td>
                  <td className="py-1 text-right font-mono">{formatRupiah(summary.totalTkl)}</td>
                </tr>
                <tr className="border-b border-stone-200 text-stone-700">
                  <td className="py-1 pl-4">Total Biaya Overhead (Kemasan Valve, Sewa, Listrik, Tester)</td>
                  <td className="py-1 text-right font-mono">{formatRupiah(summary.totalOverhead)}</td>
                </tr>
                <tr className="border-b border-stone-300 bg-stone-50 font-semibold">
                  <td className="py-1.5 font-bold">2. Total Harga Pokok Penjualan (HPP)</td>
                  <td className="py-1.5 text-right font-bold text-rose-800 font-mono">
                    ({formatRupiah(summary.totalHpp)})
                  </td>
                </tr>

                {/* Gross Profit */}
                <tr className="border-b-2 border-stone-400 bg-amber-50/70 font-bold">
                  <td className="py-2">LABA KOTOR (GROSS PROFIT) — Margin: {formatPercent(summary.grossMarginPercent)}</td>
                  <td className="py-2 text-right font-mono text-sm text-stone-900">
                    {formatRupiah(summary.grossProfit)}
                  </td>
                </tr>

                {/* Operating Expenses */}
                <tr className="border-b border-stone-200 text-stone-700">
                  <td className="py-1 pl-4">Beban Pemasaran Digital, Iklan & Sampel Kafe Baru</td>
                  <td className="py-1 text-right font-mono">{formatRupiah(summary.marketingExpense)}</td>
                </tr>
                <tr className="border-b border-stone-200 text-stone-700">
                  <td className="py-1 pl-4">Beban Gaji Admin Kantor & Software Pembukuan</td>
                  <td className="py-1 text-right font-mono">{formatRupiah(summary.adminExpense)}</td>
                </tr>
                <tr className="border-b border-stone-300 bg-stone-50 font-semibold">
                  <td className="py-1.5 font-bold">3. Total Beban Operasional Kantor</td>
                  <td className="py-1.5 text-right font-bold text-rose-800 font-mono">
                    ({formatRupiah(summary.totalOfficeExpenses)})
                  </td>
                </tr>

                {/* Net Profit */}
                <tr className="border-t-2 border-stone-900 bg-stone-100 font-extrabold text-sm">
                  <td className="py-2.5">
                    LABA BERSIH OPERASIONAL (NET PROFIT) — Margin: {formatPercent(summary.netMarginPercent)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-base text-stone-900">
                    {formatRupiah(summary.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Ringkasan Posisi Stok & HPP Unit */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-lg border border-stone-300 space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase">
                II. Posisi Persediaan Stok Akhir
              </h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Sisa Fisik Stok Gudang:</span>
                  <span className="font-bold">{formatKg(summary.endingStockKg)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HPP Rata-Rata per Kg:</span>
                  <span className="font-bold">{formatRupiah(summary.endingAvgHppPerKg)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-stone-200 pt-1 text-stone-900">
                  <span>Total Nilai Persediaan Akhir:</span>
                  <span>{formatRupiah(summary.endingStockValue)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-stone-300 space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase">
                III. Analisis HPP per Kemasan
              </h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>HPP All-In per Kg:</span>
                  <span className="font-bold">{formatRupiah(summary.hppAllInPerKg)} / Kg</span>
                </div>
                <div className="flex justify-between">
                  <span>HPP Kemasan Retail 200g:</span>
                  <span className="font-bold">{formatRupiah(summary.hppPerPouch200g)} / Pouch</span>
                </div>
                <div className="flex justify-between font-bold border-t border-stone-200 pt-1 text-emerald-800">
                  <span>Saldo Kas Akhir di Rekening:</span>
                  <span>{formatRupiah(summary.finalCashBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature / Approval Block */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="text-stone-500">Dibuat Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-stone-400 pt-1">Staf Pembukuan / Admin</p>
            </div>
            <div>
              <p className="text-stone-500">Diperiksa Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-stone-400 pt-1">Supervisor QC & Gudang</p>
            </div>
            <div>
              <p className="text-stone-500">Disetujui Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-stone-400 pt-1">Pemilik Usaha (Owner)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
