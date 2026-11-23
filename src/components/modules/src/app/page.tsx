'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardModule } from '@/components/modules/DashboardModule';
import { StockModule } from '@/components/modules/StockModule';
import { OverheadModule } from '@/components/modules/OverheadModule';
import { HppModule } from '@/components/modules/HppModule';
import { CashbookModule } from '@/components/modules/CashbookModule';
import { PrintReportView } from '@/components/PrintReportView';
import { useRoastBook } from '@/context/RoastBookContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const { isLoaded } = useRoastBook();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-roast-warmbg text-stone-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-roast-amber border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat data pembukuan RoastBook...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-roast-warmbg">
      {/* Navbar with Tab navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrint={() => setShowPrintModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardModule />}
        {activeTab === 'stock' && <StockModule />}
        {activeTab === 'overhead' && <OverheadModule />}
        {activeTab === 'hpp' && <HppModule />}
        {activeTab === 'cashbook' && <CashbookModule />}
      </main>

      {/* Print View Modal */}
      {showPrintModal && (
        <PrintReportView onClose={() => setShowPrintModal(false)} />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-roast-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div>
            <strong>RoastBook POS & Accounting</strong> • Sistem Pembukuan Terpadu UMKM Roasted Bean Trading
          </div>
          <div className="text-stone-400">
            Metode Rata-Rata Tertimbang (Weighted Average) • Supabase PostgreSQL Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
