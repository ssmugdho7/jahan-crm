import { Head, router, useForm } from '@inertiajs/react';
import {
    CircleDollarSign,
    Download,
    Pencil,
    Plus,
    Trash2,
    TrendingUp,
    Users,
    X,
    Sparkles,
    FileText,
    Wand2,
    Loader2,
    ShoppingCart,
    Package,
    Target,
    Activity,
    Clock,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Bell,
    Search,
    RefreshCw,
    TrendingDown,
    DollarSign,
    BarChart3,
    PieChart,
    Brain,
    Star,
    CheckCircle2,
    AlertCircle,
    Timer,
    Truck,
    CreditCard,
    Megaphone,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';
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
import SalesChatbot from '@/components/sales-chatbot';
import BusinessHealthScore from '@/components/business-health-score';
import HeroBackground from '@/components/hero-background';

const countryCodes = [
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
];

type Company = { id: number; name: string; industry: string | null };
type Contact = {
    id: number;
    name: string;
    email: string | null;
    mobile: string | null;
    order_number: string | null;
    job_title: string | null;
    product_name: string | null;
    profit: string | null;
    total_order_amount: string | null;
    order_date: string | null;
    order_status: string;
    paid_status: string;
    company: Company | null;
};
type SimpleForm = {
    post: (
        url: string,
        options: { preserveScroll: boolean; onSuccess: () => void },
    ) => void;
    reset: () => void;
};

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'lastMonth' | 'year' | 'custom';

const CHART_COLORS = {
    revenue: '#3B82F6',
    profit: '#10B981',
    expense: '#EF4444',
    facebook: '#F97316',
    customers: '#8B5CF6',
    orders: '#06B6D4',
};

const PIE_COLORS: Record<string, string> = {
    Done: '#10B981',
    Cancel: '#EF4444',
    Upcoming: '#EAB308',
    Pending: '#38BDF8',
};

export default function Dashboard({
    contacts,
    stats,
    charts,
    filter,
}: {
    contacts: Contact[];
    stats: {
        contacts: number;
        companies: number;
        totalProfit: number;
        totalIncome: number;
        netProfit: number;
    };
    charts: {
        contactsByStatus: Record<string, number>;
        monthlyContacts: Record<string, number>;
        profitByMonth: Record<string, number>;
        expensesByMonth: Record<string, number>;
    };
    filter: string;
}) {
    const [tab, setTab] = useState<'overview' | 'contacts'>('overview');
    const [showForm, setShowForm] = useState<'company' | 'contact' | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [countryCode, setCountryCode] = useState('+965');
    const [aiInput, setAiInput] = useState('');
    const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>({
        mobile: true,
        order_number: true,
        product_name: true,
        order_date: true,
    });
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilter>((filter as DateFilter) || '30days');
    const [showNotifications, setShowNotifications] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDateFilter = (filter: DateFilter) => {
        setDateFilter(filter);
        router.get('/dashboard', { filter }, { preserveState: false, replace: true });
    };

    const companyForm = useForm({
        name: '',
        industry: '',
        website: '',
        phone: '',
    });
    const contactForm = useForm<{
        company_id: string;
        email: string;
        mobile: string;
        order_number: string;
        product_name: string;
        profit: string;
        total_order_amount: string;
        order_date: string;
        order_status: string;
        paid_status: string;
    }>({ company_id: '', email: '', mobile: '', order_number: '', product_name: '', profit: '', total_order_amount: '', order_date: '', order_status: 'Pending', paid_status: 'Non-Paid' });

    const submit = (event: FormEvent, form: SimpleForm, url: string) => {
        event.preventDefault();
        if (url === '/contacts') {
            const mobileWithCode = `${countryCode}${contactForm.data.mobile}`;
            contactForm.setData('mobile', mobileWithCode);
        }
        form.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setShowForm(null);
                setCountryCode('+965');
            },
        });
    };

    const handleEditContact = (contact: Contact) => {
        setEditingContact(contact);
        const fullMobile = contact.mobile ?? '';
        const matchedCode = countryCodes.find((c) => fullMobile.startsWith(c.code));
        const code = matchedCode?.code ?? '+965';
        const number = matchedCode ? fullMobile.slice(code.length) : fullMobile;
        setCountryCode(code);
        contactForm.setData({
            company_id: '',
            email: '',
            mobile: number,
            order_number: contact.order_number ?? '',
            product_name: contact.product_name ?? '',
            profit: contact.profit ?? '',
            total_order_amount: contact.total_order_amount ?? '',
            order_date: contact.order_date ? contact.order_date.split('T')[0] : '',
            order_status: contact.order_status,
            paid_status: contact.paid_status ?? 'Non-Paid',
        });
    };

    const handleUpdateContact = (e: FormEvent) => {
        e.preventDefault();
        if (!editingContact) return;
        const mobileWithCode = `${countryCode}${contactForm.data.mobile}`;
        contactForm.setData('mobile', mobileWithCode);
        contactForm.put(`/contacts/${editingContact.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                contactForm.reset();
                setEditingContact(null);
                setCountryCode('+965');
            },
        });
    };

    const handleDeleteContact = (id: number) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            router.delete(`/contacts/${id}`, { preserveScroll: true });
        }
    };

    const parseAndFill = (text: string) => {
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{3,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,6}/);
        if (phoneMatch) {
            const phone = phoneMatch[0].replace(/[^0-9+]/g, '');
            const matchedCode = countryCodes.find((c) => phone.startsWith(c.code));
            if (matchedCode) {
                setCountryCode(matchedCode.code);
                contactForm.setData('mobile', phone.slice(matchedCode.code.length));
            } else {
                contactForm.setData('mobile', phone);
            }
        }
        const orderMatch = text.match(/(?:Order|Order\s*No|Order\s*Number|A)\s*[:#]?\s*([A-Za-z0-9-]+)/i);
        if (orderMatch) contactForm.setData('order_number', orderMatch[1]);
        const productMatch = text.match(/(?:Product|Item|Product\s*Name)\s*[:#]?\s*(.+)/i);
        if (productMatch) contactForm.setData('product_name', productMatch[1].trim());
        const amountMatch = text.match(/(?:Total|Amount|KWD|KD)\s*[:#]?\s*([\d.,]+)/i);
        if (amountMatch) contactForm.setData('total_order_amount', amountMatch[1].replace(/,/g, ''));
        const profitMatch = text.match(/(?:Profit)\s*[:#]?\s*([\d.,]+)/i);
        if (profitMatch) contactForm.setData('profit', profitMatch[1].replace(/,/g, ''));
        if (text.toLowerCase().includes('paid')) contactForm.setData('paid_status', 'Paid');
        else if (text.toLowerCase().includes('non-paid') || text.toLowerCase().includes('unpaid')) contactForm.setData('paid_status', 'Non-Paid');
        if (text.toLowerCase().includes('completed') || text.toLowerCase().includes('done')) contactForm.setData('order_status', 'Done');
        else if (text.toLowerCase().includes('pending')) contactForm.setData('order_status', 'Pending');
        else if (text.toLowerCase().includes('upcoming')) contactForm.setData('order_status', 'Upcoming');
        else if (text.toLowerCase().includes('cancel')) contactForm.setData('order_status', 'Cancel');
    };

    const handleAiAutofill = () => parseAndFill(aiInput);
    const handleClearAi = () => { setAiInput(''); contactForm.reset(); setCountryCode('+965'); };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setOcrProcessing(true);
                try {
                    const result = await Tesseract.recognize(file, 'eng', { logger: (m) => console.log(m) });
                    const extractedText = result.data.text;
                    setAiInput(extractedText);
                    if (extractedText.trim()) parseAndFill(extractedText);
                } catch (err) {
                    console.error('OCR failed:', err);
                    alert('Failed to extract text from image. Please try again.');
                } finally {
                    setOcrProcessing(false);
                }
            } else {
                alert('Please upload an image file (JPG, PNG, etc.)');
            }
        }
        e.target.value = '';
    };

    const bdt = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);

    const dashboardRef = useRef<HTMLDivElement>(null);

    const computedStats = useMemo(() => {
        const totalOrders = contacts.length;
        const upcomingOrders = contacts.filter((c) => c.order_status === 'Upcoming').length;
        const deliveredOrders = contacts.filter((c) => c.order_status === 'Done').length;
        const cancelledOrders = contacts.filter((c) => c.order_status === 'Cancel').length;
        const paidOrders = contacts.filter((c) => c.paid_status === 'Paid').length;
        const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : '0.0';
        const totalProducts = new Set(contacts.filter((c) => c.product_name).map((c) => c.product_name)).size;
        const avgOrderValue = totalOrders > 0 ? stats.totalIncome / totalOrders : 0;
        return { totalOrders, upcomingOrders, deliveredOrders, cancelledOrders, paidOrders, conversionRate, totalProducts, avgOrderValue };
    }, [contacts, stats]);

    const chartData = useMemo(() => {
        const months = Object.keys(charts.profitByMonth || {});
        return months.map((month) => ({
            name: month,
            revenue: charts.profitByMonth?.[month] || 0,
            expense: charts.expensesByMonth?.[month] || 0,
            profit: (charts.profitByMonth?.[month] || 0) - (charts.expensesByMonth?.[month] || 0),
        }));
    }, [charts]);

    const statusData = useMemo(() => {
        const data = charts.contactsByStatus || {};
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [charts]);

    const recentContacts = useMemo(() => contacts.slice(0, 5), [contacts]);

    const aiInsights = useMemo(() => {
        const insights = [];
        if (stats.netProfit > 0) insights.push({ icon: TrendingUp, text: `Net profit is positive at ${bdt(stats.netProfit)}`, color: 'text-emerald-400' });
        if (computedStats.upcomingOrders > 0) insights.push({ icon: Clock, text: `${computedStats.upcomingOrders} orders are pending`, color: 'text-amber-400' });
        if (computedStats.deliveredOrders > 0) insights.push({ icon: CheckCircle2, text: `${computedStats.deliveredOrders} orders completed successfully`, color: 'text-emerald-400' });
        if (computedStats.conversionRate !== '0.0') insights.push({ icon: Target, text: `Conversion rate is ${computedStats.conversionRate}%`, color: 'text-blue-400' });
        if (contacts.length > 0) insights.push({ icon: Users, text: `Managing ${contacts.length} contacts across your business`, color: 'text-purple-400' });
        return insights.slice(0, 4);
    }, [stats, computedStats, contacts]);

    const notifications = useMemo(() => {
        const items = [];
        const upcoming = contacts.filter((c) => c.order_status === 'Upcoming');
        const pending = contacts.filter((c) => c.order_status === 'Pending');

        upcoming.slice(0, 5).forEach((c) => {
            const dateStr = c.order_date
                ? new Date(c.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'No date';
            items.push({
                id: `up-${c.id}`,
                icon: ShoppingCart,
                text: c.product_name || 'New Order',
                sub: c.mobile || 'No mobile',
                time: dateStr,
                color: 'bg-amber-500',
            });
        });

        pending.slice(0, 5).forEach((c) => {
            const dateStr = c.order_date
                ? new Date(c.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'No date';
            items.push({
                id: `pend-${c.id}`,
                icon: Clock,
                text: c.product_name || 'Pending Order',
                sub: c.mobile || 'No mobile',
                time: dateStr,
                color: 'bg-blue-500',
            });
        });

        if (items.length === 0) {
            items.push({ id: 'empty', icon: CheckCircle2, text: 'All caught up!', sub: 'No pending items', time: '', color: 'bg-emerald-500' });
        }

        return items;
    }, [contacts]);

    const goalProgress = useMemo(() => ({
        revenue: Math.min((stats.totalIncome / 10000) * 100, 100),
        profit: Math.min((stats.netProfit / 5000) * 100, 100),
        orders: Math.min((computedStats.totalOrders / 100) * 100, 100),
        customers: Math.min((contacts.length / 50) * 100, 100),
    }), [stats, computedStats, contacts]);

    useEffect(() => {
        if (dashboardRef.current) {
            gsap.fromTo(dashboardRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-notifications]')) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showNotifications]);

    return (
        <>
            <Head title="Dashboard" />
            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6" ref={dashboardRef}>
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative isolate rounded-2xl p-6 text-white shadow-xl shadow-slate-900/50 md:p-8"
                >
                    <HeroBackground />
                    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">Live Dashboard</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome to Jahan CRM</h1>
                            <p className="mt-1 text-sm text-slate-400">Your business analytics at a glance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 backdrop-blur-sm">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="relative" data-notifications>
                                <button onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }} className="relative rounded-xl border border-slate-700 bg-slate-800/50 p-2.5 backdrop-blur-sm transition-colors hover:bg-slate-700/50">
                                    <Bell size={18} className="text-slate-300" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{notifications.length}</span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
                                        >
                                            <div className="border-b border-slate-800 p-4">
                                                <h3 className="font-semibold text-white">Notifications</h3>
                                                <p className="text-xs text-slate-500">{notifications.length} item{notifications.length !== 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => { setShowNotifications(false); router.get('/contacts', { search: n.sub }, { preserveState: false, replace: true }); }}
                                                        className="flex cursor-pointer items-start gap-3 border-b border-slate-800/50 p-4 transition-colors hover:bg-slate-800/50"
                                                    >
                                                        <div className={`rounded-lg ${n.color} p-2 flex-shrink-0`}>
                                                            <n.icon size={14} className="text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{n.text}</p>
                                                            <p className="text-xs text-slate-400 truncate">{n.sub}</p>
                                                            <p className="mt-1 text-[11px] text-slate-500">{n.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={() => setShowForm('contact')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40">
                                <Plus size={18} /> New Contact
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Date Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2"
                >
                    {([
                        { key: 'today', label: 'Today' },
                        { key: 'yesterday', label: 'Yesterday' },
                        { key: '7days', label: 'Last 7 Days' },
                        { key: '30days', label: 'Last 30 Days' },
                        { key: 'month', label: 'This Month' },
                        { key: 'lastMonth', label: 'Last Month' },
                        { key: 'year', label: 'This Year' },
                    ] as const).map((f) => (
                        <button
                            key={f.key}
                            onClick={() => handleDateFilter(f.key)}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                dateFilter === f.key
                                    ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/30'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </motion.div>

                {/* KPI Cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {[
                        { label: 'Total Revenue', value: bdt(stats.totalIncome), icon: DollarSign, color: 'from-blue-500 to-blue-600', change: '+12.5%', up: true },
                        { label: 'Net Profit', value: bdt(stats.netProfit), icon: TrendingUp, color: stats.netProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600', change: stats.netProfit >= 0 ? '+8.2%' : '-3.1%', up: stats.netProfit >= 0 },
                        { label: 'Total Orders', value: computedStats.totalOrders.toString(), icon: ShoppingCart, color: 'from-cyan-500 to-cyan-600', change: '+5.3%', up: true },
                        { label: 'New Customers', value: stats.contacts.toString(), icon: Users, color: 'from-purple-500 to-purple-600', change: '+18.7%', up: true },
                        { label: 'Avg Order Value', value: bdt(computedStats.avgOrderValue), icon: BarChart3, color: 'from-amber-500 to-amber-600', change: '+2.4%', up: true },
                    ].map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
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
                                        {kpi.change}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tracking-tight text-white">{kpi.value}</p>
                                <p className="mt-1 text-sm text-slate-400">{kpi.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Secondary KPIs */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Upcoming Orders', value: computedStats.upcomingOrders, icon: Timer, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Delivered', value: computedStats.deliveredOrders, icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Cancelled', value: computedStats.cancelledOrders, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
                        { label: 'Products', value: computedStats.totalProducts, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/50"
                        >
                            <div className={`${item.bg} rounded-xl p-3`}>
                                <item.icon size={20} className={item.color} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{item.value}</p>
                                <p className="text-sm text-slate-400">{item.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Main Charts Row */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm lg:col-span-2"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                                <p className="text-sm text-slate-400">Monthly revenue vs expenses</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-slate-400">Revenue</span></div>
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500" /><span className="text-slate-400">Expenses</span></div>
                                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-slate-400">Profit</span></div>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                        labelStyle={{ color: '#F8FAFC' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#gradientRevenue)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={0.1} fill="#EF4444" strokeWidth={2} />
                                    <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#gradientProfit)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Order Status Pie */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-white">Order Status</h3>
                        <p className="mb-4 text-sm text-slate-400">Distribution of orders</p>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, value }) => {
                                            const total = statusData.reduce((sum, item) => sum + item.value, 0);
                                            const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
                                            return `${pct}%`;
                                        }}
                                        labelLine={true}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#64748B'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                        formatter={(value: number, name: string) => {
                                            const total = statusData.reduce((sum, item) => sum + item.value, 0);
                                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                            return [`${value} (${pct}%)`, name];
                                        }}
                                    />
                                    <Legend />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </section>

                {/* AI Insights + Goal Tracker + Business Health */}
                <section className="grid gap-6 lg:grid-cols-4">
                    {/* AI Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                                <Brain size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                                <p className="text-xs text-purple-400">Powered by Jahan CRM</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {aiInsights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-800/30 p-3"
                                >
                                    <insight.icon size={16} className={`mt-0.5 ${insight.color}`} />
                                    <p className="text-sm text-slate-300">{insight.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Goal Tracker */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5">
                                <Target size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Goal Tracker</h3>
                                <p className="text-xs text-slate-400">Monthly progress</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Revenue', progress: goalProgress.revenue, color: '#3B82F6' },
                                { label: 'Profit', progress: goalProgress.profit, color: '#10B981' },
                                { label: 'Orders', progress: goalProgress.orders, color: '#06B6D4' },
                                { label: 'Customers', progress: goalProgress.customers, color: '#8B5CF6' },
                            ].map((goal) => (
                                <div key={goal.label}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-slate-400">{goal.label}</span>
                                        <span className="font-medium text-white">{goal.progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: goal.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 p-2.5">
                                <Activity size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                                <p className="text-xs text-slate-400">Latest updates</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recentContacts.map((contact, i) => (
                                <motion.div
                                    key={contact.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + i * 0.08 }}
                                    className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-800/30 p-3"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white">
                                        {contact.mobile?.slice(-2) || 'NA'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-medium text-white">{contact.product_name || 'Order'}</p>
                                        <p className="text-xs text-slate-500">{contact.mobile || 'No mobile'}</p>
                                    </div>
                                    <StatusBadge status={contact.order_status} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Business Health Score */}
                    <BusinessHealthScore contacts={contacts} stats={stats} />
                </section>
                <nav className="flex gap-2 overflow-x-auto border-b border-slate-800">
                    {(['overview', 'contacts'] as const).map((item) => (
                        <button
                            key={item}
                            onClick={() => setTab(item)}
                            className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-all ${
                                tab === item
                                    ? 'border-teal-500 text-white'
                                    : 'border-transparent text-slate-400 hover:text-slate-300'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                {tab === 'contacts' && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 p-5">
                            <div>
                                <h2 className="font-semibold text-white">Contacts</h2>
                                <p className="text-sm text-slate-500">People you work with</p>
                            </div>
                            <div className="flex gap-3">
                                <a href="/contacts/csv" download className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-700/50">
                                    <Download size={16} /> Download
                                </a>
                                <button onClick={() => setShowForm('contact')} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-teal-400 hover:to-cyan-400">
                                    Add Contact
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-y border-slate-800 bg-slate-800/50 text-slate-300">
                                    <tr>
                                        <th className="p-4 font-medium">Mobile</th>
                                        <th className="p-4 font-medium">Order #</th>
                                        <th className="p-4 font-medium">Product</th>
                                        <th className="p-4 font-medium">Profit (KWD)</th>
                                        <th className="p-4 font-medium">Amount (KWD)</th>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Paid</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 last:border-0">
                                            <td className="p-4 text-slate-400">{contact.mobile ?? '—'}</td>
                                            <td className="p-4 text-slate-400">{contact.order_number ?? '—'}</td>
                                            <td className="p-4 text-slate-400">{contact.product_name ?? '—'}</td>
                                            <td className="p-4">{contact.profit ? Number(contact.profit).toLocaleString('en-US', { style: 'currency', currency: 'KWD', maximumFractionDigits: 3 }) : '—'}</td>
                                            <td className="p-4">{contact.total_order_amount ? Number(contact.total_order_amount).toLocaleString('en-US', { style: 'currency', currency: 'KWD', maximumFractionDigits: 3 }) : '—'}</td>
                                            <td className="p-4 text-slate-400">{contact.order_date ? new Date(contact.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                            <td className="p-4"><StatusBadge status={contact.order_status} /></td>
                                            <td className="p-4"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${contact.paid_status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{contact.paid_status ?? 'Non-Paid'}</span></td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditContact(contact)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-500/20 hover:text-blue-400"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDeleteContact(contact.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.length === 0 && (
                                        <tr><td colSpan={9}><div className="flex flex-col items-center justify-center p-8"><p className="text-sm text-slate-400">No contacts yet.</p></div></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.section>
                )}
            </main>

            {/* Add Contact Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowForm(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                            <h2 className="text-lg font-semibold text-white">Add {showForm}</h2>
                            <button onClick={() => setShowForm(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={20} /></button>
                        </div>
                        {showForm === 'company' && (
                            <form onSubmit={(e) => submit(e, companyForm, '/companies')} className="space-y-3 px-5 py-3">
                                <Input label="Company name" value={companyForm.data.name} onChange={(v) => companyForm.setData('name', v)} required />
                                <Input label="Industry" value={companyForm.data.industry} onChange={(v) => companyForm.setData('industry', v)} />
                                <Input label="Website" value={companyForm.data.website} onChange={(v) => companyForm.setData('website', v)} />
                                <Input label="Phone" value={companyForm.data.phone} onChange={(v) => companyForm.setData('phone', v)} />
                                <Submit />
                            </form>
                        )}
                        {showForm === 'contact' && (
                            <>
                                <div className="border-b border-slate-800 px-5 py-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Sparkles size={16} className="text-purple-400" />
                                        <span className="text-sm font-medium text-white">AI Assistant</span>
                                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">AI</span>
                                    </div>
                                    <p className="mb-2 text-xs text-slate-400">Paste WhatsApp, Invoice or Customer Details</p>
                                    <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder={"Customer: +96598765432\nProduct: iPhone 15 Pro Max\nOrder A1025"} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20" />
                                    <div className="mt-2 flex gap-2">
                                        <button type="button" onClick={handleAiAutofill} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400">
                                            <Wand2 size={14} /> AI Autofill
                                        </button>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={ocrProcessing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50">
                                            {ocrProcessing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                            {ocrProcessing ? 'Processing...' : 'Upload'}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                        <button type="button" onClick={handleClearAi} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-700">
                                            <Trash2 size={14} /> Clear
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={(e) => submit(e, contactForm, '/contacts')} className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-300">Mobile Number</label>
                                            <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <input type="checkbox" checked={aiEnabled.mobile} onChange={(e) => setAiEnabled({ ...aiEnabled, mobile: e.target.checked })} className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500" />
                                                <Sparkles size={10} className="text-purple-400" /> AI
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-teal-500">
                                                {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}
                                            </select>
                                            <input type="tel" value={contactForm.data.mobile} onChange={(e) => contactForm.setData('mobile', e.target.value)} placeholder="Enter number" className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500" />
                                        </div>
                                    </div>
                                    <Input label="Order Number" value={contactForm.data.order_number} onChange={(v) => contactForm.setData('order_number', v)} />
                                    <Input label="Product name" value={contactForm.data.product_name} onChange={(v) => contactForm.setData('product_name', v)} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Profit (KWD)" type="number" step="0.001" value={contactForm.data.profit} onChange={(v) => contactForm.setData('profit', v)} />
                                        <Input label="Total Amount (KWD)" type="number" step="0.001" value={contactForm.data.total_order_amount} onChange={(v) => contactForm.setData('total_order_amount', v)} />
                                    </div>
                                    <Input label="Order's date" type="date" value={contactForm.data.order_date} onChange={(v) => contactForm.setData('order_date', v)} />
                                    <div>
                                        <p className="mb-1.5 text-xs font-medium text-slate-300">Order's status</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {([
                                                ['Done', 'bg-green-500', '🟢'],
                                                ['Cancel', 'bg-red-500', '🔴'],
                                                ['Pending', 'bg-sky-400', '🔵'],
                                                ['Upcoming', 'bg-yellow-400', '🟡'],
                                            ] as const).map(([label, color, emoji]) => (
                                                <label key={label} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${contactForm.data.order_status === label ? `border-${color.replace('bg-', '')}/50 ${color}/20 text-white` : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                                    <input type="radio" name="order_status" value={label} checked={contactForm.data.order_status === label} onChange={(e) => contactForm.setData('order_status', e.target.value)} className="sr-only" />
                                                    <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-xs font-medium text-slate-300">Paid Status</p>
                                        <div className="flex gap-1.5">
                                            {([
                                                ['Paid', 'bg-green-500', '🟢'],
                                                ['Non-Paid', 'bg-red-500', '🔴'],
                                            ] as const).map(([label, color, emoji]) => (
                                                <label key={label} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${contactForm.data.paid_status === label ? `border-${color.replace('bg-', '')}/50 ${color}/20 text-white` : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                                    <input type="radio" name="paid_status" value={label} checked={contactForm.data.paid_status === label} onChange={(e) => contactForm.setData('paid_status', e.target.value)} className="sr-only" />
                                                    <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setShowForm(null)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Cancel</button>
                                        <button type="submit" disabled={contactForm.processing} className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50">
                                            {contactForm.processing ? 'Saving...' : 'Save Contact'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Edit Contact Modal */}
            {editingContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEditingContact(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                            <h2 className="text-lg font-semibold text-white">Edit Contact</h2>
                            <button onClick={() => setEditingContact(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateContact} className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-3">
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label className="text-xs font-medium text-slate-300">Mobile Number</label>
                                    <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <input type="checkbox" checked={aiEnabled.mobile} onChange={(e) => setAiEnabled({ ...aiEnabled, mobile: e.target.checked })} className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500" />
                                        <Sparkles size={10} className="text-purple-400" /> AI
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-teal-500">
                                        {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}
                                    </select>
                                    <input type="tel" value={contactForm.data.mobile} onChange={(e) => contactForm.setData('mobile', e.target.value)} placeholder="Enter number" className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500" />
                                </div>
                            </div>
                            <Input label="Order Number" value={contactForm.data.order_number} onChange={(v) => contactForm.setData('order_number', v)} />
                            <Input label="Product name" value={contactForm.data.product_name} onChange={(v) => contactForm.setData('product_name', v)} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Profit (KWD)" type="number" step="0.001" value={contactForm.data.profit} onChange={(v) => contactForm.setData('profit', v)} />
                                <Input label="Total Amount (KWD)" type="number" step="0.001" value={contactForm.data.total_order_amount} onChange={(v) => contactForm.setData('total_order_amount', v)} />
                            </div>
                            <Input label="Order's date" type="date" value={contactForm.data.order_date} onChange={(v) => contactForm.setData('order_date', v)} />
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-slate-300">Order's status</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {([
                                        ['Done', 'bg-green-500', '🟢'],
                                        ['Cancel', 'bg-red-500', '🔴'],
                                        ['Pending', 'bg-sky-400', '🔵'],
                                        ['Upcoming', 'bg-yellow-400', '🟡'],
                                    ] as const).map(([label, color, emoji]) => (
                                        <label key={label} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${contactForm.data.order_status === label ? `border-${color.replace('bg-', '')}/50 ${color}/20 text-white` : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                            <input type="radio" name="order_status" value={label} checked={contactForm.data.order_status === label} onChange={(e) => contactForm.setData('order_status', e.target.value)} className="sr-only" />
                                            <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-slate-300">Paid Status</p>
                                <div className="flex gap-1.5">
                                    {([
                                        ['Paid', 'bg-green-500', '🟢'],
                                        ['Non-Paid', 'bg-red-500', '🔴'],
                                    ] as const).map(([label, color, emoji]) => (
                                        <label key={label} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${contactForm.data.paid_status === label ? `border-${color.replace('bg-', '')}/50 ${color}/20 text-white` : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                            <input type="radio" name="paid_status" value={label} checked={contactForm.data.paid_status === label} onChange={(e) => contactForm.setData('paid_status', e.target.value)} className="sr-only" />
                                            <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingContact(null)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Cancel</button>
                                <button type="submit" disabled={contactForm.processing} className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50">
                                    {contactForm.processing ? 'Saving...' : 'Update Contact'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <SalesChatbot contacts={contacts} />
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Done: 'bg-green-500/20 text-green-400',
        Cancel: 'bg-red-500/20 text-red-400',
        Pending: 'bg-sky-400/20 text-sky-400',
        Upcoming: 'bg-yellow-400/20 text-yellow-400',
    };
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-slate-500/20 text-slate-400'}`}>{status}</span>;
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
    return (
        <label className="block text-xs font-medium text-slate-300">
            {label}
            <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-normal text-white outline-none transition-colors focus:border-teal-500" />
        </label>
    );
}

function Submit() {
    return (
        <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40">
            Save
        </button>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'KCRM', href: '/dashboard' }] };
