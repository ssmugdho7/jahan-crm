import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Summary = {
    revenue: { today: number; weekly: number; monthly: number; yearly: number };
    facebook_cost: { today: number; weekly: number; monthly: number; yearly: number };
    mobile_internet: { today: number; weekly: number; monthly: number; yearly: number };
    other_expenses: { today: number; weekly: number; monthly: number; yearly: number };
    net_profit: { today: number; weekly: number; monthly: number; yearly: number };
};

type Charts = {
    profit_trend: { month: number; revenue: number }[];
    revenue_vs_expense: { month: number; month_name: string; revenue: number; expenses: number }[];
};

export default function ProfitReportPage({ summary, charts, filters, currentMonth, currentYear }: { summary: Summary; charts: Charts; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [period, setPeriod] = useState(filters.period || 'monthly');
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [liveSummary, setLiveSummary] = useState(summary);
    const [liveCharts, setLiveCharts] = useState(charts);
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
            const response = await fetch(`/reports/profit/live?month=${month}&year=${year}`);
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

    const formatKWD = (value: number) => `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

    const handleFilter = () => {
        setIsLiveMode(false);
        router.get('/reports/profit', { period, year, month }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/profit', {}, { preserveState: true, replace: true });
    };

    const periods = ['today', 'weekly', 'monthly', 'yearly'] as const;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Profit Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Profit Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Revenue, expenses, and profit analysis</p>
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

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Profit Calculation ({period})</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-300">Revenue</span>
                            <span className="font-medium text-teal-400">{formatKWD(liveSummary.revenue[period])}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-300">Minus Facebook Ad Cost</span>
                            <span className="font-medium text-red-400">-{formatKWD(liveSummary.facebook_cost[period])}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-300">Minus Mobile Internet</span>
                            <span className="font-medium text-red-400">-{formatKWD(liveSummary.mobile_internet[period])}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-300">Minus Other Expenses</span>
                            <span className="font-medium text-red-400">-{formatKWD(liveSummary.other_expenses[period])}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-lg font-semibold text-white">Net Profit</span>
                            <span className={`text-2xl font-bold ${liveSummary.net_profit[period] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatKWD(liveSummary.net_profit[period])}
                            </span>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {periods.map((p) => (
                        <div key={p} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                            <p className="text-sm text-slate-400 capitalize">{p === 'today' ? "Today's" : p} Profit</p>
                            <p className={`text-2xl font-bold ${liveSummary.net_profit[p] >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatKWD(liveSummary.net_profit[p])}</p>
                        </div>
                    ))}
                </div>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Profit Trend</h3>
                    <div className="h-64">
                        <div className="flex h-full items-end gap-2">
                            {liveCharts.profit_trend.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center">
                                    <div className="w-full rounded-t bg-gradient-to-t from-green-500 to-emerald-400" style={{ height: `${Math.min((item.revenue / Math.max(...liveCharts.profit_trend.map((d) => d.revenue), 1)) * 100, 100)}%` }} />
                                    <span className="mt-2 text-xs text-slate-400">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item.month - 1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Revenue vs Expense</h3>
                    <div className="h-64">
                        <div className="flex h-full items-end gap-4">
                            {liveCharts.revenue_vs_expense.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center">
                                    <div className="flex w-full gap-1">
                                        <div className="flex-1 rounded-t bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${Math.min((item.revenue / Math.max(...liveCharts.revenue_vs_expense.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100, 100)}%` }} />
                                        <div className="flex-1 rounded-t bg-gradient-to-t from-red-500 to-orange-400" style={{ height: `${Math.min((item.expenses / Math.max(...liveCharts.revenue_vs_expense.map((d) => Math.max(d.revenue, d.expenses)), 1)) * 100, 100)}%` }} />
                                    </div>
                                    <span className="mt-2 text-xs text-slate-400">{item.month_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-teal-500" />
                            <span className="text-sm text-slate-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="text-sm text-slate-400">Expenses</span>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

ProfitReportPage.layout = {
    breadcrumbs: [{ title: 'Profit Report', href: '/reports/profit' }],
};
