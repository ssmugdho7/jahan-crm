import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Phone,
    Users,
    Megaphone,
    Send,
    CheckCheck,
    Eye,
    XCircle,
    Reply,
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Bell,
    Package,
    Target,
    Zap,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

type Campaign = {
    id: number;
    name: string;
    status: string;
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    created_at: string;
};

type Message = {
    id: number;
    contact_name: string;
    phone_number: string;
    message: string;
    status: string;
    direction: string;
    created_at: string;
};

type ChartDataPoint = {
    name: string;
    value: number;
};

type DailyData = {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
};

type Props = {
    stats: {
        connectedNumber: string;
        totalContacts: number;
        totalCampaigns: number;
        messagesSentToday: number;
        delivered: number;
        read: number;
        failed: number;
        replyRate: number;
        conversionRate: number;
        revenueGenerated: number;
    };
    recentCampaigns: Campaign[];
    recentMessages: Message[];
    chartData: {
        daily: DailyData[];
        delivery: ChartDataPoint[];
        campaigns: ChartDataPoint[];
    };
};

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-emerald-500/20 text-emerald-400',
    active: 'bg-blue-500/20 text-blue-400',
    scheduled: 'bg-amber-500/20 text-amber-400',
    paused: 'bg-slate-500/20 text-slate-400',
    failed: 'bg-red-500/20 text-red-400',
};

const MESSAGE_STATUS_COLORS: Record<string, string> = {
    sent: 'bg-slate-500/20 text-slate-400',
    delivered: 'bg-emerald-500/20 text-emerald-400',
    read: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
};

const DELIVERY_COLORS = ['#10B981', '#3B82F6', '#EF4444'];

export default function WhatsAppDashboard({
    stats = {
        connectedNumber: 'N/A',
        totalContacts: 0,
        totalCampaigns: 0,
        messagesSentToday: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replyRate: 0,
        conversionRate: 0,
        revenueGenerated: 0,
    },
    recentCampaigns = [],
    recentMessages = [],
    chartData = { daily: [], delivery: [], campaigns: [] },
}: Props) {
    const kpis = [
        {
            label: 'Connected Number',
            value: stats.connectedNumber || 'N/A',
            icon: Phone,
            color: 'from-blue-500 to-blue-600',
            trend: '+2.1%',
            up: true,
        },
        {
            label: 'Total Contacts',
            value: stats.totalContacts.toLocaleString(),
            icon: Users,
            color: 'from-emerald-500 to-emerald-600',
            trend: '+12.5%',
            up: true,
        },
        {
            label: 'Campaigns',
            value: stats.totalCampaigns.toLocaleString(),
            icon: Megaphone,
            color: 'from-purple-500 to-purple-600',
            trend: '+8.3%',
            up: true,
        },
        {
            label: 'Messages Sent',
            value: stats.messagesSentToday.toLocaleString(),
            icon: Send,
            color: 'from-cyan-500 to-cyan-600',
            trend: '+15.2%',
            up: true,
        },
        {
            label: 'Delivered',
            value: stats.delivered.toLocaleString(),
            icon: CheckCheck,
            color: 'from-green-500 to-green-600',
            trend: '+5.7%',
            up: true,
        },
        {
            label: 'Read',
            value: stats.read.toLocaleString(),
            icon: Eye,
            color: 'from-blue-500 to-blue-600',
            trend: '+3.2%',
            up: true,
        },
        {
            label: 'Failed',
            value: stats.failed.toLocaleString(),
            icon: XCircle,
            color: 'from-red-500 to-red-600',
            trend: '-1.8%',
            up: false,
        },
        {
            label: 'Reply Rate',
            value: `${stats.replyRate.toFixed(1)}%`,
            icon: Reply,
            color: 'from-amber-500 to-amber-600',
            trend: '+4.5%',
            up: true,
        },
        {
            label: 'Conversion Rate',
            value: `${stats.conversionRate.toFixed(1)}%`,
            icon: Target,
            color: 'from-teal-500 to-teal-600',
            trend: '+2.8%',
            up: true,
        },
        {
            label: 'Revenue Generated',
            value: `$${stats.revenueGenerated.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-emerald-500 to-emerald-600',
            trend: '+18.4%',
            up: true,
        },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <Head title="WhatsApp Dashboard" />

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
                                <MessageCircle size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Dashboard</h1>
                                <p className="mt-1 text-sm text-emerald-100">Message analytics and campaign performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                                <Calendar size={16} className="text-emerald-200" />
                                <span className="text-sm text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <button className="relative rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20">
                                <Bell size={18} />
                                {stats.failed > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">{stats.failed}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* KPI Cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {kpis.map((kpi, i) => (
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
                                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {kpi.trend}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tracking-tight text-white">{kpi.value}</p>
                                <p className="mt-1 text-sm text-slate-400">{kpi.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Charts Row */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* Messages Sent Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm lg:col-span-2"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Messages Sent</h3>
                                <p className="text-sm text-slate-400">Daily message volume over time</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-slate-400">Sent</span></div>
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-slate-400">Delivered</span></div>
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-purple-500" /><span className="text-slate-400">Read</span></div>
                            </div>
                        </div>
                        <div className="h-80">
                            {chartData.daily.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.daily}>
                                        <defs>
                                            <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradientDelivered" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                        <YAxis stroke="#64748B" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                            labelStyle={{ color: '#F8FAFC' }}
                                        />
                                        <Area type="monotone" dataKey="sent" stroke="#10B981" fillOpacity={1} fill="url(#gradientSent)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="delivered" stroke="#3B82F6" fillOpacity={1} fill="url(#gradientDelivered)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="read" stroke="#8B5CF6" fillOpacity={0.1} fill="#8B5CF6" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <MessageCircle size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No message data available</p>
                                        <p className="text-xs text-slate-500">Start sending messages to see analytics</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Delivery Status Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-white">Delivery Status</h3>
                        <p className="mb-4 text-sm text-slate-400">Message delivery breakdown</p>
                        <div className="h-72">
                            {chartData.delivery.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.delivery}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, value }) => {
                                                const total = chartData.delivery.reduce((sum, item) => sum + item.value, 0);
                                                const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
                                                return `${pct}%`;
                                            }}
                                            labelLine={true}
                                        >
                                            {chartData.delivery.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={DELIVERY_COLORS[index % DELIVERY_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                            formatter={(value: number, name: string) => {
                                                const total = chartData.delivery.reduce((sum, item) => sum + item.value, 0);
                                                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                                return [`${value} (${pct}%)`, name];
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <CheckCheck size={48} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-400">No delivery data</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* Campaign Performance Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
                            <p className="text-sm text-slate-400">Messages sent per campaign</p>
                        </div>
                    </div>
                    <div className="h-72">
                        {chartData.campaigns.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.campaigns} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} name="Messages" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <Megaphone size={48} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-sm text-slate-400">No campaign data</p>
                                    <p className="text-xs text-slate-500">Create campaigns to see performance</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Campaigns & Messages */}
                <section className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Campaigns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <div className="border-b border-slate-800 p-5">
                            <h3 className="text-lg font-semibold text-white">Recent Campaigns</h3>
                            <p className="text-sm text-slate-400">Latest campaign activity</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {recentCampaigns.length > 0 ? (
                                recentCampaigns.map((campaign, i) => (
                                    <motion.div
                                        key={campaign.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="flex items-center gap-4 border-b border-slate-800/50 p-4 transition-colors hover:bg-slate-800/30 last:border-0"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                            <Megaphone size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-medium text-white">{campaign.name}</p>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[campaign.status] || 'bg-slate-500/20 text-slate-400'}`}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Sent: {campaign.sent.toLocaleString()} | Delivered: {campaign.delivered.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">
                                                {campaign.sent > 0 ? ((campaign.delivered / campaign.sent) * 100).toFixed(0) : 0}%
                                            </p>
                                            <p className="text-[10px] text-slate-500">delivery</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <Megaphone size={40} className="mb-3 text-slate-600" />
                                    <p className="text-sm text-slate-400">No campaigns yet</p>
                                    <p className="text-xs text-slate-500">Create your first campaign to get started</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Messages */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <div className="border-b border-slate-800 p-5">
                            <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
                            <p className="text-sm text-slate-400">Latest message activity</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {recentMessages.length > 0 ? (
                                recentMessages.map((message, i) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.65 + i * 0.05 }}
                                        className="flex items-center gap-4 border-b border-slate-800/50 p-4 transition-colors hover:bg-slate-800/30 last:border-0"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-xs font-bold text-white">
                                            {getInitials(message.contact_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-medium text-white">{message.contact_name}</p>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${MESSAGE_STATUS_COLORS[message.status] || 'bg-slate-500/20 text-slate-400'}`}>
                                                    {message.status}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-slate-500">{message.message}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] text-slate-500">
                                                {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <MessageCircle size={40} className="mb-3 text-slate-600" />
                                    <p className="text-sm text-slate-400">No messages yet</p>
                                    <p className="text-xs text-slate-500">Messages will appear here once sent</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>
            </main>
        </>
    );
}
