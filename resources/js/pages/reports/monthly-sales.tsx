import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Summary = {
    sales: number;
    expenses: number;
    facebook_ads_cost: number;
    total_customers: number;
    new_customers: number;
    completed_orders: number;
    cancelled_orders: number;
};

type Charts = {
    weekly_sales: { week: number; total: number }[];
    weekly_profit: { week: number; revenue: number }[];
};

export default function MonthlySalesReportPage({ summary, charts, filters, currentMonth, currentYear }: { summary: Summary; charts: Charts; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
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
            const response = await fetch(`/reports/monthly-sales/live?month=${month}&year=${year}`);
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
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isLiveMode, fetchLiveData]);

    useEffect(() => {
        if (!filters.month && !filters.year) {
            fetchLiveData();
        }
    }, [fetchLiveData, filters.month, filters.year]);

    const formatKWD = (value: number) => `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

    const handleFilter = () => {
        setIsLiveMode(false);
        router.get('/reports/monthly-sales', { month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/monthly-sales', {}, { preserveState: true, replace: true });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Monthly Sales Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Monthly Sales Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Month-wise data with live updates</p>
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
                                <input
                                    type="checkbox"
                                    checked={isLiveMode}
                                    onChange={(e) => setIsLiveMode(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-teal-500 focus:ring-teal-500"
                                />
                                Auto-refresh (30s)
                            </label>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Sales</p>
                        <p className="text-2xl font-bold text-teal-400">{formatKWD(liveSummary.sales)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Expenses</p>
                        <p className="text-2xl font-bold text-red-400">{formatKWD(liveSummary.expenses)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Facebook Ads Cost</p>
                        <p className="text-2xl font-bold text-blue-400">{formatKWD(liveSummary.facebook_ads_cost)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">New Customers</p>
                        <p className="text-2xl font-bold text-purple-400">{liveSummary.new_customers}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Customers</p>
                        <p className="text-2xl font-bold text-white">{liveSummary.total_customers}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Completed Orders</p>
                        <p className="text-2xl font-bold text-green-400">{liveSummary.completed_orders}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Cancelled Orders</p>
                        <p className="text-2xl font-bold text-red-400">{liveSummary.cancelled_orders}</p>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Weekly Sales</h3>
                        <div className="h-64">
                            <div className="flex h-full items-end gap-2">
                                {liveCharts.weekly_sales.map((item) => (
                                    <div key={item.week} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${Math.min((item.total / Math.max(...liveCharts.weekly_sales.map((d) => d.total), 1)) * 100, 100)}%` }} />
                                        <span className="mt-2 text-xs text-slate-400">W{item.week}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Weekly Profit</h3>
                        <div className="h-64">
                            <div className="flex h-full items-end gap-2">
                                {liveCharts.weekly_profit.map((item) => (
                                    <div key={item.week} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-green-500 to-emerald-400" style={{ height: `${Math.min((item.revenue / Math.max(...liveCharts.weekly_profit.map((d) => d.revenue), 1)) * 100, 100)}%` }} />
                                        <span className="mt-2 text-xs text-slate-400">W{item.week}</span>
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

MonthlySalesReportPage.layout = {
    breadcrumbs: [{ title: 'Monthly Sales Report', href: '/reports/monthly-sales' }],
};
