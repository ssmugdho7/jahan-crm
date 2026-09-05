import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Search,
    Download,
    FileText,
    Send,
    CheckCheck,
    Eye,
    XCircle,
    Reply,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    X,
    MessageCircle,
    Phone,
    Megaphone,
    File,
    Image,
    Video,
    AlertCircle,
    Clock,
    Filter,
    Calendar,
    RotateCcw,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type Contact = {
    id: number;
    name: string;
    phone: string;
    avatar: string | null;
};

type Campaign = {
    id: number;
    name: string;
} | null;

type Template = {
    id: number;
    name: string;
} | null;

type Message = {
    id: number;
    contact: Contact;
    campaign: Campaign;
    template: Template;
    direction: 'inbound' | 'outbound';
    message_type: 'text' | 'image' | 'video' | 'document';
    content: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    failed_at: string | null;
    error_message: string | null;
};

type Stats = {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    inbound: number;
    outbound: number;
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Props = {
    messages: Message[];
    stats: Stats;
    pagination: Pagination;
};

const STATUS_STYLES: Record<string, string> = {
    sent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    delivered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    read: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DIRECTION_STYLES: Record<string, string> = {
    inbound: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    outbound: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const MESSAGE_TYPE_ICONS: Record<string, typeof MessageCircle> = {
    text: MessageCircle,
    image: Image,
    video: Video,
    document: File,
};

export default function WhatsAppMessages({ messages, stats, pagination }: Props) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    const filterTabs = [
        { id: 'all', label: 'All', count: stats.total },
        { id: 'sent', label: 'Sent', count: stats.sent },
        { id: 'delivered', label: 'Delivered', count: stats.delivered },
        { id: 'read', label: 'Read', count: stats.read },
        { id: 'failed', label: 'Failed', count: stats.failed },
        { id: 'inbound', label: 'Inbound', count: stats.inbound },
        { id: 'outbound', label: 'Outbound', count: stats.outbound },
    ];

    const statsCards = [
        { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-slate-500/10' },
        { label: 'Sent', value: stats.sent, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Delivered', value: stats.delivered, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Read', value: stats.read, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Failed', value: stats.failed, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Inbound', value: stats.inbound, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Outbound', value: stats.outbound, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncate = (str: string, len: number) => {
        if (str.length <= len) return str;
        return str.slice(0, len) + '...';
    };

    const openDetail = (message: Message) => {
        setSelectedMessage(message);
        setIsDetailOpen(true);
    };

    const closeDetail = () => {
        setSelectedMessage(null);
        setIsDetailOpen(false);
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('whatsapp.messages.index'),
            { page, search: searchQuery, filter: activeFilter, date_from: dateFrom, date_to: dateTo },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Message History" />

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
                                <History size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Message History</h1>
                                <p className="mt-1 text-sm text-emerald-100">Track and review all WhatsApp messages</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                                <FileText size={18} /> Export CSV
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                                <Download size={18} /> Export PDF
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7"
                >
                    {statsCards.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900"
                        >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                                <span className={`text-lg font-bold ${s.color}`}>{s.value.toLocaleString()}</span>
                            </div>
                            <p className="mt-2 text-[11px] font-medium text-slate-400">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Tabs + Search + Date */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    activeFilter === tab.id
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                        activeFilter === tab.id ? 'bg-white/20' : 'bg-slate-800'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search messages..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-56"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-500" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 [&::-webkit-calendar-picker-indicator]:invert"
                            />
                            <span className="text-slate-500">—</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Messages Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Customer
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Phone
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Campaign
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Template
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Direction
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Type
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Content
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Sent
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Delivered
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Read
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {messages.length > 0 ? (
                                    messages.map((msg) => {
                                        const TypeIcon = MESSAGE_TYPE_ICONS[msg.message_type] || MessageCircle;
                                        return (
                                            <tr key={msg.id} className="transition-colors hover:bg-slate-800/30">
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {msg.contact.avatar ? (
                                                            <img
                                                                src={msg.contact.avatar}
                                                                alt={msg.contact.name}
                                                                className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                                                                {getInitials(msg.contact.name)}
                                                            </div>
                                                        )}
                                                        <p className="text-sm font-medium text-white">{msg.contact.name}</p>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">
                                                    {msg.contact.phone}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    {msg.campaign ? (
                                                        <span className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                                                            <Megaphone size={12} />
                                                            {msg.campaign.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    {msg.template ? (
                                                        <span className="text-sm text-purple-400">{msg.template.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${DIRECTION_STYLES[msg.direction]}`}
                                                    >
                                                        {msg.direction === 'inbound' ? (
                                                            <ArrowDownRight size={10} />
                                                        ) : (
                                                            <ArrowUpRight size={10} />
                                                        )}
                                                        {msg.direction}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                                                        <TypeIcon size={14} className="text-slate-400" />
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <p className="max-w-[200px] truncate text-sm text-slate-300">
                                                        {msg.content}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[msg.status]}`}
                                                    >
                                                        {msg.status === 'sent' && <Send size={10} />}
                                                        {msg.status === 'delivered' && <CheckCheck size={10} />}
                                                        {msg.status === 'read' && <Eye size={10} />}
                                                        {msg.status === 'failed' && <XCircle size={10} />}
                                                        {msg.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-[11px] text-slate-400">
                                                    {formatTime(msg.sent_at)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-[11px] text-slate-400">
                                                    {formatTime(msg.delivered_at)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-[11px] text-slate-400">
                                                    {formatTime(msg.read_at)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openDetail(msg)}
                                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                                            title="View Detail"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {msg.status === 'failed' && (
                                                            <button
                                                                className="rounded-lg p-2 text-amber-400 transition-colors hover:bg-slate-800"
                                                                title="Resend"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <MessageCircle className="mb-4 h-16 w-16 text-slate-700" />
                                                <p className="text-lg font-medium text-slate-400">No messages found</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {searchQuery
                                                        ? 'Try adjusting your search query'
                                                        : 'Messages will appear here once you start sending'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
                            <p className="text-[11px] text-slate-500">
                                Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                {pagination.total} messages
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let page: number;
                                    if (pagination.last_page <= 5) {
                                        page = i + 1;
                                    } else if (pagination.current_page <= 3) {
                                        page = i + 1;
                                    } else if (pagination.current_page >= pagination.last_page - 2) {
                                        page = pagination.last_page - 4 + i;
                                    } else {
                                        page = pagination.current_page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
                                                pagination.current_page === page
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={closeDetail}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <MessageCircle size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Message Detail</h3>
                                        <p className="text-xs text-slate-400">ID: #{selectedMessage.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeDetail}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="space-y-5 px-6 py-5">
                                {/* Contact Info */}
                                <div className="flex items-center gap-3">
                                    {selectedMessage.contact.avatar ? (
                                        <img
                                            src={selectedMessage.contact.avatar}
                                            alt={selectedMessage.contact.name}
                                            className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                                            {getInitials(selectedMessage.contact.name)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-white">{selectedMessage.contact.name}</p>
                                        <p className="text-sm text-slate-400">{selectedMessage.contact.phone}</p>
                                    </div>
                                </div>

                                {/* Direction & Status */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${DIRECTION_STYLES[selectedMessage.direction]}`}
                                    >
                                        {selectedMessage.direction === 'inbound' ? (
                                            <ArrowDownRight size={10} />
                                        ) : (
                                            <ArrowUpRight size={10} />
                                        )}
                                        {selectedMessage.direction}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[selectedMessage.status]}`}
                                    >
                                        {selectedMessage.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                                        {selectedMessage.message_type}
                                    </span>
                                </div>

                                {/* Campaign & Template */}
                                {(selectedMessage.campaign || selectedMessage.template) && (
                                    <div className="flex items-center gap-4">
                                        {selectedMessage.campaign && (
                                            <div className="flex items-center gap-2">
                                                <Megaphone size={14} className="text-blue-400" />
                                                <span className="text-sm text-blue-400">{selectedMessage.campaign.name}</span>
                                            </div>
                                        )}
                                        {selectedMessage.template && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-purple-400" />
                                                <span className="text-sm text-purple-400">{selectedMessage.template.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                        Message Content
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                                        {selectedMessage.content}
                                    </p>
                                </div>

                                {/* Timestamps */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Sent At</p>
                                        <p className="mt-1 text-sm text-white">{formatTime(selectedMessage.sent_at)}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Delivered At</p>
                                        <p className="mt-1 text-sm text-white">{formatTime(selectedMessage.delivered_at)}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Read At</p>
                                        <p className="mt-1 text-sm text-white">{formatTime(selectedMessage.read_at)}</p>
                                    </div>
                                    {selectedMessage.failed_at && (
                                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-red-400">Failed At</p>
                                            <p className="mt-1 text-sm text-red-300">{formatTime(selectedMessage.failed_at)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {selectedMessage.error_message && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Error Details</p>
                                            <p className="mt-1 text-sm text-red-300/80">{selectedMessage.error_message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
                                <button
                                    onClick={closeDetail}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                                >
                                    Close
                                </button>
                                {selectedMessage.status === 'failed' && (
                                    <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
                                        <RotateCcw size={16} /> Resend Message
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

WhatsAppMessages.layout = {
    breadcrumbs: [{ title: 'Message History', href: '/whatsapp/messages' }],
};
