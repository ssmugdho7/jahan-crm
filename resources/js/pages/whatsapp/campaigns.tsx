import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';
import {
    Megaphone,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    Send,
    Calendar,
    Clock,
    Users,
    Copy,
    StopCircle,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    ChevronDown,
    Save,
    Image,
    Link,
    Tag,
    FileText,
    MessageSquare,
    BarChart3,
    TrendingUp,
    ArrowRight,
    Upload,
    Globe,
    MousePointerClick,
    Zap,
    Play,
    Pause,
    Archive,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    Tooltip,
    Cell,
} from 'recharts';

type Campaign = {
    id: number;
    name: string;
    campaign_type: string;
    status: string;
    audience_filter: Record<string, unknown> | null;
    template: string | null;
    total_sent: number;
    total_delivered: number;
    total_read: number;
    total_failed: number;
    total_replies: number;
    schedule_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
};

type Template = {
    id: number;
    name: string;
    category: string;
    status: string;
};

type Audience = {
    id: number;
    name: string;
    contact_count: number;
};

type Stats = {
    total: number;
    draft: number;
    scheduled: number;
    running: number;
    completed: number;
    cancelled: number;
};

type Props = {
    campaigns: Campaign[];
    templates: Template[];
    audiences: Audience[];
    stats: Stats;
};

type CampaignFormData = {
    name: string;
    campaign_type: string;
    audience_id: number | null;
    template_id: number | null;
    banner_image: string | null;
    product_image: string | null;
    coupon_code: string;
    website_link: string;
    cta_button_text: string;
    cta_button_url: string;
    schedule_at: string;
    timezone: string;
};

const CAMPAIGN_TYPES = [
    { value: 'flash_sale', label: 'Flash Sale', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'eid_offer', label: 'Eid Offer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'weekend_offer', label: 'Weekend Offer', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'free_delivery', label: 'Free Delivery', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { value: 'discount', label: 'Discount', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'new_arrival', label: 'New Arrival', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

const STATUS_CONFIG: Record<string, { color: string; pulse?: boolean }> = {
    draft: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    scheduled: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    running: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: true },
    completed: { color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30' },
    cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const TIMEZONES = [
    'Asia/Dhaka',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Australia/Sydney',
];

export default function WhatsAppCampaigns({ campaigns, templates, audiences, stats }: Props) {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: '',
        campaign_type: 'flash_sale',
        audience_id: null,
        template_id: null,
        banner_image: null,
        product_image: null,
        coupon_code: '',
        website_link: '',
        cta_button_text: '',
        cta_button_url: '',
        schedule_at: '',
        timezone: 'Asia/Dhaka',
    });
    const mainRef = useRef<HTMLDivElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const productInputRef = useRef<HTMLInputElement>(null);

    const getCampaignTypeConfig = (type: string) => {
        return CAMPAIGN_TYPES.find((t) => t.value === type) || CAMPAIGN_TYPES[0];
    };

    const filteredCampaigns = useMemo(() => {
        let result = campaigns;
        if (activeTab !== 'all') {
            result = result.filter((c) => c.status === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.campaign_type.toLowerCase().includes(q) ||
                    c.status.toLowerCase().includes(q),
            );
        }
        return result;
    }, [campaigns, activeTab, searchQuery]);

    const tabs = [
        { id: 'all', label: 'All Campaigns', count: stats.total },
        { id: 'draft', label: 'Draft', count: stats.draft },
        { id: 'scheduled', label: 'Scheduled', count: stats.scheduled },
        { id: 'running', label: 'Running', count: stats.running },
        { id: 'completed', label: 'Completed', count: stats.completed },
    ];

    const statCards = [
        { label: 'Total', value: stats.total, icon: Megaphone, color: 'from-blue-500 to-blue-600' },
        { label: 'Draft', value: stats.draft, icon: FileText, color: 'from-slate-500 to-slate-600' },
        { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'from-amber-500 to-amber-600' },
        { label: 'Running', value: stats.running, icon: Play, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'from-red-500 to-red-600' },
    ];

    const resetForm = () => {
        setFormData({
            name: '',
            campaign_type: 'flash_sale',
            audience_id: null,
            template_id: null,
            banner_image: null,
            product_image: null,
            coupon_code: '',
            website_link: '',
            cta_button_text: '',
            cta_button_url: '',
            schedule_at: '',
            timezone: 'Asia/Dhaka',
        });
        setEditingCampaign(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            name: campaign.name,
            campaign_type: campaign.campaign_type,
            audience_id: null,
            template_id: null,
            banner_image: null,
            product_image: null,
            coupon_code: '',
            website_link: '',
            cta_button_text: '',
            cta_button_url: '',
            schedule_at: campaign.schedule_at || '',
            timezone: 'Asia/Dhaka',
        });
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        resetForm();
        setShowPreview(false);
    };

    const updateForm = (field: keyof CampaignFormData, value: string | number | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveDraft = () => {
        closeModal();
    };

    const handleSendNow = () => {
        closeModal();
    };

    const handleSchedule = () => {
        closeModal();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDeliveryRate = (campaign: Campaign) => {
        if (campaign.total_sent === 0) return 0;
        return ((campaign.total_delivered / campaign.total_sent) * 100).toFixed(1);
    };

    const calculateReadRate = (campaign: Campaign) => {
        if (campaign.total_delivered === 0) return 0;
        return ((campaign.total_read / campaign.total_delivered) * 100).toFixed(1);
    };

    const getChartData = (campaign: Campaign) => [
        { name: 'Sent', value: campaign.total_sent, color: '#3B82F6' },
        { name: 'Delivered', value: campaign.total_delivered, color: '#10B981' },
        { name: 'Read', value: campaign.total_read, color: '#8B5CF6' },
        { name: 'Failed', value: campaign.total_failed, color: '#EF4444' },
    ];

    return (
        <>
            <Head title="WhatsApp Campaigns" />

            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6" ref={mainRef}>
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
                                <Megaphone size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Campaigns</h1>
                                <p className="mt-1 text-sm text-emerald-100">Create and manage your WhatsApp marketing campaigns</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-emerald-700 shadow-lg transition-all hover:bg-emerald-50"
                        >
                            <Plus size={18} /> New Campaign
                        </button>
                    </div>
                </motion.section>

                {/* Stats Row */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
                >
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50"
                        >
                            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-xl transition-opacity group-hover:opacity-20`} />
                            <div className="relative flex items-center gap-3">
                                <div className={`inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-2`}>
                                    <stat.icon size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.section>

                {/* Tabs & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                        activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search campaigns..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-64"
                        />
                    </div>
                </motion.div>

                {/* Campaigns Grid */}
                {filteredCampaigns.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredCampaigns.map((campaign, i) => {
                            const typeConfig = getCampaignTypeConfig(campaign.campaign_type);
                            const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                            const chartData = getChartData(campaign);

                            return (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50"
                                >
                                    {/* Card Header */}
                                    <div className="border-b border-slate-800/50 p-5">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="truncate text-base font-semibold text-white">{campaign.name}</h3>
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${typeConfig.color}`}>
                                                        {typeConfig.label}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusConfig.color} ${
                                                            statusConfig.pulse ? 'animate-pulse' : ''
                                                        }`}
                                                    >
                                                        {statusConfig.pulse && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button className="rounded-lg p-2 text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-800 hover:text-white">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                        <circle cx="8" cy="3" r="1.5" />
                                                        <circle cx="8" cy="8" r="1.5" />
                                                        <circle cx="8" cy="13" r="1.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Audience & Template */}
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Users size={12} /> {campaign.audience_filter ? 'Targeted' : 'All'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText size={12} /> {campaign.template || 'No template'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mini Chart */}
                                    <div className="border-b border-slate-800/50 px-5 py-3">
                                        <div className="h-16">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} barSize={12}>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1E293B',
                                                            border: '1px solid #334155',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                        }}
                                                        cursor={false}
                                                    />
                                                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-5 gap-2 border-b border-slate-800/50 p-4">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-white">{campaign.total_sent.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500">Sent</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-emerald-400">{calculateDeliveryRate(campaign)}%</p>
                                            <p className="text-[10px] text-slate-500">Delivered</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-blue-400">{calculateReadRate(campaign)}%</p>
                                            <p className="text-[10px] text-slate-500">Read</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-red-400">{campaign.total_failed}</p>
                                            <p className="text-[10px] text-slate-500">Failed</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-amber-400">{campaign.total_replies}</p>
                                            <p className="text-[10px] text-slate-500">Replies</p>
                                        </div>
                                    </div>

                                    {/* Schedule Info */}
                                    {campaign.status === 'scheduled' && campaign.schedule_at && (
                                        <div className="flex items-center gap-2 border-b border-slate-800/50 bg-blue-500/5 px-5 py-2.5">
                                            <Calendar size={12} className="text-blue-400" />
                                            <span className="text-xs text-blue-400">Scheduled: {formatDate(campaign.schedule_at)}</span>
                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between p-4">
                                        <span className="text-[11px] text-slate-500">
                                            {formatDate(campaign.created_at)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {campaign.status === 'draft' && (
                                                <>
                                                    <button
                                                        onClick={() => handleSendNow()}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                                                    >
                                                        <Send size={10} /> Send
                                                    </button>
                                                    <button
                                                        onClick={() => handleSchedule()}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                                                    >
                                                        <Calendar size={10} /> Schedule
                                                    </button>
                                                </>
                                            )}
                                            {campaign.status === 'running' && (
                                                <button className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                                                    <Pause size={10} /> Pause
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(campaign)}
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                                title="Duplicate"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                                <button
                                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                    title="Cancel"
                                                >
                                                    <StopCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-20"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                                <Megaphone size={40} className="text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                            {searchQuery ? 'No campaigns match your search' : 'No campaigns yet'}
                        </h3>
                        <p className="mt-2 max-w-md text-center text-sm text-slate-400">
                            {searchQuery
                                ? 'Try a different search term or clear the filter'
                                : 'Create your first WhatsApp campaign to start engaging with your customers'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={openCreateModal}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                            >
                                <Plus size={18} /> Create Campaign
                            </button>
                        )}
                    </motion.div>
                )}
            </main>

            {/* Create/Edit Campaign Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <Megaphone size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                                        </h3>
                                        <p className="text-xs text-slate-400">Configure your WhatsApp campaign settings</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
                                <div className="space-y-5">
                                    {/* Campaign Name */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Campaign Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => updateForm('name', e.target.value)}
                                            placeholder="e.g. Eid Mega Sale 2024"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Campaign Type */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Campaign Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CAMPAIGN_TYPES.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => updateForm('campaign_type', type.value)}
                                                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                                                        formData.campaign_type === type.value
                                                            ? `${type.color} border-2`
                                                            : 'border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                                    }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Audience Selector */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Target Audience</label>
                                        <select
                                            value={formData.audience_id || ''}
                                            onChange={(e) => updateForm('audience_id', e.target.value ? Number(e.target.value) : null)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="">All Contacts</option>
                                            {audiences.map((audience) => (
                                                <option key={audience.id} value={audience.id}>
                                                    {audience.name} ({audience.contact_count.toLocaleString()} contacts)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Template Selector */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Message Template</label>
                                        <select
                                            value={formData.template_id || ''}
                                            onChange={(e) => updateForm('template_id', e.target.value ? Number(e.target.value) : null)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="">Select a template</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name} ({template.category})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Image Uploads */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-300">Banner Image</label>
                                            <div
                                                onClick={() => bannerInputRef.current?.click()}
                                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                            >
                                                <Upload size={24} className="mb-2 text-slate-500" />
                                                <span className="text-xs text-slate-400">Click to upload</span>
                                                <span className="text-[10px] text-slate-500">PNG, JPG up to 2MB</span>
                                            </div>
                                            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-300">Product Image</label>
                                            <div
                                                onClick={() => productInputRef.current?.click()}
                                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                            >
                                                <Upload size={24} className="mb-2 text-slate-500" />
                                                <span className="text-xs text-slate-400">Click to upload</span>
                                                <span className="text-[10px] text-slate-500">PNG, JPG up to 2MB</span>
                                            </div>
                                            <input ref={productInputRef} type="file" accept="image/*" className="hidden" />
                                        </div>
                                    </div>

                                    {/* Coupon & Website */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-300">Coupon Code</label>
                                            <div className="relative">
                                                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={formData.coupon_code}
                                                    onChange={(e) => updateForm('coupon_code', e.target.value)}
                                                    placeholder="e.g. EID50"
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-300">Website Link</label>
                                            <div className="relative">
                                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="url"
                                                    value={formData.website_link}
                                                    onChange={(e) => updateForm('website_link', e.target.value)}
                                                    placeholder="https://example.com"
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                        <label className="mb-3 block text-sm font-medium text-slate-300">CTA Button</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-400">Button Text</label>
                                                <div className="relative">
                                                    <MousePointerClick size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={formData.cta_button_text}
                                                        onChange={(e) => updateForm('cta_button_text', e.target.value)}
                                                        placeholder="e.g. Shop Now"
                                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-400">Button URL</label>
                                                <div className="relative">
                                                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="url"
                                                        value={formData.cta_button_url}
                                                        onChange={(e) => updateForm('cta_button_url', e.target.value)}
                                                        placeholder="https://example.com/shop"
                                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                        <label className="mb-3 block text-sm font-medium text-slate-300">Schedule</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-400">Date & Time</label>
                                                <div className="relative">
                                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.schedule_at}
                                                        onChange={(e) => updateForm('schedule_at', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-400">Timezone</label>
                                                <div className="relative">
                                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <select
                                                        value={formData.timezone}
                                                        onChange={(e) => updateForm('timezone', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                                                    >
                                                        {TIMEZONES.map((tz) => (
                                                            <option key={tz} value={tz}>
                                                                {tz}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Button */}
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500/50 hover:text-white"
                                    >
                                        <Eye size={16} /> {showPreview ? 'Hide Preview' : 'Preview Message'}
                                    </button>

                                    {/* Preview */}
                                    <AnimatePresence>
                                        {showPreview && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                                    <p className="mb-3 text-xs font-medium text-slate-400">Message Preview</p>
                                                    <div className="rounded-xl bg-[#005C4B] p-4">
                                                        <p className="text-sm text-white">
                                                            {formData.name
                                                                ? `🎉 ${formData.name}! Check out our amazing offers.`
                                                                : 'Your campaign message will appear here...'}
                                                        </p>
                                                        {formData.coupon_code && (
                                                            <p className="mt-2 rounded-lg bg-emerald-600/30 px-3 py-2 text-xs text-emerald-300">
                                                                🏷️ Use code: {formData.coupon_code}
                                                            </p>
                                                        )}
                                                        {formData.cta_button_text && (
                                                            <div className="mt-3 flex items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 py-2">
                                                                <span className="text-sm font-medium text-emerald-300">{formData.cta_button_text}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
                                <button
                                    onClick={closeModal}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={!formData.name.trim()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        <Save size={16} /> Save Draft
                                    </button>
                                    {formData.schedule_at ? (
                                        <button
                                            onClick={handleSchedule}
                                            disabled={!formData.name.trim()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 disabled:opacity-50"
                                        >
                                            <Calendar size={16} /> Schedule
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSendNow}
                                            disabled={!formData.name.trim()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            <Send size={16} /> Send Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

WhatsAppCampaigns.layout = {
    breadcrumbs: [{ title: 'WhatsApp Campaigns', href: '/whatsapp/campaigns' }],
};
