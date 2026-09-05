import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Send,
    CheckCheck,
    Eye,
    Reply,
    Target,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Loader2,
    Trophy,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

type Overview = {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
    conversionRate: number;
    revenueGenerated: number;
};

type DailyStat = {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
};

type CampaignStat = {
    id: number;
    name: string;
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    replies: number;
    revenue: number;
};

type TopCampaign = {
    name: string;
    sent: number;
    delivered: number;
    read: number;
    revenue: number;
};

type CustomerGrowthPoint = {
    date: string;
    newContacts: number;
    totalContacts: number;
};

type RevenueDataPoint = {
    date: string;
    revenue: number;
    orders: number;
};

type Props = {
    overview: Overview;
    dailyStats: DailyStat[];
    campaignStats: CampaignStat[];
    topCampaigns: TopCampaign[];
    customerGrowth: CustomerGrowthPoint[];
    revenueData: RevenueDataPoint[];
};

const DATE_RANGES = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: 'custom', label: 'Custom' },
];

const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
};

export default function WhatsAppAnalytics({
    overview,
    dailyStats,
    campaignStats,
    topCampaigns,
    customerGrowth,
    revenueData,
}: Props) {
    const [activeRange, setActiveRange] = useState('30d');

    const kpiCards = [
        {
            label: 'Total Sent',
            value: overview.totalSent.toLocaleString(),
            icon: Send,
            color: 'from-emerald-500 to-emerald-600',
            trend: '+12.5%',
            up: true,
        },
        {
            label: 'Delivery Rate',
            value: `${overview.deliveryRate.toFixed(1)}%`,
            icon: CheckCheck,
            color: 'from-blue-500 to-blue-600',
            trend: '+2.1%',
            up: true,
        },
        {
            label: 'Read Rate',
            value: `${overview.readRate.toFixed(1)}%`,
            icon: Eye,
            color: 'from-purple-500 to-purple-600',
            trend: '+3.2%',
            up: true,
        },
        {
            label: 'Reply Rate',
            value: `${overview.replyRate.toFixed(1)}%`,
            icon: Reply,
            color: 'from-amber-500 to-amber-600',
            trend: '+4.5%',
            up: true,
        },
        {
            label: 'Conversion Rate',
            value: `${overview.conversionRate.toFixed(1)}%`,
            icon: Target,
            color: 'from-teal-500 to-teal-600',
            trend: '+2.8%',
            up: true,
        },
        {
            label: 'Revenue Generated',
            value: formatBDT(overview.revenueGenerated),
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
            trend: '+18.4%',
            up: true,
        },
    ];

    const funnelData = [
        { name: 'Sent', value: overview.totalSent, fill: '#10B981' },
        { name: 'Delivered', value: overview.totalDelivered, fill: '#3B82F6' },
        { name: 'Read', value: overview.totalRead, fill: '#8B5CF6' },
        { name: 'Replied', value: Math.round(overview.totalRead * (overview.replyRate / 100)), fill: '#F59E0B' },
        { name: 'Converted', value: Math.round(overview.totalSent * (overview.conversionRate / 100)), fill: '#EC4899' },
    ];

    const topCampaignsRanked = [...topCampaigns].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

    return (
        <>
            <Head title="WhatsApp Analytics" />

            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/30 md:p-8"
                >
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                                <BarChart3 size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Analytics</h1>
                                <p className="mt-1 text-sm text-emerald-100">Performance insights and campaign metrics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
                            {DATE_RANGES.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => setActiveRange(range.id)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        activeRange === range.id
                                            ? 'bg-white text-emerald-700 shadow-lg'
                                            : 'text-white/80 hover:bg-white/10'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* KPI Cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {kpiCards.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50"
                        >
                            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${kpi.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />
                            <div className="relative">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${kpi.color} p-2.5`}>
                                        <kpi.icon size={18} className="text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                                        <ArrowUpRight size={14} />
                                        {kpi.trend}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tracking-tight text-white">{kpi.value}</p>
                                <p className="mt-1 text-sm text-slate-400">{kpi.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Charts Grid */}
                <section className="grid gap-6 lg:grid-cols-2">
                    {/* Messages Sent Over Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm lg:col-span-2"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Messages Sent Over Time</h3>
                                <p className="text-sm text-slate-400">Daily message volume and delivery performance</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="text-slate-400">Sent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <span className="text-slate-400">Delivered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                    <span className="text-slate-400">Read</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-80">
                            {dailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyStats}>
                                        <defs>
                                            <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradientDelivered" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradientRead" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                        <YAxis stroke="#64748B" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                            }}
                                            labelStyle={{ color: '#F8FAFC' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sent"
                                            stroke="#10B981"
                                            fillOpacity={1}
                                            fill="url(#gradientSent)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="delivered"
                                            stroke="#3B82F6"
                                            fillOpacity={1}
                                            fill="url(#gradientDelivered)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="read"
                                            stroke="#6366F1"
                                            fillOpacity={1}
                                            fill="url(#gradientRead)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No data available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Delivery Funnel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Delivery Funnel</h3>
                            <p className="text-sm text-slate-400">Message journey from send to conversion</p>
                        </div>
                        <div className="space-y-4">
                            {funnelData.map((item, i) => {
                                const maxVal = funnelData[0].value || 1;
                                const pct = (item.value / maxVal) * 100;
                                return (
                                    <div key={item.name}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-300">{item.name}</span>
                                            <span className="text-sm font-bold text-white">{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-8 w-full overflow-hidden rounded-lg bg-slate-800/50">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                                className="flex h-full items-center rounded-lg px-3"
                                                style={{ backgroundColor: item.fill }}
                                            >
                                                <span className="text-xs font-bold text-white">{pct.toFixed(0)}%</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Campaign Performance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
                            <p className="text-sm text-slate-400">Sent vs Delivered vs Read by campaign</p>
                        </div>
                        <div className="h-72">
                            {campaignStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={campaignStats} barSize={16}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                        <YAxis stroke="#64748B" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="sent" fill="#10B981" radius={[4, 4, 0, 0]} name="Sent" />
                                        <Bar dataKey="delivered" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Delivered" />
                                        <Bar dataKey="read" fill="#6366F1" radius={[4, 4, 0, 0]} name="Read" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No campaign data</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Customer Growth */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Customer Growth</h3>
                            <p className="text-sm text-slate-400">New contacts added over time</p>
                        </div>
                        <div className="h-72">
                            {customerGrowth.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={customerGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                        <YAxis stroke="#64748B" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="newContacts"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="New Contacts"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No growth data</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Revenue Generated */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Revenue Generated</h3>
                            <p className="text-sm text-slate-400">Daily revenue in BDT</p>
                        </div>
                        <div className="h-72">
                            {revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData} barSize={24}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                        <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                            }}
                                            formatter={(value: number) => [formatBDT(value), 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue (BDT)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <DollarSign size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No revenue data</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Top Performing Campaigns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Top Performing Campaigns</h3>
                            <p className="text-sm text-slate-400">Ranked by revenue generated</p>
                        </div>
                        <div className="space-y-4">
                            {topCampaignsRanked.length > 0 ? (
                                topCampaignsRanked.map((campaign, i) => {
                                    const maxCampaignRevenue = topCampaignsRanked[0]?.revenue || 1;
                                    const pct = (campaign.revenue / maxCampaignRevenue) * 100;
                                    return (
                                        <div key={campaign.name} className="group">
                                            <div className="mb-2 flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                                        i === 0
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : i === 1
                                                              ? 'bg-slate-400/20 text-slate-300'
                                                              : i === 2
                                                                ? 'bg-orange-500/20 text-orange-400'
                                                                : 'bg-slate-700/50 text-slate-400'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-sm font-medium text-white">{campaign.name}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {campaign.sent.toLocaleString()} sent · {campaign.delivered.toLocaleString()} delivered
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-emerald-400">{formatBDT(campaign.revenue)}</p>
                                                    <p className="text-[10px] text-slate-500">{campaign.read.toLocaleString()} read</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Trophy size={40} className="mb-3 text-slate-600" />
                                    <p className="text-sm text-slate-400">No campaign data yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>
            </main>
        </>
    );
}

WhatsAppAnalytics.layout = {
    breadcrumbs: [{ title: 'WhatsApp Analytics', href: '/whatsapp/analytics' }],
};
