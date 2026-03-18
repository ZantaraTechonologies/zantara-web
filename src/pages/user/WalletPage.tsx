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
          className="bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Priority Support</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Need help with a transaction or bill? Our Zantara support team is available 24/7.</p>
            <a 
              href={import.meta.env.VITE_WHATSAPP_SUPPORT_URL} 
              target="_blank" 
              className="w-full inline-flex items-center justify-center py-4 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-sm"
            >
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
