import TransactionsList from "../../components/wallet/TransactionsList";

export default function Transactions() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction History</h1>
        <p className="text-slate-500 font-medium">Detailed log of all your activities</p>
      </header>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <TransactionsList />
      </div>
    </div>
  );
}
