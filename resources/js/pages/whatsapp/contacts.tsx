import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    MessageCircle,
    Users,
    Search,
    Plus,
    Upload,
    Download,
    RefreshCw,
    MoreVertical,
    Eye,
    Tag,
    Ban,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    ArrowUpDown,
    Phone,
    Mail,
    ShoppingBag,
    DollarSign,
    UserCheck,
    UserX,
    ShieldAlert,
    FileUp,
    Check,
} from 'lucide-react';

type Contact = {
    id: number;
    name: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    email: string | null;
    avatar: string | null;
    status: 'active' | 'inactive' | 'blocked';
    tags: string[];
    last_message_at: string | null;
    last_message_preview: string | null;
    total_orders: number;
    total_purchase: number;
    opt_in: boolean;
    contact: {
        name: string | null;
        mobile: string | null;
        product_name: string | null;
        order_status: string;
    } | null;
};

type Stats = {
    total: number;
    active: number;
    inactive: number;
    blocked: number;
};

type Filters = {
    status: string;
    search: string;
};

type Props = {
    contacts: Contact[];
    stats: Stats;
    filters: Filters;
};

export default function WhatsAppContacts({ contacts, stats, filters }: Props) {
    const [activeStatus, setActiveStatus] = useState(filters.status || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showImportModal, setShowImportModal] = useState(false);
    const [importStep, setImportStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const mainRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredContacts = useMemo(() => {
        let result = contacts;
        if (activeStatus !== 'all') {
            result = result.filter((c) => c.status === activeStatus);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.phone?.toLowerCase().includes(q) ||
                    c.whatsapp_number?.toLowerCase().includes(q) ||
                    c.email?.toLowerCase().includes(q),
            );
        }
        return result;
    }, [contacts, activeStatus, searchQuery]);

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeStatus, searchQuery]);

    const statusTabs = [
        { id: 'all', label: 'All', count: stats.total, icon: Users },
        { id: 'active', label: 'Active', count: stats.active, icon: CheckCircle2 },
        { id: 'inactive', label: 'Inactive', count: stats.inactive, icon: Clock },
        { id: 'blocked', label: 'Blocked', count: stats.blocked, icon: Ban },
    ];

    const statusColor = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status] ?? 'bg-slate-500/20 text-slate-400';
    };

    const tagColors: Record<string, string> = {
        vip: 'bg-amber-500/20 text-amber-400',
        repeat: 'bg-blue-500/20 text-blue-400',
        new: 'bg-cyan-500/20 text-cyan-400',
        wholesale: 'bg-purple-500/20 text-purple-400',
        retail: 'bg-green-500/20 text-green-400',
        default: 'bg-slate-500/20 text-slate-400',
    };

    const formatBDT = (amount: number) => {
        return `৳${amount.toLocaleString('en-IN')}`;
    };

    const timeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getInitials = (name: string | null) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
            setCsvData(lines);
            setImportStep('map');
        };
        reader.readAsText(file);
    };

    const handleImportConfirm = () => {
        setImportStep('done');
        setTimeout(() => {
            setShowImportModal(false);
            setImportStep('upload');
            setCsvFile(null);
            setCsvData([]);
            setColumnMapping({});
        }, 1500);
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        setImportStep('upload');
        setCsvFile(null);
        setCsvData([]);
        setColumnMapping({});
    };

    return (
        <>
            <Head title="WhatsApp Contacts" />
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
                                <MessageCircle size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Contacts</h1>
                                <p className="mt-1 text-sm text-emerald-100">Manage your WhatsApp contact list and engagement</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                                <Upload size={18} /> Import
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                                <RefreshCw size={18} /> Sync
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                                <Download size={18} /> Export
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    {[
                        { label: 'Total Contacts', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'text-slate-400', bg: 'bg-slate-500/10' },
                        { label: 'Blocked', value: stats.blocked, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                                    <s.icon size={18} className={s.color} />
                                </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Tabs + Search */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveStatus(tab.id)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                    activeStatus === tab.id
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    activeStatus === tab.id ? 'bg-white/20' : 'bg-slate-800'
                                }`}>
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
                            placeholder="Search contacts..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-72"
                        />
                    </div>
                </div>

                {/* Contacts Table */}
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
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Contact</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Phone</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">WhatsApp</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Last Message</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Orders</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Purchase</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Tags</th>
                                    <th className="px-5 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {paginatedContacts.length > 0 ? (
                                    paginatedContacts.map((contact) => (
                                        <tr key={contact.id} className="transition-colors hover:bg-slate-800/30">
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {contact.avatar ? (
                                                        <img
                                                            src={contact.avatar}
                                                            alt={contact.name || 'Contact'}
                                                            className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                                                            {getInitials(contact.name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{contact.name || 'Unknown'}</p>
                                                        {contact.email && (
                                                            <p className="text-[11px] text-slate-500">{contact.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">{contact.phone || '—'}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">{contact.whatsapp_number || '—'}</td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusColor(contact.status)}`}>
                                                    {contact.status === 'active' ? <CheckCircle2 size={10} /> : contact.status === 'blocked' ? <Ban size={10} /> : <Clock size={10} />}
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <div className="max-w-[200px]">
                                                    <p className="truncate text-sm text-slate-300">{contact.last_message_preview || 'No messages'}</p>
                                                    <p className="text-[10px] text-slate-500">{timeAgo(contact.last_message_at)}</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-white">{contact.total_orders}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-emerald-400">{formatBDT(contact.total_purchase)}</td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColors[tag] || tagColors.default}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {contact.tags.length > 2 && (
                                                        <span className="inline-block rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                                                            +{contact.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setActionMenuOpen(actionMenuOpen === contact.id ? null : contact.id)}
                                                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {actionMenuOpen === contact.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-2xl"
                                                            >
                                                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                                                                    <Eye size={14} /> View Details
                                                                </button>
                                                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                                                                    <Tag size={14} /> Edit Tags
                                                                </button>
                                                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-slate-800">
                                                                    <Ban size={14} /> Block
                                                                </button>
                                                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800">
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Users className="mb-4 h-16 w-16 text-slate-700" />
                                                <p className="text-lg font-medium text-slate-400">No contacts found</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {searchQuery
                                                        ? 'Try adjusting your search query'
                                                        : 'Import contacts or sync from WhatsApp to get started'}
                                                </p>
                                                <div className="mt-4 flex gap-3">
                                                    <button
                                                        onClick={() => setShowImportModal(true)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                                                    >
                                                        <Upload size={16} /> Import Contacts
                                                    </button>
                                                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700">
                                                        <RefreshCw size={16} /> Sync WhatsApp
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredContacts.length > itemsPerPage && (
                        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
                            <p className="text-[11px] text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
                                                currentPage === page
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Import Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={closeImportModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <FileUp size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Import Contacts</h3>
                                        <p className="text-xs text-slate-400">
                                            {importStep === 'upload' && 'Upload a CSV file with your contacts'}
                                            {importStep === 'map' && 'Map CSV columns to contact fields'}
                                            {importStep === 'preview' && 'Preview your imported contacts'}
                                            {importStep === 'done' && 'Import completed successfully!'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closeImportModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Progress Steps */}
                            <div className="border-b border-slate-800 px-6 py-3">
                                <div className="flex items-center gap-2">
                                    {['upload', 'map', 'preview', 'done'].map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <div
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                    importStep === step
                                                        ? 'bg-emerald-500 text-white'
                                                        : ['upload', 'map', 'preview', 'done'].indexOf(importStep) > i
                                                          ? 'bg-emerald-500/20 text-emerald-400'
                                                          : 'bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {['upload', 'map', 'preview', 'done'].indexOf(importStep) > i ? <Check size={12} /> : i + 1}
                                            </div>
                                            {i < 3 && <div className="h-px w-8 bg-slate-700" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-5">
                                {importStep === 'upload' && (
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-10 transition-all hover:border-emerald-500 hover:bg-emerald-500/5"
                                        >
                                            <FileUp size={40} className="mb-3 text-slate-500" />
                                            <p className="text-sm font-medium text-white">Click to upload or drag & drop</p>
                                            <p className="mt-1 text-xs text-slate-400">CSV files only, up to 10MB</p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}

                                {importStep === 'map' && csvData.length > 0 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-300">Map the CSV columns to the corresponding fields:</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Name', 'Phone', 'WhatsApp Number', 'Email'].map((field) => (
                                                <div key={field}>
                                                    <label className="mb-1 block text-xs font-medium text-slate-400">{field}</label>
                                                    <select
                                                        value={columnMapping[field] ?? ''}
                                                        onChange={(e) => setColumnMapping({ ...columnMapping, [field]: Number(e.target.value) })}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="">Skip this field</option>
                                                        {csvData[0]?.map((header, i) => (
                                                            <option key={i} value={i}>{header || `Column ${i + 1}`}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                                            <p className="text-xs text-slate-400">Preview (first 3 rows):</p>
                                            <div className="mt-2 space-y-1">
                                                {csvData.slice(1, 4).map((row, i) => (
                                                    <p key={i} className="font-mono text-xs text-slate-300">{row.join(' | ')}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {importStep === 'preview' && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-300">Ready to import {csvData.length - 1} contacts</p>
                                    </div>
                                )}

                                {importStep === 'done' && (
                                    <div className="flex flex-col items-center py-6">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                                            <CheckCircle2 size={32} className="text-emerald-400" />
                                        </div>
                                        <p className="text-lg font-semibold text-white">Import Complete!</p>
                                        <p className="mt-1 text-sm text-slate-400">{csvData.length - 1} contacts imported successfully</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
                                <button
                                    onClick={closeImportModal}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                {importStep === 'map' && (
                                    <button
                                        onClick={() => setImportStep('preview')}
                                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                                    >
                                        Preview Import
                                    </button>
                                )}
                                {importStep === 'preview' && (
                                    <button
                                        onClick={handleImportConfirm}
                                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                                    >
                                        Import Contacts
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

WhatsAppContacts.layout = {
    breadcrumbs: [{ title: 'WhatsApp Contacts', href: '/whatsapp/contacts' }],
};
