import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Layers, 
    Cpu, 
    Network, 
    Tags, 
    Activity,
    Info,
    ArrowRight
} from 'lucide-react';
import CatalogRegistryTab from './CatalogRegistryTab';
import VendorGatewaysTab from './VendorGatewaysTab';
import FulfillmentLogicTab from './FulfillmentLogicTab';
import PricingStrategyTab from './PricingStrategyTab';
import CatalogInfrastructureTab from './CatalogInfrastructureTab';
import { Database } from 'lucide-react';

const AdminServiceHubPage: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'registry' | 'vendors' | 'fulfillment' | 'pricing' | 'infrastructure'>('registry');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    const tabs = [
        { id: 'registry', label: 'Catalog Registry', icon: Layers, desc: 'Identity & Structure' },
        { id: 'pricing', label: 'Pricing Strategy', icon: Tags, desc: 'Markups & Yield' },
        { id: 'vendors', label: 'Vendor Gateways', icon: Cpu, desc: 'API Connections' },
        { id: 'fulfillment', label: 'Fulfillment Logic', icon: Network, desc: 'Product Mappings' },
        { id: 'infrastructure', label: 'Infrastructure', icon: Database, desc: 'Master Data Controls' },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Product Lifecycle Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Service Center</h1>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-xl leading-relaxed uppercase tracking-tighter">
                        Unified command for <span className="text-emerald-400">Inventory</span>, <span className="text-indigo-400">Pricing</span>, and <span className="text-amber-400">Fulfillment</span> workflows.
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Catalog Status</p>
                        <p className="text-xs font-black text-white mt-1 uppercase tracking-tighter">Synchronized & Live</p>
                    </div>
                </div>
            </div>

            {/* Guided Workflow */}
            <div className="bg-gradient-to-r from-indigo-500/5 via-slate-900/50 to-slate-900/50 border border-indigo-500/10 rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <Info size={16} className="text-indigo-400 shrink-0" />
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Setup Workflow — Follow These Steps To Deploy a New Service Family</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                        { step: 1, tab: 'infrastructure', label: 'Infrastructure', action: 'Create Categories, Service Types & Brands', color: 'from-slate-800 to-slate-900' },
                        { step: 2, tab: 'registry', label: 'Identity & Variants', action: 'Register a Service Identity, then add Variants (SKUs)', color: 'from-slate-800 to-slate-900' },
                        { step: 3, tab: 'vendors', label: 'Vendor Gateways', action: 'Verify your Provider API connections are active', color: 'from-slate-800 to-slate-900' },
                        { step: 4, tab: 'fulfillment', label: 'Map Fulfillment', action: 'Link each Variant to a Provider SKU code', color: 'from-slate-800 to-slate-900' },
                        { step: 5, tab: 'pricing', label: 'Configure Pricing', action: 'Set profit markup rules by scope and user role', color: 'from-slate-800 to-slate-900' },
                    ].map(({ step, tab, label, action }) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={step}
                                onClick={() => setActiveTab(tab as any)}
                                className={`text-left p-5 rounded-2xl border transition-all group ${
                                    isActive
                                        ? 'bg-indigo-500/10 border-indigo-500/30'
                                        : 'bg-slate-950/50 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black mb-3 ${
                                    isActive ? 'bg-indigo-500 text-slate-950' : 'bg-white/5 text-slate-500'
                                }`}>
                                    {step}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-indigo-400' : 'text-white'}`}>{label}</p>
                                <p className="text-[9px] text-slate-600 font-medium leading-snug">{action}</p>
                            </button>
                        );
                    })}
                </div>
            </div>



            {/* Tab Content Area */}
            <div className="min-h-[500px] bg-slate-900/20 rounded-[3rem] p-1 border border-white/5">
                <div className="p-8 sm:p-10">
                    {activeTab === 'registry' && <CatalogRegistryTab />}
                    {activeTab === 'pricing' && <PricingStrategyTab />}
                    {activeTab === 'vendors' && <VendorGatewaysTab />}
                    {activeTab === 'fulfillment' && <FulfillmentLogicTab />}
                    {activeTab === 'infrastructure' && <CatalogInfrastructureTab />}
                </div>
            </div>
        </div>
    );
};

export default AdminServiceHubPage;
