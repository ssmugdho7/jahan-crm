import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';
import {
    Users,
    Plus,
    Eye,
    Pencil,
    Trash2,
    X,
    Crown,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    UserCheck,
    AlertCircle,
    Search,
    Calendar,
    Filter,
    Layers,
    Zap,
    ChevronDown,
    ChevronUp,
    Save,
    ArrowRight,
    RotateCw,
    Tag,
    DollarSign,
    ShoppingCart,
    UserMinus,
} from 'lucide-react';

type Audience = {
    id: number;
    name: string;
    description: string | null;
    type: 'dynamic' | 'static';
    contact_count: number;
    filters: Record<string, unknown> | null;
    is_dynamic: boolean;
    created_at: string;
};

type Segments = {
    all: number;
    delivered: number;
    pending: number;
    cancelled: number;
    repeat: number;
    vip: number;
    inactive30: number;
    inactive60: number;
    inactive90: number;
};

type Props = {
    audiences: Audience[];
    segments: Segments;
};

type FilterCondition = {
    field: string;
    operator: string;
    value: string;
};

export default function WhatsAppAudience({ audiences, segments }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [audienceName, setAudienceName] = useState('');
    const [audienceDescription, setAudienceDescription] = useState('');
    const [isDynamic, setIsDynamic] = useState(true);
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([
        { field: 'order_status', operator: 'equals', value: '' },
    ]);
    const mainRef = useRef<HTMLDivElement>(null);

    const prebuiltSegments = useMemo(
        () => [
            { id: 'all', name: 'All Customers', count: segments.all, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { id: 'vip', name: 'VIP Customers', count: segments.vip, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { id: 'delivered', name: 'Delivered Orders', count: segments.delivered, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { id: 'pending', name: 'Pending Orders', count: segments.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { id: 'cancelled', name: 'Cancelled Orders', count: segments.cancelled, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { id: 'repeat', name: 'Repeat Customers', count: segments.repeat, icon: RotateCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
            { id: 'inactive30', name: 'Inactive 30 Days', count: segments.inactive30, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { id: 'inactive60', name: 'Inactive 60 Days', count: segments.inactive60, icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { id: 'inactive90', name: 'Inactive 90 Days', count: segments.inactive90, icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        ],
        [segments],
    );

    const filteredAudiences = useMemo(() => {
        if (!searchQuery) return audiences;
        const q = searchQuery.toLowerCase();
        return audiences.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q),
        );
    }, [audiences, searchQuery]);

    const addFilterCondition = () => {
        setFilterConditions([...filterConditions, { field: 'order_status', operator: 'equals', value: '' }]);
    };

    const removeFilterCondition = (index: number) => {
        setFilterConditions(filterConditions.filter((_, i) => i !== index));
    };

    const updateFilterCondition = (index: number, key: keyof FilterCondition, value: string) => {
        const updated = [...filterConditions];
        updated[index] = { ...updated[index], [key]: value };
        setFilterConditions(updated);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setAudienceName('');
        setAudienceDescription('');
        setIsDynamic(true);
        setFilterConditions([{ field: 'order_status', operator: 'equals', value: '' }]);
    };

    const handleSaveAudience = () => {
        closeCreateModal();
    };

    return (
        <>
            <Head title="WhatsApp Audience" />
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
                                <Users size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Audience Segments</h1>
                                <p className="mt-1 text-sm text-emerald-100">Create and manage targeted audiences for WhatsApp campaigns</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-emerald-700 shadow-lg transition-all hover:bg-emerald-50"
                        >
                            <Plus size={18} /> Create Audience
                        </button>
                    </div>
                </motion.section>

                {/* Pre-built Segments Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Pre-built Segments</h2>
                        <span className="text-xs text-slate-500">{prebuiltSegments.length} segments</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {prebuiltSegments.map((seg, i) => (
                            <motion.div
                                key={seg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.03 * i }}
                                className={`group cursor-pointer rounded-2xl border ${seg.border} bg-slate-900/50 p-4 transition-all duration-300 hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-900/50`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${seg.bg}`}>
                                        <seg.icon size={20} className={seg.color} />
                                    </div>
                                    <ArrowRight size={14} className="text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-slate-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{seg.count.toLocaleString()}</p>
                                <p className="mt-0.5 text-xs text-slate-400">{seg.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Custom Audiences Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50"
                >
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Custom Audiences</h2>
                            <p className="text-xs text-slate-400">{audiences.length} audiences created</p>
                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search audiences..."
                                className="w-64 rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    {filteredAudiences.length > 0 ? (
                        <div className="divide-y divide-slate-800/50">
                            {filteredAudiences.map((audience, i) => (
                                <motion.div
                                    key={audience.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.03 * i }}
                                    className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                                            <Layers size={20} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white">{audience.name}</p>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                        audience.is_dynamic
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-slate-500/20 text-slate-400'
                                                    }`}
                                                >
                                                    {audience.is_dynamic ? <Zap size={8} /> : <Layers size={8} />}
                                                    {audience.type}
                                                </span>
                                            </div>
                                            {audience.description && (
                                                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{audience.description}</p>
                                            )}
                                            <div className="mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Users size={10} /> {audience.contact_count.toLocaleString()} contacts
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Calendar size={10} /> {new Date(audience.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400" title="View Contacts">
                                            <Eye size={16} />
                                        </button>
                                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Users className="mb-4 h-16 w-16 text-slate-700" />
                            <p className="text-lg font-medium text-slate-400">
                                {searchQuery ? 'No audiences match your search' : 'No custom audiences yet'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {searchQuery ? 'Try a different search term' : 'Create your first audience to start targeted campaigns'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                                >
                                    <Plus size={16} /> Create Audience
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Create Audience Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={closeCreateModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <Users size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Create Audience</h3>
                                        <p className="text-xs text-slate-400">Define filters to build your target audience</p>
                                    </div>
                                </div>
                                <button onClick={closeCreateModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                                <div className="space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Audience Name</label>
                                        <input
                                            type="text"
                                            value={audienceName}
                                            onChange={(e) => setAudienceName(e.target.value)}
                                            placeholder="e.g. VIP Customers Bangladesh"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
                                        <textarea
                                            value={audienceDescription}
                                            onChange={(e) => setAudienceDescription(e.target.value)}
                                            placeholder="Optional description for this audience"
                                            rows={2}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Dynamic Toggle */}
                                    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                                <Zap size={16} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">Dynamic Audience</p>
                                                <p className="text-[11px] text-slate-400">Auto-update contacts based on filters</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsDynamic(!isDynamic)}
                                            className={`relative h-6 w-11 rounded-full transition-colors ${
                                                isDynamic ? 'bg-emerald-500' : 'bg-slate-600'
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                                    isDynamic ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Filter Conditions */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-300">Filter Conditions</label>
                                            <button
                                                onClick={addFilterCondition}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Plus size={14} /> Add Filter
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {filterConditions.map((condition, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <select
                                                        value={condition.field}
                                                        onChange={(e) => updateFilterCondition(index, 'field', e.target.value)}
                                                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="order_status">Order Status</option>
                                                        <option value="purchase_amount">Purchase Amount</option>
                                                        <option value="inactive_days">Inactive Days</option>
                                                        <option value="tags">Tags</option>
                                                        <option value="total_orders">Total Orders</option>
                                                    </select>
                                                    <select
                                                        value={condition.operator}
                                                        onChange={(e) => updateFilterCondition(index, 'operator', e.target.value)}
                                                        className="w-32 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="equals">Equals</option>
                                                        <option value="not_equals">Not Equals</option>
                                                        <option value="contains">Contains</option>
                                                        <option value="greater_than">Greater Than</option>
                                                        <option value="less_than">Less Than</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={condition.value}
                                                        onChange={(e) => updateFilterCondition(index, 'value', e.target.value)}
                                                        placeholder="Value"
                                                        className="w-36 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                                                    />
                                                    {filterConditions.length > 1 && (
                                                        <button
                                                            onClick={() => removeFilterCondition(index)}
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
                                <button
                                    onClick={closeCreateModal}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAudience}
                                    disabled={!audienceName.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
                                >
                                    <Save size={16} /> Save Audience
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

WhatsAppAudience.layout = {
    breadcrumbs: [{ title: 'WhatsApp Audience', href: '/whatsapp/audience' }],
};
