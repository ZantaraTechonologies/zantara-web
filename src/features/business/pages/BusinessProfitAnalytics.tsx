import React from 'react';
import { 
    LineChart, 
    BarChart, 
    PieChart, 
    Activity, 
    TrendingUp, 
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

const BusinessProfitAnalytics: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profit Analytics</h1>
                    <p className="text-slate-500">Deep dive into your margins, trends, and product performance.</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-sm font-bold text-blue-600">Daily</button>
                    <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors">Weekly</button>
                    <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors">Monthly</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Avg. Margin per User" 
                    value="12.4%" 
                    icon={TrendingUp} 
                    color="green"
                    trend={{ value: '1.2%', isPositive: true }}
                />
                <StatCard 
                    title="Highest Profitable Service" 
                    value="MTN Data" 
                    icon={Activity} 
                    color="blue"
                />
                <StatCard 
                    title="Customer Lifetime Value" 
                    value="₦4,500" 
                    icon={TrendingUp} 
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Profit Growth Trend</h3>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="text-center">
                            <LineChart className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm font-medium">Line chart showing profit over time</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Service Profit Contribution</h3>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="text-center">
                            <PieChart className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm font-medium">Pie chart showing profit split by service</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Comparison: Revenue vs Cost</h3>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="text-center">
                        <BarChart className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm font-medium">Bar chart comparing Revenue and Cost monthly</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfitAnalytics;
