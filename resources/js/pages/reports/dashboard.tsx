import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package, Facebook, Wallet } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Summary = {
    today_sales: number;
    weekly_sales: number;
    monthly_sales: number;
    yearly_sales: number;
    total_customers: number;
    total_orders: number;
    total_expenses: number;
    facebook_ad_cost: number;
    net_profit: number;
    pending_orders: number;
};

type ChartData = {
    monthly_sales: { month: number; total: number }[];
    monthly_profit: { month: number; revenue: number }[];
    expense_breakdown: { category: string; total: number }[];
    order_status: { order_status: string; count: number }[];
    facebook_ad_trend: { date: string; total: number }[];
    customer_growth: { month: number; count: number }[];
};

export default function DashboardReportPage({ summary, charts, currentMonth, currentYear }: { summary: Summary; charts: ChartData; currentMonth: number; currentYear: number }) {
    const [month, setMonth] = useState(currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(currentYear || new Date().getFullYear());
    const [liveSummary, setLiveSummary] = useState(summary);
    const [liveCharts, setLiveCharts] = useState(charts);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isLiveMode, setIsLiveMode] = useState(true);
    const mainRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(
                mainRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            );
        }
    }, []);

    const fetchLiveData = useCallback(async () => {
        try {
            const response = await fetch(`/reports/dashboard/live?month=${month}&year=${year}`);
            const data = await response.json();
            setLiveSummary(data.summary);
            setLiveCharts(data.charts);
            setLastUpdated(new Date());
            if (data.currentMonth !== month || data.currentYear !== year) {
                setMonth(data.currentMonth);
                setYear(data.currentYear);
            }
        } catch (error) {
            console.error('Failed to fetch live data:', error);
        }
    }, [month, year]);

    useEffect(() => {
        if (isLiveMode) {
            intervalRef.current = setInterval(fetchLiveData, 30000);
            return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        }
    }, [isLiveMode, fetchLiveData]);

    useEffect(() => {
        fetchLiveData();
    }, [fetchLiveData]);

    const formatKWD = (value: number) => `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

    const handleFilter = () => {
        setIsLiveMode(false);
        router.get('/reports/dashboard', { month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/dashboard', {}, { preserveState: true, replace: true });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const summaryCards = [
        { title: "Today's Sales", value: formatKWD(liveSummary.today_sales), icon: DollarSign, color: 'teal' },
        { title: 'Weekly Sales', value: formatKWD(liveSummary.weekly_sales), icon: TrendingUp, color: 'cyan' },
        { title: 'Monthly Sales', value: formatKWD(liveSummary.monthly_sales), icon: TrendingUp, color: 'blue' },
        { title: 'Yearly Sales', value: formatKWD(liveSummary.yearly_sales), icon: TrendingUp, color: 'indigo' },
        { title: 'Total Customers', value: liveSummary.total_customers.toLocaleString(), icon: Users, color: 'purple' },
        { title: 'Total Orders', value: liveSummary.total_orders.toLocaleString(), icon: ShoppingCart, color: 'pink' },
        { title: 'Total Expenses', value: formatKWD(liveSummary.total_expenses), icon: Wallet, color: 'red' },
        { title: 'Facebook Ad Cost', value: formatKWD(liveSummary.facebook_ad_cost), icon: Facebook, color: 'blue' },
        { title: 'Net Profit', value: formatKWD(liveSummary.net_profit), icon: DollarSign, color: 'green' },
        { title: 'Pending Orders', value: liveSummary.pending_orders.toLocaleString(), icon: Package, color: 'amber' },
    ];

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <>
            <Head title="Dashboard Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Overview of your business performance</p>
                        </div>
                        <div className="text-right">
                            {isLiveMode && (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                                    </span>
                                    <span className="text-sm text-green-400">Live</span>
                                </div>
                            )}
                            <p className="mt-1 text-xs text-slate-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white">
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white" />
                        <button onClick={handleFilter} className="rounded-xl bg-teal-500 px-5 py-2 font-medium text-white hover:bg-teal-400">Apply</button>
                        <button onClick={handleResetToCurrentMonth} className="rounded-xl bg-slate-700 px-5 py-2 font-medium text-white hover:bg-slate-600">Current Month</button>
                        <div className="ml-auto flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-400">
                                <input type="checkbox" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-teal-500 focus:ring-teal-500" />
                                Auto-refresh (30s)
                            </label>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {summaryCards.map((card) => (
                        <div key={card.title} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                            <div className="mb-3 inline-flex rounded-xl bg-slate-800 p-2">
                                <card.icon size={20} className={`text-${card.color}-400`} />
                            </div>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                            <p className="text-sm text-slate-400">{card.title}</p>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Monthly Sales</h3>
                        <div className="h-64">
                            <div className="flex h-full items-end gap-2">
                                {liveCharts.monthly_sales.map((item) => (
                                    <div key={item.month} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${Math.min((item.total / Math.max(...liveCharts.monthly_sales.map((d) => d.total), 1)) * 100, 100)}%` }} />
                                        <span className="mt-2 text-xs text-slate-400">{monthLabels[item.month - 1]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Expense Breakdown</h3>
                        <div className="space-y-3">
                            {liveCharts.expense_breakdown.map((item) => (
                                <div key={item.category} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">{item.category}</span>
                                    <span className="font-medium text-white">{formatKWD(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Order Status</h3>
                        <div className="space-y-3">
                            {liveCharts.order_status.map((item) => (
                                <div key={item.order_status} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">{item.order_status}</span>
                                    <span className="font-medium text-white">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Customer Growth</h3>
                        <div className="h-64">
                            <div className="flex h-full items-end gap-2">
                                {liveCharts.customer_growth.map((item) => (
                                    <div key={item.month} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-purple-500 to-pink-400" style={{ height: `${Math.min((item.count / Math.max(...liveCharts.customer_growth.map((d) => d.count), 1)) * 100, 100)}%` }} />
                                        <span className="mt-2 text-xs text-slate-400">{monthLabels[item.month - 1]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

DashboardReportPage.layout = {
    breadcrumbs: [{ title: 'Dashboard Report', href: '/reports/dashboard' }],
};
