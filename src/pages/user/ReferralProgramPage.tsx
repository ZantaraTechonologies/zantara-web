import React from 'react';
import { useEarningsSummary } from '../../hooks/useReferral';
import { Users, Copy, Gift, ArrowRight, Wallet, Info, Zap, ShieldCheck } from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useAuthStore } from '../../store/auth/authStore';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ReferralProgramPage: React.FC = () => {
    const { data: stats, isLoading } = useEarningsSummary();
    const { user } = useAuthStore();
    const { currency } = useWalletStore();

    const referralCode = stats?.myReferralCode || user?.myReferralCode;

    const copyToClipboard = async (text: string, successMsg: string) => {
        console.log('Attempting to copy:', text);
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                toast.success(successMsg);
                return;
            }
        } catch (err) {
            console.warn('Navigator clipboard failed, trying fallback', err);
        }

        // Fallback for non-secure contexts or failed API
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                toast.success(successMsg);
            } else {
                throw new Error('execCommand copy failed');
            }
        } catch (fallbackErr) {
            console.error('Final copy fallback failed:', fallbackErr);
            toast.error('Could not copy automatically. Please select and copy manually.');
        }
    };

    const copyCode = () => {
        console.log('Copy Code clicked, code:', referralCode);
        if (!referralCode) {
            toast.error('Referral code not available yet. Please wait a moment.');
            return;
        }
        copyToClipboard(referralCode, 'Referral code copied!');
    };

    const copyLink = async () => {
        console.log('Copy Link clicked, code:', referralCode);
        if (!referralCode) {
            toast.error('Referral link not available yet.');
            return;
        }
        
        const link = `${window.location.origin}/register?ref=${referralCode}`;
        
        // Use Native Share API if available (especially for mobile users)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Zantara',
                    text: 'Join me on Zantara and start enjoying fast, secure digital payments!',
                    url: link,
                });
                return;
            } catch (err) {
                console.log('Native share failed or cancelled', err);
            }
        }

        // Fallback to clipboard
        copyToClipboard(link, 'Referral link copied!');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refer & Earn</h1>
                    <p className="text-slate-500 font-medium text-sm">Invite your network and build a stream of lifetime rewards.</p>
                </div>
                <Link 
                    to="/app/referral/wallet"
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors border border-emerald-100 w-fit"
                >
                    <Wallet size={18} />
                    Manage Earnings
                </Link>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center shrink-0">
                        <Gift className="text-emerald-500" size={48} />
                    </div>
                    
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Build a Lifetime Income Stream</h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                            Earn <span className="text-emerald-500 font-bold">commissions</span> instantly on <span className="font-bold text-slate-900">every single purchase</span> made by your referred friends. The more they use Zantara, the more you earn!
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mb-8 blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                     
                     <div className="space-y-1">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Spendable Balance</p>
                        <h3 className="text-3xl font-bold tracking-tight">{currency}{stats?.referralBalance?.toLocaleString() || '0'}</h3>
                     </div>

                     <Link 
                        to="/app/referral/redeem"
                        className="mt-6 flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all active:scale-95"
                     >
                        Redeem Now
                        <ArrowRight size={16} />
                     </Link>
                </div>
            </div>

            {/* Code and Link Sharing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Your Unique Referral Code</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <code className="text-lg font-bold text-slate-800 tracking-wider font-mono">{referralCode || '------'}</code>
                        <button 
                            onClick={copyCode}
                            className="bg-white text-slate-900 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Info size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Personal Invite Link</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-500 truncate mr-4">{window.location.origin.replace('https://', '').replace('http://', '')}/reg...{referralCode || ''}</span>
                        <button 
                            onClick={copyLink}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm active:scale-95"
                        >
                            Share Link
                        </button>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-8">Earning Protocol</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Progress line for desktop */}
                    <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-slate-50"></div>

                    {[
                        { step: '01', title: 'Share Link', desc: 'Securely transmit your unique referral code to friends and network.' },
                        { step: '02', title: 'Link Accounts', desc: 'New users link to your profile permanently when they sign up with your code.' },
                        { step: '03', title: 'Lifetime Yield', desc: 'Receive a commission automatically on every purchase they ever make.' }
                    ].map((item, idx) => (
                        <div key={idx} className="relative z-10 space-y-4 text-center md:text-left">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border italic ${idx === 2 ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-white text-emerald-500 border-slate-100'}`}>
                                {item.step}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{item.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <Zap size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Instant Settlement</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Rewards are credited to your earnings wallet the moment a referred friend's transaction is confirmed.</p>
                    </div>
                </div>
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Margin Protection</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">To keep the platform sustainable, rewards may be capped or skipped on extremely low-margin transactions.</p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <p className="text-center text-[10px] text-slate-400 font-medium">
                    * Referral rewards are calculated based on service profit margins. Multi-account fraud or referral gaming will result in immediate suspension.
                </p>
            </div>
        </div>
    );
};

export default ReferralProgramPage;
