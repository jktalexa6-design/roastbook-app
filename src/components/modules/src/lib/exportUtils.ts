import {
  StockMutation,
  CashTransaction,
  DirectLabor,
  OverheadCost,
} from '@/types';
import { calculateAccountingSummary } from './calculations';

/**
 * Downloads a string content as a file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates CSV with UTF-8 BOM so Microsoft Excel opens Indonesian Rupiah / characters without garbling
 */
export function exportToCsv(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(';'), // Semicolon is default Excel delimiter for European / Indonesian locale
    ...data.map((row) =>
      headers
        .map((field) => {
          let val = row[field];
          if (val === null || val === undefined) val = '';
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
        .join(';')
    ),
  ];

  // UTF-8 BOM: \uFEFF
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Comprehensive Accounting Workbook in CSV / Excel format
 */
export function exportFullAccountingReport(
  summary: ReturnType<typeof calculateAccountingSummary>,
  stockMutations: StockMutation[],
  cashTransactions: CashTransaction[],
  directLabors: DirectLabor[],
  overheads: OverheadCost[],
  businessName: string = 'RoastBook POS & Accounting',
  businessSubtitle: string = 'Sistem Pembukuan & HPP Otomatis • UMKM Jual Beli Biji Kopi Sangrai'
) {
  const lines: string[] = [];

  lines.push(`=== ${businessName.toUpperCase()} - LAPORAN KEUANGAN & STOK ===`);
  lines.push(`Unit Usaha:;${businessSubtitle}`);
  lines.push(`Tanggal Cetak:;${new Date().toLocaleString('id-ID')}`);
  lines.push('');

  // 1. Ringkasan Laba Rugi
  lines.push('--- 1. RINGKASAN LAPORAN LABA RUGI OPERASIONAL ---');
  lines.push(`Total Omzet Penjualan (Rp);${summary.totalOmzetSales}`);
  lines.push(`Total Volume Terjual (Kg);${summary.totalSoldKg}`);
  lines.push(`Harga Pokok Penjualan / HPP Total (Rp);${summary.totalHpp}`);
  lines.push(`Laba Kotor / Gross Profit (Rp);${summary.grossProfit}`);
  lines.push(`Gross Profit Margin (%);${summary.grossMarginPercent.toFixed(2)}%`);
  lines.push(`Biaya Pemasaran & Sampel (Rp);${summary.marketingExpense}`);
  lines.push(`Biaya Gaji Admin & Operasional Kantor (Rp);${summary.adminExpense}`);
  lines.push(`Total Biaya Operasional Kantor (Rp);${summary.totalOfficeExpenses}`);
  lines.push(`LABA BERSIH OPERASIONAL (NET PROFIT) (Rp);${summary.netProfit}`);
  lines.push(`Net Profit Margin (%);${summary.netMarginPercent.toFixed(2)}%`);
  lines.push(`Saldo Kas Akhir (Rp);${summary.finalCashBalance}`);
  lines.push(`Total Nilai Aset Stok Tersedia (Rp);${summary.endingStockValue}`);
  lines.push('');

  // 2. Struktur HPP
  lines.push('--- 2. STRUKTUR HARGA POKOK PENJUALAN (HPP) ---');
  lines.push(`Persediaan Awal Roasted Bean;${summary.initialStockValue}`);
  lines.push(`Pembelian Bersih Roasted Bean;${summary.totalPurchasesValue}`);
  lines.push(`Persediaan Akhir Roasted Bean;${summary.endingStockValue}`);
  lines.push(`Harga Pokok Biji Sangrai Terjual (Rp);${summary.rawBeanHppSold}`);
  lines.push(`Total Tenaga Kerja Langsung Packing & QC (Rp);${summary.totalTkl}`);
  lines.push(`Total Biaya Overhead Kemasan & Gudang (Rp);${summary.totalOverhead}`);
  lines.push(`TOTAL HPP (Rp);${summary.totalHpp}`);
  lines.push(`HPP All-In per Kg (Rp/Kg);${summary.hppAllInPerKg}`);
  lines.push(`HPP per Kemasan Retail 200g (Rp/Pouch);${summary.hppPerPouch200g}`);
  lines.push('');

  // 3. Kartu Stok
  lines.push('--- 3. MUTASI KARTU PERSEDIAAN ROASTED BEAN (AVERAGE METHOD) ---');
  lines.push('Tanggal;No Bukti;Varian & Profil Sangrai;Tipe;Masuk (Kg);Harga Beli/Kg;Nilai Masuk (Rp);Keluar (Kg);Nilai Pokok Keluar (Rp);Sisa Stok (Kg);HPP Avg/Kg (Rp);Nilai Persediaan (Rp);Pelanggan/Supplier');
  stockMutations.forEach((s) => {
    lines.push(
      `${s.date};${s.evidenceNo};"${s.variant}";${s.type};${s.inKg};${s.buyPricePerKg};${s.inTotal};${s.outKg};${s.outTotalCost};${s.balanceKg};${s.avgHppPerKg.toFixed(2)};${s.balanceValue};"${s.customerOrVendor || ''}"`
    );
  });
  lines.push('');

  // 4. Tenaga Kerja Langsung
  lines.push('--- 4. TENAGA KERJA LANGSUNG (TKL) ---');
  lines.push('Posisi Kerja;Jumlah Orang;Upah Pokok/Bulan;Tunjangan Lembur;Total (Rp)');
  directLabors.forEach((t) => {
    lines.push(`"${t.role}";${t.headcount};${t.monthlyWage};${t.allowanceOvertime};${t.total}`);
  });
  lines.push('');

  // 5. Biaya Overhead
  lines.push('--- 5. BIAYA OVERHEAD KEMASAN & GUDANG ---');
  lines.push('Komponen Overhead;Kategori;Nominal (Rp);Porsi (%);Keterangan');
  overheads.forEach((o) => {
    lines.push(`"${o.name}";${o.category};${o.amount};${o.portionPercent}%;"${o.description || ''}"`);
  });
  lines.push('');

  // 6. Buku Kas Umum
  lines.push('--- 6. BUKU KAS UMUM (ARUS KAS) ---');
  lines.push('Tanggal;No Bukti;Keterangan;Kategori;Tipe;Penerimaan (Debit);Pengeluaran (Kredit);Saldo Berjalan (Rp)');
  cashTransactions.forEach((c) => {
    const debit = c.type === 'IN' ? c.amount : 0;
    const credit = c.type === 'OUT' ? c.amount : 0;
    lines.push(
      `${c.date};${c.evidenceNo};"${c.description}";"${c.category}";${c.type};${debit};${credit};${c.runningBalance || 0}`
    );
  });

  const fullContent = '\uFEFF' + lines.join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = businessName.replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(fullContent, `${safeName}_Laporan_Lengkap_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}
