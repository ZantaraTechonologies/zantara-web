import { useRef, useState } from "react";
import WalletCard, { WalletCardHandle } from "../../components/wallet/WalletCard";
import FundWalletModal from "../../components/wallet/FundWalletModal";
import TransactionsList from "../../components/wallet/TransactionsList";
import QuickActions from "../../components/wallet/QuickActions";

import { Link } from "react-router-dom";

export default function WalletPage() {
  const [fundOpen, setFundOpen] = useState(false);
  const walletRef = useRef<WalletCardHandle>(null);

  const handleFundSuccess = () => {
    setFundOpen(false);
    // 🔁 Trigger the WalletCard’s refetch
    walletRef.current?.refresh();
    // (Optional) also refresh transactions if needed
    // txRef.current?.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wallet</h1>
          <p className="text-slate-500 font-medium">Manage your balance and track your spending</p>
        </div>
        <button 
          onClick={() => setFundOpen(true)}
          className="bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
        >
          <span>Fund Wallet</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <WalletCard ref={walletRef} onFund={() => setFundOpen(true)} />
          <TransactionsList />
        </div>
        
        <div className="space-y-8">
          <QuickActions />
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Support</h3>
            <p className="text-sm text-slate-600 mb-4">Need help with a transaction? Our team is available 24/7.</p>
            <a href="https://wa.me/2348146149773" target="_blank" className="w-full inline-flex items-center justify-center py-3 bg-slate-50 text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {fundOpen && (
        <FundWalletModal
          open={fundOpen}
          onClose={() => setFundOpen(false)}
          onSuccess={handleFundSuccess}
        />
      )}
    </div>
  );
}
