import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ShoppingCart,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    DollarSign,
    Users,
    Megaphone,
    Package,
    Receipt,
    FileText,
    Plus,
    X,
    Brain,
    Sparkles,
    Filter,
    Bell,
    Send,
    Trash2,
    GripVertical,
    Eye,
    TrendingUp,
    Zap,
} from 'lucide-react';
import HeroBackground from '@/components/hero-background';

type Contact = {
    id: number;
    name: string | null;
    mobile: string | null;
    product_name: string | null;
    profit: string | null;
    total_order_amount: string | null;
    order_date: string | null;
    order_status: string;
    paid_status: string;
    created_at: string;
};

type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    category: 'order' | 'payment' | 'ads' | 'customer' | 'product' | 'expense' | 'report';
    status: 'done' | 'pending' | 'upcoming' | 'overdue' | 'cancelled';
    description?: string;
    amount?: number;
    contactId?: number;
};

const bdt = (n: number) => `৳${n.toLocaleString()}`;

const CATEGORIES = {
    order: { color: '#10B981', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Orders', icon: ShoppingCart },
    payment: { color: '#3B82F6', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Payments', icon: DollarSign },
    ads: { color: '#8B5CF6', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Facebook Ads', icon: Megaphone },
    customer: { color: '#F97316', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Customers', icon: Users },
    product: { color: '#EAB308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Products', icon: Package },
    expense: { color: '#EF4444', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Expenses', icon: Receipt },
    report: { color: '#06B6D4', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Reports', icon: FileText },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    done: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Done' },
    pending: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Pending' },
    upcoming: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Upcoming' },
    overdue: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Overdue' },
    cancelled: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Cancelled' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOUR_NAMES = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    return `${h}${i < 12 ? ' AM' : ' PM'}`;
});

type View = 'month' | 'week' | 'day' | 'agenda';

export default function SmartCalendar({ contacts }: { contacts: Contact[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(CATEGORIES)));
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createDate, setCreateDate] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

    // Create events from contacts
    const contactEvents = useMemo<CalendarEvent[]>(() => {
        return contacts.map((c) => {
            const dateKey = c.order_date
                ? new Date(c.order_date).toISOString().slice(0, 10)
                : c.created_at.slice(0, 10);
            const statusMap: Record<string, CalendarEvent['status']> = {
                Done: 'done', Pending: 'pending', Upcoming: 'upcoming', Cancel: 'cancelled',
            };
            return {
                id: `contact-${c.id}`,
                title: c.product_name || 'Order',
                date: dateKey,
                category: 'order' as const,
                status: statusMap[c.order_status] || 'pending',
                description: `${c.mobile || 'No mobile'} · ${bdt(Number(c.total_order_amount || 0))}`,
                amount: Number(c.total_order_amount || 0),
                contactId: c.id,
            };
        });
    }, [contacts]);

    const allEvents = useMemo(() => [...contactEvents, ...events], [contactEvents, events]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter((e) => activeFilters.has(e.category));
    }, [allEvents, activeFilters]);

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

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date().toISOString().slice(0, 10);

    // Generate business events
    const businessEvents = useMemo(() => {
        const items: CalendarEvent[] = [];
        const now = new Date();

        // Payments due (based on unpaid contacts)
        contacts.filter((c) => c.paid_status === 'Non-Paid').forEach((c) => {
            const dateKey = c.order_date ? new Date(c.order_date).toISOString().slice(0, 10) : c.created_at.slice(0, 10);
            const orderDate = new Date(dateKey);
            const dueDate = new Date(orderDate);
            dueDate.setDate(dueDate.getDate() + 7);
            if (dueDate >= now) {
                items.push({
                    id: `payment-${c.id}`,
                    title: `Payment Due: ${c.product_name || 'Order'}`,
                    date: dueDate.toISOString().slice(0, 10),
                    category: 'payment',
                    status: dueDate < new Date(now.getTime() + 2 * 86400000) ? 'overdue' : 'pending',
                    description: `Customer: ${c.mobile || 'N/A'} · Amount: ${bdt(Number(c.total_order_amount || 0))}`,
                    amount: Number(c.total_order_amount || 0),
                    contactId: c.id,
                });
            }
        });

        // Monthly report reminders
        for (let m = 0; m < 3; m++) {
            const reportDate = new Date(now.getFullYear(), now.getMonth() + m, 28);
            items.push({
                id: `report-${m}`,
                title: `Monthly Report Due`,
                date: reportDate.toISOString().slice(0, 10),
                category: 'report',
                status: 'upcoming',
                description: 'Generate monthly business report',
            });
        }

        // Expense reminders
        const internetDue = new Date(now.getFullYear(), now.getMonth(), 5);
        if (internetDue >= now) {
            items.push({
                id: 'expense-internet',
                title: 'Internet Bill Due',
                date: internetDue.toISOString().slice(0, 10),
                category: 'expense',
                status: 'pending',
                description: 'Monthly mobile internet bill',
            });
        }

        const fbDue = new Date(now.getFullYear(), now.getMonth(), 15);
        if (fbDue >= now) {
            items.push({
                id: 'expense-fb',
                title: 'Facebook Ads Payment',
                date: fbDue.toISOString().slice(0, 10),
                category: 'expense',
                status: 'pending',
                description: 'Monthly Facebook Ads budget',
            });
        }

        // Weekly review
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
        items.push({
            id: 'report-weekly',
            title: 'Weekly Business Review',
            date: nextMonday.toISOString().slice(0, 10),
            category: 'report',
            status: 'upcoming',
            description: 'Review weekly performance and goals',
        });

        // Campaign reminders
        const campaignStart = new Date(now);
        campaignStart.setDate(now.getDate() + 3);
        items.push({
            id: 'ads-campaign',
            title: 'Facebook Campaign Launch',
            date: campaignStart.toISOString().slice(0, 10),
            category: 'ads',
            status: 'upcoming',
            description: 'Start new Facebook Ads campaign',
        });

        const campaignReview = new Date(now);
        campaignReview.setDate(now.getDate() + 14);
        items.push({
            id: 'ads-review',
            title: 'Campaign Performance Review',
            date: campaignReview.toISOString().slice(0, 10),
            category: 'ads',
            status: 'upcoming',
            description: 'Review ROAS and optimize campaigns',
        });

        // Customer follow-ups
        const uniqueCustomers = new Map<string, Contact>();
        contacts.forEach((c) => {
            if (c.mobile && !uniqueCustomers.has(c.mobile)) uniqueCustomers.set(c.mobile, c);
        });
        Array.from(uniqueCustomers.values()).slice(0, 5).forEach((c, i) => {
            const followUp = new Date(now);
            followUp.setDate(now.getDate() + 2 + i * 3);
            items.push({
                id: `followup-${c.id}`,
                title: `Follow-up: ${c.mobile || 'Customer'}`,
                date: followUp.toISOString().slice(0, 10),
                category: 'customer',
                status: 'upcoming',
                description: `Follow up with customer about ${c.product_name || 'order'}`,
                contactId: c.id,
            });
        });

        return items;
    }, [contacts]);

    const allEventsWithBiz = useMemo(() => [...contactEvents, ...businessEvents, ...events], [contactEvents, businessEvents, events]);
    const finalFilteredEvents = useMemo(() => allEventsWithBiz.filter((e) => activeFilters.has(e.category)), [allEventsWithBiz, activeFilters]);

    // Get events for a specific date
    const getEventsForDate = useCallback((dateKey: string) => {
        return finalFilteredEvents.filter((e) => e.date === dateKey);
    }, [finalFilteredEvents]);

    // Month stats
    const monthStats = useMemo(() => {
        const monthEvents = finalFilteredEvents.filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        return {
            total: monthEvents.length,
            orders: monthEvents.filter((e) => e.category === 'order').length,
            payments: monthEvents.filter((e) => e.category === 'payment').length,
            campaigns: monthEvents.filter((e) => e.category === 'ads').length,
            meetings: monthEvents.filter((e) => e.category === 'customer').length,
            expenses: monthEvents.filter((e) => e.category === 'expense').length,
            pending: monthEvents.filter((e) => e.status === 'pending' || e.status === 'upcoming').length,
            overdue: monthEvents.filter((e) => e.status === 'overdue').length,
        };
    }, [finalFilteredEvents, month, year]);

    // Notifications
    const notifications = useMemo(() => {
        return finalFilteredEvents.filter((e) => {
            const d = new Date(e.date);
            const diff = d.getTime() - new Date(today).getTime();
            return diff >= 0 && diff <= 3 * 86400000;
        }).slice(0, 8);
    }, [finalFilteredEvents, today]);

    // Calendar grid
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendarDays = useMemo(() => {
        const days: { day: number; dateKey: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
        for (let i = 0; i < firstDay; i++) {
            const d = prevMonthDays - firstDay + 1 + i;
            const m = month === 0 ? 11 : month - 1;
            const y = month === 0 ? year - 1 : year;
            const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateKey, isCurrentMonth: false, isToday: false });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateKey, isCurrentMonth: true, isToday: dateKey === today });
        }
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            const m = month === 11 ? 0 : month + 1;
            const y = month === 11 ? year + 1 : year;
            const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateKey, isCurrentMonth: false, isToday: false });
        }
        return days;
    }, [year, month, firstDay, daysInMonth, prevMonthDays, today]);

    // Week days
    const weekStart = useMemo(() => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }, [currentDate]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return {
                day: d.getDate(),
                dayName: DAY_NAMES[d.getDay()],
                dateKey: d.toISOString().slice(0, 10),
                isToday: d.toISOString().slice(0, 10) === today,
            };
        });
    }, [weekStart, today]);

    // Day hours
    const dayHours = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => i);
    }, []);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => { setCurrentDate(new Date()); setSelectedDate(today); };

    const toggleFilter = (cat: string) => {
        setActiveFilters((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Create event
    const [newEvent, setNewEvent] = useState({ title: '', category: 'order' as CalendarEvent['category'], description: '', status: 'pending' as CalendarEvent['status'] });

    const handleCreateEvent = () => {
        if (!newEvent.title || !createDate) return;
        const ev: CalendarEvent = {
            id: `custom-${Date.now()}`,
            title: newEvent.title,
            date: createDate,
            category: newEvent.category,
            status: newEvent.status,
            description: newEvent.description,
        };
        setEvents((prev) => [...prev, ev]);
        setShowCreateModal(false);
        setNewEvent({ title: '', category: 'order', description: '', status: 'pending' });
    };

    const handleDeleteEvent = (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    // Drag and drop
    const handleDragStart = (eventId: string) => setDraggedEvent(eventId);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (dateKey: string) => {
        if (!draggedEvent) return;
        if (draggedEvent.startsWith('contact-')) return;
        setEvents((prev) => prev.map((e) => e.id === draggedEvent ? { ...e, date: dateKey } : e));
        setDraggedEvent(null);
    };

    // AI Assistant
    const handleAI = (text?: string) => {
        const q = text || aiInput.trim();
        if (!q) return;
        setAiMessages((prev) => [...prev, { role: 'user', text: q }]);
        setAiInput('');

        const lower = q.toLowerCase();
        let response = '';

        if (lower.includes('today') || lower.includes('scheduled')) {
            const todayEvents = getEventsForDate(today);
            response = todayEvents.length > 0
                ? `📅 **Today's Schedule** (${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })})\n\n` +
                  todayEvents.map((e) => `• **${e.title}** (${CATEGORIES[e.category].label}) — ${STATUS_COLORS[e.status].label}`).join('\n')
                : 'No events scheduled for today.';
        } else if (lower.includes('overdue') || lower.includes('late')) {
            const overdue = finalFilteredEvents.filter((e) => e.status === 'overdue');
            response = overdue.length > 0
                ? `⚠️ **Overdue Items** (${overdue.length})\n\n` + overdue.map((e) => `• **${e.title}** — Due: ${e.date}`).join('\n')
                : 'No overdue items!';
        } else if (lower.includes('tomorrow')) {
            const tmr = new Date();
            tmr.setDate(tmr.getDate() + 1);
            const tmrKey = tmr.toISOString().slice(0, 10);
            const tmrEvents = getEventsForDate(tmrKey);
            response = tmrEvents.length > 0
                ? `📅 **Tomorrow's Schedule**\n\n` + tmrEvents.map((e) => `• **${e.title}** (${CATEGORIES[e.category].label})`).join('\n')
                : 'No events tomorrow.';
        } else if (lower.includes('payment')) {
            const pays = finalFilteredEvents.filter((e) => e.category === 'payment');
            response = pays.length > 0
                ? `💰 **Payments** (${pays.length})\n\n` + pays.map((e) => `• **${e.title}** — ${e.date} — ${STATUS_COLORS[e.status].label}`).join('\n')
                : 'No payment events.';
        } else if (lower.includes('campaign') || lower.includes('facebook') || lower.includes('ads')) {
            const ads = finalFilteredEvents.filter((e) => e.category === 'ads');
            response = ads.length > 0
                ? `📢 **Facebook Ads Events** (${ads.length})\n\n` + ads.map((e) => `• **${e.title}** — ${e.date}`).join('\n')
                : 'No ad campaign events.';
        } else if (lower.includes('follow') || lower.includes('customer')) {
            const cust = finalFilteredEvents.filter((e) => e.category === 'customer');
            response = cust.length > 0
                ? `👥 **Customer Follow-ups** (${cust.length})\n\n` + cust.map((e) => `• **${e.title}** — ${e.date}`).join('\n')
                : 'No customer follow-ups scheduled.';
        } else if (lower.includes('week') || lower.includes('this week')) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            const weekEvents = finalFilteredEvents.filter((e) => {
                const d = new Date(e.date);
                return d >= weekStart && d < weekEnd;
            });
            response = `📅 **This Week** (${weekEvents.length} events)\n\n` +
                weekEvents.map((e) => `• **${e.title}** — ${e.date} (${CATEGORIES[e.category].label})`).join('\n');
        } else if (lower.includes('summary') || lower.includes('overview')) {
            response = `📊 **Calendar Summary**\n\n` +
                `Total Events: ${finalFilteredEvents.length}\n` +
                `Orders: ${finalFilteredEvents.filter((e) => e.category === 'order').length}\n` +
                `Payments: ${finalFilteredEvents.filter((e) => e.category === 'payment').length}\n` +
                `Campaigns: ${finalFilteredEvents.filter((e) => e.category === 'ads').length}\n` +
                `Follow-ups: ${finalFilteredEvents.filter((e) => e.category === 'customer').length}\n` +
                `Expenses: ${finalFilteredEvents.filter((e) => e.category === 'expense').length}\n` +
                `Reports: ${finalFilteredEvents.filter((e) => e.category === 'report').length}\n\n` +
                `Overdue: ${finalFilteredEvents.filter((e) => e.status === 'overdue').length}\n` +
                `Pending: ${finalFilteredEvents.filter((e) => e.status === 'pending').length}`;
        } else {
            response = `🤖 **Calendar AI**\n\nI can help you with:\n• Today's schedule\n• Overdue items\n• Tomorrow's orders\n• Payment status\n• Campaign events\n• Customer follow-ups\n• Weekly overview\n• Calendar summary`;
        }

        setTimeout(() => setAiMessages((prev) => [...prev, { role: 'ai', text: response }]), 500);
    };

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <>
            <Head title="Smart Business Calendar" />
            <main className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-6">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50"
                >
                    <HeroBackground />
                    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
                                <CalendarDays size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Smart Business Calendar</h1>
                                <p className="mt-1 text-sm text-slate-400">Manage orders, payments, campaigns & events</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowAI(!showAI)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400">
                                <Brain size={16} /> AI Assistant
                            </button>
                            <div className="relative" data-notifications>
                                <button onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }} className="relative rounded-xl border border-slate-700 bg-slate-800/50 p-2.5 backdrop-blur-sm transition-colors hover:bg-slate-700/50">
                                    <Bell size={18} className="text-slate-300" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{notifications.length}</span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
                                            <div className="border-b border-slate-800 p-4">
                                                <h3 className="font-semibold text-white">Upcoming Events</h3>
                                                <p className="text-xs text-slate-500">{notifications.length} in next 3 days</p>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map((n) => {
                                                    const cat = CATEGORIES[n.category];
                                                    return (
                                                        <div key={n.id} className="flex items-start gap-3 border-b border-slate-800/50 p-3">
                                                            <div className={`rounded-lg ${cat.bg} p-2 flex-shrink-0`}><cat.icon size={14} className={cat.text} /></div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                                                <p className="text-xs text-slate-500">{n.date}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={() => { setCreateDate(today); setShowCreateModal(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400">
                                <Plus size={16} /> New Event
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {[
                        { label: 'Total Events', value: monthStats.total, icon: CalendarDays, color: 'text-white' },
                        { label: 'Orders', value: monthStats.orders, icon: ShoppingCart, color: 'text-emerald-400' },
                        { label: 'Payments', value: monthStats.payments, icon: DollarSign, color: 'text-blue-400' },
                        { label: 'Campaigns', value: monthStats.campaigns, icon: Megaphone, color: 'text-purple-400' },
                        { label: 'Follow-ups', value: monthStats.meetings, icon: Users, color: 'text-orange-400' },
                        { label: 'Pending', value: monthStats.pending, icon: Clock, color: 'text-amber-400' },
                        { label: 'Overdue', value: monthStats.overdue, icon: AlertCircle, color: 'text-red-400' },
                    ].map((s) => (
                        <div key={s.label} className="group rounded-xl border border-slate-800 bg-slate-900/50 p-3 transition-all hover:border-slate-700 hover:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <s.icon size={14} className={s.color} />
                                <span className="text-[11px] text-slate-500">{s.label}</span>
                            </div>
                            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* View Controls + Filters */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button onClick={goToday} className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white">Today</button>
                        <button onClick={prevMonth} className="rounded-lg border border-slate-700 bg-slate-800/50 p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"><ChevronLeft size={16} /></button>
                        <button onClick={nextMonth} className="rounded-lg border border-slate-700 bg-slate-800/50 p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"><ChevronRight size={16} /></button>
                        <h2 className="ml-2 text-lg font-bold text-white">{MONTH_NAMES[month]} {year}</h2>
                        <div className="ml-4 flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
                            {(['month', 'week', 'day', 'agenda'] as View[]).map((v) => (
                                <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${view === v ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-300'}`}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${showFilters ? 'border-teal-500/50 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
                            <Filter size={14} /> Filters
                        </button>
                    </div>
                </motion.div>

                {/* Filter Chips */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 overflow-hidden">
                            {Object.entries(CATEGORIES).map(([key, cat]) => {
                                const active = activeFilters.has(key);
                                return (
                                    <button key={key} onClick={() => toggleFilter(key)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active ? `${cat.border} ${cat.bg} ${cat.text}` : 'border-slate-700 bg-slate-800/50 text-slate-500'}`}>
                                        <cat.icon size={12} /> {cat.label}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-4">
                    {/* Calendar */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1">
                        {view === 'month' && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="mb-2 grid grid-cols-7 gap-1">
                                    {DAY_NAMES.map((d) => <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map(({ day, dateKey, isCurrentMonth, isToday: isT }) => {
                                        const dayEvents = getEventsForDate(dateKey);
                                        const isSelected = dateKey === selectedDate;
                                        return (
                                            <div
                                                key={dateKey}
                                                draggable={dayEvents.some((e) => !e.id.startsWith('contact-'))}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(dateKey)}
                                                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                                                className={`relative flex min-h-[80px] cursor-pointer flex-col rounded-xl p-1.5 transition-all sm:min-h-[100px] ${
                                                    isSelected ? 'border-2 border-teal-500 bg-teal-500/10' :
                                                    isT ? 'border border-teal-500/30 bg-slate-800/80' :
                                                    isCurrentMonth ? 'border border-slate-800/50 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/60' :
                                                    'border border-transparent bg-slate-800/10 opacity-40'
                                                }`}
                                            >
                                                <span className={`text-xs font-medium ${isT ? 'text-teal-400' : isCurrentMonth ? 'text-slate-400' : 'text-slate-600'}`}>{day}</span>
                                                <div className="mt-auto space-y-0.5">
                                                    {dayEvents.slice(0, 3).map((e) => {
                                                        const cat = CATEGORIES[e.category];
                                                        return (
                                                            <div
                                                                key={e.id}
                                                                draggable={!e.id.startsWith('contact-')}
                                                                onDragStart={() => handleDragStart(e.id)}
                                                                className={`flex items-center gap-1 rounded-md px-1 py-0.5 ${cat.bg} text-[10px] font-medium ${cat.text} cursor-grab truncate`}
                                                                title={e.title}
                                                            >
                                                                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                                                                <span className="truncate">{e.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {dayEvents.length > 3 && (
                                                        <span className="text-[10px] text-slate-500">+{dayEvents.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {view === 'week' && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="grid grid-cols-7 gap-2">
                                    {weekDays.map((wd) => (
                                        <div key={wd.dateKey} onClick={() => { setSelectedDate(wd.dateKey); setView('day'); }} className={`cursor-pointer rounded-xl border p-3 transition-all ${wd.isToday ? 'border-teal-500/30 bg-teal-500/10' : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'}`}>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">{wd.dayName}</p>
                                                <p className={`text-lg font-bold ${wd.isToday ? 'text-teal-400' : 'text-white'}`}>{wd.day}</p>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {getEventsForDate(wd.dateKey).slice(0, 4).map((e) => {
                                                    const cat = CATEGORIES[e.category];
                                                    return (
                                                        <div key={e.id} className={`rounded-md px-2 py-1 text-[10px] font-medium ${cat.bg} ${cat.text} truncate`}>{e.title}</div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {view === 'day' && selectedDate && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                                    <span className="text-sm text-slate-400">{getEventsForDate(selectedDate).length} events</span>
                                </div>
                                <div className="space-y-0">
                                    {dayHours.map((hour) => {
                                        const hourEvents = getEventsForDate(selectedDate).filter((_, i) => i % 6 === hour % 6);
                                        return (
                                            <div key={hour} className="flex border-t border-slate-800/50">
                                                <div className="w-16 flex-shrink-0 py-2 text-right text-[11px] text-slate-600">{HOUR_NAMES[hour]}</div>
                                                <div className="flex-1 py-1">
                                                    {hour === 9 && getEventsForDate(selectedDate).slice(0, 1).map((e) => {
                                                        const cat = CATEGORIES[e.category];
                                                        return (
                                                            <div key={e.id} className={`mb-1 rounded-lg px-3 py-2 ${cat.bg} border ${cat.border}`}>
                                                                <p className={`text-sm font-medium ${cat.text}`}>{e.title}</p>
                                                                <p className="text-xs text-slate-500">{e.description}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {getEventsForDate(selectedDate).map((e) => {
                                        const cat = CATEGORIES[e.category];
                                        return (
                                            <div key={e.id} className={`flex items-center gap-3 rounded-xl border ${cat.border} ${cat.bg} p-3`}>
                                                <cat.icon size={18} className={cat.text} />
                                                <div className="flex-1">
                                                    <p className={`font-medium ${cat.text}`}>{e.title}</p>
                                                    <p className="text-xs text-slate-500">{e.description}</p>
                                                </div>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[e.status]?.bg} ${STATUS_COLORS[e.status]?.text}`}>{STATUS_COLORS[e.status]?.label}</span>
                                                {!e.id.startsWith('contact-') && (
                                                    <button onClick={() => handleDeleteEvent(e.id)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {view === 'agenda' && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="space-y-3">
                                    {(() => {
                                        const grouped: Record<string, CalendarEvent[]> = {};
                                        finalFilteredEvents
                                            .filter((e) => new Date(e.date) >= new Date(today))
                                            .sort((a, b) => a.date.localeCompare(b.date))
                                            .forEach((e) => {
                                                if (!grouped[e.date]) grouped[e.date] = [];
                                                grouped[e.date].push(e);
                                            });
                                        return Object.entries(grouped).slice(0, 14).map(([date, evts]) => (
                                            <div key={date}>
                                                <p className="mb-2 text-xs font-medium text-slate-500">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                <div className="space-y-1">
                                                    {evts.map((e) => {
                                                        const cat = CATEGORIES[e.category];
                                                        return (
                                                            <div key={e.id} className={`flex items-center gap-3 rounded-xl border ${cat.border} ${cat.bg} p-3`}>
                                                                <cat.icon size={16} className={cat.text} />
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-medium ${cat.text}`}>{e.title}</p>
                                                                    <p className="text-xs text-slate-500">{e.description}</p>
                                                                </div>
                                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[e.status]?.bg} ${STATUS_COLORS[e.status]?.text}`}>{STATUS_COLORS[e.status]?.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}

                        {view === 'day' && !selectedDate && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center backdrop-blur-sm">
                                <CalendarDays size={48} className="mx-auto mb-4 text-slate-600" />
                                <p className="text-slate-400">Select a date to view day details</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="hidden w-80 flex-shrink-0 space-y-4 lg:block">
                        {/* Selected Date */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
                            <h3 className="mb-3 text-lg font-semibold text-white">
                                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                            </h3>
                            {selectedDate ? (
                                selectedEvents.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedEvents.map((e) => {
                                            const cat = CATEGORIES[e.category];
                                            return (
                                                <div key={e.id} className={`flex items-center gap-3 rounded-xl border ${cat.border} ${cat.bg} p-3`}>
                                                    <cat.icon size={16} className={cat.text} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`truncate text-sm font-medium ${cat.text}`}>{e.title}</p>
                                                        <p className="text-xs text-slate-500">{e.description}</p>
                                                    </div>
                                                    {!e.id.startsWith('contact-') && (
                                                        <button onClick={() => handleDeleteEvent(e.id)} className="text-red-400/60 hover:text-red-400"><Trash2 size={12} /></button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p className="text-sm text-slate-500">No events on this date</p>
                            ) : <p className="text-sm text-slate-500">Click a date to see events</p>}
                        </div>

                        {/* Legend */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
                            <h3 className="mb-3 text-sm font-semibold text-white">Categories</h3>
                            <div className="space-y-2">
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs text-slate-400">{cat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Legend */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
                            <h3 className="mb-3 text-sm font-semibold text-white">Status</h3>
                            <div className="space-y-2">
                                {Object.entries(STATUS_COLORS).map(([key, s]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${s.bg}`} />
                                        <span className="text-xs text-slate-400">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Create Event Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreateModal(false)}>
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">Create Event</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-400">Title</label>
                                        <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500" placeholder="Event title" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-400">Date</label>
                                        <input type="date" value={createDate} onChange={(e) => setCreateDate(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-400">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(CATEGORIES).map(([key, cat]) => (
                                                <button key={key} onClick={() => setNewEvent({ ...newEvent, category: key as CalendarEvent['category'] })} className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${newEvent.category === key ? `${cat.border} ${cat.bg} ${cat.text}` : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                                                    <cat.icon size={12} /> {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-400">Description</label>
                                        <input type="text" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500" placeholder="Optional description" />
                                    </div>
                                    <button onClick={handleCreateEvent} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400">Create Event</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Assistant Panel */}
                <AnimatePresence>
                    {showAI && (
                        <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="fixed bottom-0 right-0 top-0 z-50 flex w-96 flex-col border-l border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center justify-between border-b border-slate-800 p-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                        <Brain size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Calendar AI</h3>
                                        <p className="text-[10px] text-slate-500">Ask about your schedule</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {aiMessages.length === 0 && (
                                    <div className="flex flex-col items-center py-8 text-center">
                                        <Sparkles size={32} className="mb-3 text-purple-400" />
                                        <p className="text-sm font-medium text-white">Calendar AI Assistant</p>
                                        <p className="mt-1 text-xs text-slate-400">Ask about your schedule</p>
                                        <div className="mt-4 space-y-2">
                                            {["What's scheduled today?", 'Which payments are overdue?', 'Show tomorrow\'s orders', 'Campaign status this week'].map((q) => (
                                                <button key={q} onClick={() => handleAI(q)} className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:border-purple-500 hover:bg-slate-700">{q}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {aiMessages.map((m, i) => (
                                    <div key={i} className={`mb-3 ${m.role === 'user' ? 'flex justify-end' : ''}`}>
                                        <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                            <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>').replace(/\n/g, '<br />') }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-800 p-3">
                                <div className="flex gap-2">
                                    <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAI()} placeholder="Ask about your schedule..." className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500" />
                                    <button onClick={() => handleAI()} className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 text-white"><Send size={16} /></button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}

SmartCalendar.layout = {
    breadcrumbs: [{ title: 'Smart Calendar', href: '/smart-calendar' }],
};
