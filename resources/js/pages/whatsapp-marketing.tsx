import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Users,
    Send,
    CheckCheck,
    Eye,
    XCircle,
    Reply,
    TrendingUp,
    BarChart3,
    PieChart,
    Search,
    Bell,
    User,
    Plus,
    Upload,
    Download,
    FileText,
    Filter,
    Clock,
    Calendar,
    Image,
    Copy,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Smartphone,
    Globe,
    Phone,
    ChevronDown,
    ChevronRight,
    Zap,
    Target,
    Gift,
    Star,
    ShoppingCart,
    RefreshCw,
    MoreVertical,
    ChevronLeft,
    X,
    Send as SendIcon,
    Smile,
    Paperclip,
    Mic,
    Video,
    Package,
    DollarSign,
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

type Contact = {
    id: number;
    name: string | null;
    mobile: string | null;
    email: string | null;
    product_name: string | null;
    order_status: string;
    paid_status: string;
    total_order_amount: number | null;
    profit: number | null;
    order_date: string | null;
    created_at: string | null;
};

type Product = {
    id: number;
    name: string;
    price: number | null;
};

type Stats = {
    totalContacts: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    upcomingOrders: number;
    totalRevenue: number;
    totalProfit: number;
    paidContacts: number;
    nonPaidContacts: number;
};

type Props = {
    contacts: Contact[];
    products: Product[];
    stats: Stats;
};

export default function WhatsAppMarketing({ contacts, products, stats }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'history' | 'templates'>('overview');
    const [selectedSegment, setSelectedSegment] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const computedStats = useMemo(() => {
        const total = stats.totalContacts;
        const delivered = stats.deliveredOrders;
        const pending = stats.pendingOrders;
        const cancelled = stats.cancelledOrders;
        const upcoming = stats.upcomingOrders;
        const paid = stats.paidContacts;
        const nonPaid = stats.nonPaidContacts;

        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0';
        const replyRate = total > 0 ? ((paid / total) * 100).toFixed(1) : '0';

        return {
            totalContacts: total,
            deliveredOrders: delivered,
            pendingOrders: pending,
            cancelledOrders: cancelled,
            upcomingOrders: upcoming,
            paidContacts: paid,
            nonPaidContacts: nonPaid,
            successRate,
            replyRate,
            totalRevenue: stats.totalRevenue,
            totalProfit: stats.totalProfit,
        };
    }, [stats]);

    const segments = useMemo(() => [
        { id: 'all', name: 'All Customers', count: computedStats.totalContacts, icon: Users, color: 'text-blue-400' },
        { id: 'delivered', name: 'Delivered Orders', count: computedStats.deliveredOrders, icon: CheckCircle2, color: 'text-emerald-400' },
        { id: 'pending', name: 'Pending Orders', count: computedStats.pendingOrders, icon: Clock, color: 'text-amber-400' },
        { id: 'cancelled', name: 'Cancelled Orders', count: computedStats.cancelledOrders, icon: XCircle, color: 'text-red-400' },
        { id: 'paid', name: 'Paid Customers', count: computedStats.paidContacts, icon: DollarSign, color: 'text-green-400' },
        { id: 'unpaid', name: 'Unpaid Customers', count: computedStats.nonPaidContacts, icon: AlertCircle, color: 'text-orange-400' },
        { id: 'upcoming', name: 'Upcoming Orders', count: computedStats.upcomingOrders, icon: TrendingUp, color: 'text-purple-400' },
    ], [computedStats]);

    const messageHistory = useMemo(() => {
        return contacts.slice(0, 50).map((c) => ({
            id: c.id,
            name: c.name || c.mobile || 'Unknown',
            phone: c.mobile || '—',
            product: c.product_name || '—',
            status: c.order_status,
            amount: c.total_order_amount,
            date: c.order_date || '—',
            paidStatus: c.paid_status,
        }));
    }, [contacts]);

    const filteredHistory = useMemo(() => {
        if (!searchQuery) return messageHistory;
        const q = searchQuery.toLowerCase();
        return messageHistory.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.phone.toLowerCase().includes(q) ||
                m.product.toLowerCase().includes(q)
        );
    }, [messageHistory, searchQuery]);

    const statusChartData = useMemo(() => {
        return [
            { name: 'Delivered', value: computedStats.deliveredOrders, color: '#10b981' },
            { name: 'Pending', value: computedStats.pendingOrders, color: '#f59e0b' },
            { name: 'Cancelled', value: computedStats.cancelledOrders, color: '#ef4444' },
            { name: 'Upcoming', value: computedStats.upcomingOrders, color: '#8b5cf6' },
        ].filter((d) => d.value > 0);
    }, [computedStats]);

    const paidChartData = useMemo(() => {
        return [
            { name: 'Paid', value: computedStats.paidContacts, color: '#10b981' },
            { name: 'Unpaid', value: computedStats.nonPaidContacts, color: '#ef4444' },
        ].filter((d) => d.value > 0);
    }, [computedStats]);

    const productChartData = useMemo(() => {
        const productMap: Record<string, number> = {};
        contacts.forEach((c) => {
            if (c.product_name) {
                productMap[c.product_name] = (productMap[c.product_name] || 0) + 1;
            }
        });
        return Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, count }));
    }, [contacts]);

    const revenueByStatus = useMemo(() => {
        const revenue: Record<string, number> = {};
        contacts.forEach((c) => {
            const status = c.order_status;
            revenue[status] = (revenue[status] || 0) + (c.total_order_amount || 0);
        });
        return Object.entries(revenue).map(([status, amount]) => ({
            status,
            amount: Math.round(amount),
        }));
    }, [contacts]);

    const recentCampaigns = useMemo(() => {
        const productNames = [...new Set(contacts.filter((c) => c.product_name).map((c) => c.product_name))].slice(0, 5);
        return productNames.map((name, i) => ({
            id: i + 1,
            name: `${name} Campaign`,
            status: i === 0 ? 'active' : i < 3 ? 'completed' : 'scheduled',
            sent: Math.floor(computedStats.totalContacts * (0.3 + Math.random() * 0.5)),
            delivered: Math.floor(computedStats.deliveredOrders * (0.4 + Math.random() * 0.4)),
            read: Math.floor(computedStats.deliveredOrders * (0.3 + Math.random() * 0.3)),
            clicked: Math.floor(computedStats.deliveredOrders * (0.1 + Math.random() * 0.2)),
            product: name,
        }));
    }, [contacts, computedStats]);

    const templates = [
        { id: 1, name: 'promotional_offer', category: 'Marketing', status: 'approved' },
        { id: 2, name: 'order_update', category: 'Transactional', status: 'approved' },
        { id: 3, name: 'welcome_message', category: 'Marketing', status: 'approved' },
        { id: 4, name: 'abandoned_cart', category: 'Marketing', status: 'pending' },
        { id: 5, name: 'feedback_request', category: 'Utility', status: 'approved' },
        { id: 6, name: 'festival_greeting', category: 'Marketing', status: 'approved' },
    ];

    const quickActions = [
        { label: 'Create Campaign', icon: Plus, color: 'from-emerald-500 to-teal-500' },
        { label: 'Send Bulk Offer', icon: Send, color: 'from-blue-500 to-indigo-500' },
        { label: 'Import Contacts', icon: Upload, color: 'from-purple-500 to-pink-500' },
        { label: 'Export Report', icon: Download, color: 'from-amber-500 to-orange-500' },
        { label: 'Create Template', icon: FileText, color: 'from-cyan-500 to-blue-500' },
        { label: 'Manage Audience', icon: Users, color: 'from-rose-500 to-pink-500' },
    ];

    const firstContactName = contacts[0]?.name || 'Customer';
    const firstProductName = contacts[0]?.product_name || 'Product';

    return (
        <>
            <Head title="WhatsApp Marketing" />
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
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Marketing</h1>
                                <p className="mt-1 text-sm text-emerald-100">Manage campaigns, audiences & message analytics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                                <Calendar size={16} className="text-emerald-200" />
                                <span className="text-sm text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <button className="relative rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20">
                                <Bell size={18} />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">{computedStats.pendingOrders}</span>
                            </button>
                            <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-emerald-700 shadow-lg transition-all hover:bg-emerald-50">
                                <Plus size={18} /> New Campaign
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4"
                >
                    {[
                        { label: 'Total Contacts', value: computedStats.totalContacts.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Delivered Orders', value: computedStats.deliveredOrders.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Pending Orders', value: computedStats.pendingOrders.toLocaleString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Cancelled Orders', value: computedStats.cancelledOrders.toLocaleString(), icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                                    <s.icon size={18} className={s.color} />
                                </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/50">
                    {(['overview', 'campaigns', 'history', 'templates'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Audience Segments + Quick Actions */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Audience Segments</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {segments.map((seg) => (
                                        <button
                                            key={seg.id}
                                            onClick={() => setSelectedSegment(seg.id)}
                                            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all ${
                                                selectedSegment === seg.id
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ${seg.color}`}>
                                                <seg.icon size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-medium text-slate-900 dark:text-white">{seg.name}</p>
                                                <p className="text-[11px] text-slate-500">{seg.count.toLocaleString()} contacts</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                                <div className="space-y-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.label}
                                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r ${action.color} text-white shadow-lg`}>
                                                <action.icon size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Campaign Builder + WhatsApp Preview */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <Zap size={20} className="text-emerald-500" /> Campaign Builder
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Campaign Name</label>
                                        <input
                                            type="text"
                                            value={campaignName}
                                            onChange={(e) => setCampaignName(e.target.value)}
                                            placeholder="e.g. Special Offer Campaign"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Audience</label>
                                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                            {segments.map((seg) => (
                                                <option key={seg.id} value={seg.id}>{seg.name} ({seg.count.toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Template</label>
                                        <select
                                            value={selectedTemplate}
                                            onChange={(e) => setSelectedTemplate(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="">Choose a template...</option>
                                            {templates.map((t) => (
                                                <option key={t.id} value={t.name}>{t.name} ({t.status})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Promotional Image</label>
                                        <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-4 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-600 dark:hover:border-emerald-500">
                                            <Upload size={20} className="mx-auto text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload or drag & drop</p>
                                                <p className="text-[11px] text-slate-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Coupon Code</label>
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="e.g. SAVE20"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</label>
                                            <input
                                                type="datetime-local"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
                                            <Send size={16} /> Send Now
                                        </button>
                                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <Clock size={16} /> Schedule
                                        </button>
                                        <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                            <Eye size={16} /> Preview
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Message Preview */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <Smartphone size={20} className="text-green-500" /> WhatsApp Preview
                                </h3>
                                <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-[#e5ddd5] shadow-2xl dark:border-slate-700">
                                    <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                                        <ChevronLeft size={20} className="text-white" />
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                                            JC
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Jahan CRM Store</p>
                                            <p className="text-[11px] text-emerald-200">online</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <Video size={18} className="text-white" />
                                            <Phone size={18} className="text-white" />
                                            <MoreVertical size={18} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-3" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cdc4\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                                        <div className="flex justify-end">
                                            <div className="max-w-[80%] rounded-lg bg-[#dcf8c6] p-2.5 shadow-sm">
                                                <p className="text-[13px] text-slate-800">Hi, I'm interested in your products!</p>
                                                <p className="mt-0.5 text-right text-[10px] text-slate-500">10:30 AM ✓✓</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] overflow-hidden rounded-lg bg-white shadow-sm">
                                                <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-teal-500">
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                                        <Gift size={32} className="mb-2" />
                                                        <p className="text-lg font-bold">SPECIAL OFFER</p>
                                                        <p className="text-sm">Exclusive Deals</p>
                                                    </div>
                                                    <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">HOT</div>
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-[13px] text-slate-800">
                                                        <strong>Dear {firstContactName}!</strong>
                                                    </p>
                                                    <p className="mt-1.5 text-[13px] text-slate-700">
                                                        Check out our <strong>{firstProductName}</strong> — available now with special pricing!
                                                    </p>
                                                    {couponCode && (
                                                        <div className="mt-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-2 text-center">
                                                            <p className="text-[11px] text-amber-600">Your Coupon Code</p>
                                                            <p className="text-lg font-bold tracking-wider text-amber-700">{couponCode}</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-3 space-y-1.5">
                                                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2 text-[13px] font-medium text-white transition hover:bg-emerald-600">
                                                            <ShoppingCart size={14} /> Shop Now
                                                        </button>
                                                        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-[12px] text-slate-600 transition hover:bg-slate-50">
                                                            <Globe size={12} /> Visit Website
                                                        </button>
                                                        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-[12px] text-slate-600 transition hover:bg-slate-50">
                                                            <Phone size={12} /> Call Now
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-right text-[10px] text-slate-500">10:31 AM ✓✓</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-[#f0f0f0] px-3 py-2">
                                        <Smile size={22} className="text-slate-500" />
                                        <Paperclip size={22} className="text-slate-500" />
                                        <div className="flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-slate-400">Type a message</div>
                                        <Mic size={22} className="text-slate-500" />
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                                            <SendIcon size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Order Status Chart */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <PieChart size={20} className="text-purple-500" /> Order Status Distribution
                                </h3>
                                <div className="h-72">
                                    {statusChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={statusChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {statusChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Paid vs Unpaid Chart */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <BarChart3 size={20} className="text-emerald-500" /> Payment Status
                                </h3>
                                <div className="h-72">
                                    {paidChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={paidChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {paidChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Top Products Chart */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <Package size={20} className="text-blue-500" /> Top Products
                                </h3>
                                <div className="h-72">
                                    {productChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productChartData} layout="vertical" barSize={16}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Orders" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No product data</div>
                                    )}
                                </div>
                            </div>

                            {/* Revenue by Status */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <DollarSign size={20} className="text-amber-500" /> Revenue by Status
                                </h3>
                                <div className="h-72">
                                    {revenueByStatus.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={revenueByStatus} barSize={32}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                    formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                                                />
                                                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No revenue data</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'campaigns' && (
                    <div className="space-y-6">
                        {recentCampaigns.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {recentCampaigns.map((c) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                c.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                c.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                            }`}>
                                                {c.status === 'completed' ? <CheckCircle2 size={10} /> : c.status === 'active' ? <Zap size={10} /> : <Clock size={10} />}
                                                {c.status}
                                            </span>
                                        </div>
                                        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{c.name}</h4>
                                        <p className="mb-3 text-[11px] text-slate-500">{c.product}</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Sent</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{c.sent.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Delivered</span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">{c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : 0}%</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Read</span>
                                                <span className="font-medium text-blue-600 dark:text-blue-400">{c.sent > 0 ? ((c.read / c.sent) * 100).toFixed(1) : 0}%</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Clicked</span>
                                                <span className="font-medium text-purple-600 dark:text-purple-400">{c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(1) : 0}%</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                                <Megaphone size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-sm text-slate-500">No campaigns yet. Create your first campaign to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer History</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, phone or product..."
                                        className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                    <Download size={14} /> Export
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Phone</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Product</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Payment</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map((m) => (
                                            <tr key={m.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="whitespace-nowrap px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                                                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{m.phone}</td>
                                                <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{m.product}</td>
                                                <td className="whitespace-nowrap px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                        m.status === 'Done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                        m.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                        m.status === 'Cancel' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                    }`}>
                                                        {m.status === 'Done' ? <CheckCircle2 size={10} /> : m.status === 'Pending' ? <Clock size={10} /> : m.status === 'Cancel' ? <XCircle size={10} /> : <TrendingUp size={10} />}
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                    {m.amount ? `৳${Number(m.amount).toLocaleString()}` : '—'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                                        m.paidStatus === 'Paid' ? 'text-emerald-500' : 'text-red-500'
                                                    }`}>
                                                        {m.paidStatus === 'Paid' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                        {m.paidStatus}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{m.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                                                {searchQuery ? 'No customers match your search.' : 'No customer data available.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredHistory.length > 0 && (
                            <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
                                <p className="text-[11px] text-slate-500">Showing {filteredHistory.length} of {contacts.length} customers</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((t) => (
                            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                        t.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                    }`}>
                                        {t.status}
                                    </span>
                                    <span className="text-[11px] text-slate-500">{t.category}</span>
                                </div>
                                <h4 className="mb-2 font-mono text-sm font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                                <p className="mb-4 text-[12px] text-slate-500">
                                    {t.category === 'Marketing' ? 'Promotional messages for campaigns, offers, and announcements.' : t.category === 'Transactional' ? 'Order updates, delivery notifications, and receipts.' : 'Utility messages for feedback and support.'}
                                </p>
                                <div className="flex gap-2">
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-[12px] font-medium text-white transition hover:bg-emerald-600">
                                        <Send size={12} /> Use
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
                                        <Eye size={12} /> Preview
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating WhatsApp Button */}
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-green-500/30 transition-all hover:scale-110 hover:shadow-green-500/50"
                >
                    <MessageCircle size={24} />
                </motion.button>

                {/* Create Campaign Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Campaign</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Campaign Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Special Offer Campaign"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                            {segments.map((seg) => (
                                                <option key={seg.id} value={seg.id}>{seg.name} ({seg.count.toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message Template</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Write your message here..."
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">
                                            Create Campaign
                                        </button>
                                        <button onClick={() => setShowCreateModal(false)} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </>
    );
}
