import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Summary = {
    orders: number;
    revenue: number;
    expenses: number;
    facebook_cost: number;
    profit: number;
};

type DailySales = {
    date: string;
    total: number;
};

export default function WeeklySalesReportPage({ summary, previous, daily_sales, filters, currentMonth, currentYear }: { summary: Summary; previous: Summary; daily_sales: DailySales[]; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [liveSummary, setLiveSummary] = useState(summary);
    const [livePrevious, setLivePrevious] = useState(previous);
    const [liveDailySales, setLiveDailySales] = useState(daily_sales);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isLiveMode, setIsLiveMode] = useState(true);
    const mainRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(mainRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
        }
    }, []);

    const fetchLiveData = useCallback(async () => {
        try {
            const response = await fetch(`/reports/weekly-sales/live?month=${month}&year=${year}`);
            const data = await response.json();
            setLiveSummary(data.summary);
            setLivePrevious(data.previous);
            setLiveDailySales(data.daily_sales);
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

    const formatKWD = (value: number) => `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

    const handleFilter = () => {
        setIsLiveMode(false);
        router.get('/reports/weekly-sales', { month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/weekly-sales', {}, { preserveState: true, replace: true });
    };

    const changePercent = (current: number, prev: number) => {
        if (prev === 0) return 0;
        return ((current - prev) / prev) * 100;
    };

    const metrics = [
        { title: 'Orders', current: liveSummary.orders, prev: livePrevious.orders },
        { title: 'Revenue', current: liveSummary.revenue, prev: livePrevious.revenue },
        { title: 'Expenses', current: liveSummary.expenses, prev: livePrevious.expenses },
        { title: 'Facebook Cost', current: liveSummary.facebook_cost, prev: livePrevious.facebook_cost },
        { title: 'Profit', current: liveSummary.profit, prev: livePrevious.profit },
    ];

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Weekly Sales Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Weekly Sales Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Compare weekly performance</p>
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
                    {metrics.map((metric) => {
                        const change = changePercent(metric.current, metric.prev);
                        const isPositive = change >= 0;
                        return (
                            <div key={metric.title} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                                <p className="text-sm text-slate-400">{metric.title}</p>
                                <p className="text-2xl font-bold text-white">{metric.title === 'Orders' ? metric.current : formatKWD(metric.current)}</p>
                                <div className={`mt-2 flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {Math.abs(change).toFixed(1)}% vs last week
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Daily Sales</h3>
                    <div className="h-64">
                        <div className="flex h-full items-end gap-2">
                            {liveDailySales.map((item) => (
                                <div key={item.date} className="flex flex-1 flex-col items-center">
                                    <div className="w-full rounded-t bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${Math.min((item.total / Math.max(...liveDailySales.map((d) => d.total), 1)) * 100, 100)}%` }} />
                                    <span className="mt-2 text-xs text-slate-400">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

WeeklySalesReportPage.layout = {
    breadcrumbs: [{ title: 'Weekly Sales Report', href: '/reports/weekly-sales' }],
};
