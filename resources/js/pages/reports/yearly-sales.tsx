import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type MonthlyData = {
    month: number;
    month_name: string;
    revenue: number;
    expenses: number;
    profit: number;
};

type Summary = {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
};

export default function YearlySalesReportPage({ monthly_data, summary, filters, currentMonth, currentYear }: { monthly_data: MonthlyData[]; summary: Summary; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [liveMonthlyData, setLiveMonthlyData] = useState(monthly_data);
    const [liveSummary, setLiveSummary] = useState(summary);
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
            const response = await fetch(`/reports/yearly-sales/live?month=${month}&year=${year}`);
            const data = await response.json();
            setLiveMonthlyData(data.monthly_data);
            setLiveSummary(data.summary);
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
        router.get('/reports/yearly-sales', { year, month }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/yearly-sales', {}, { preserveState: true, replace: true });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Yearly Sales Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Yearly Sales Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Annual business overview</p>
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

                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-teal-400">{formatKWD(liveSummary.total_revenue)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-400">{formatKWD(liveSummary.total_expenses)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Profit</p>
                        <p className="text-2xl font-bold text-green-400">{formatKWD(liveSummary.total_profit)}</p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Monthly Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-700 text-slate-400">
                                <tr>
                                    <th className="p-3">Month</th>
                                    <th className="p-3">Revenue</th>
                                    <th className="p-3">Expenses</th>
                                    <th className="p-3">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveMonthlyData.map((item) => (
                                    <tr key={item.month} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-3 font-medium text-white">{item.month_name}</td>
                                        <td className="p-3 text-teal-400">{formatKWD(item.revenue)}</td>
                                        <td className="p-3 text-red-400">{formatKWD(item.expenses)}</td>
                                        <td className={`p-3 font-medium ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatKWD(item.profit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Revenue Trend</h3>
                    <div className="h-64">
                        <div className="flex h-full items-end gap-2">
                            {liveMonthlyData.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center">
                                    <div className="w-full rounded-t bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${Math.min((item.revenue / Math.max(...liveMonthlyData.map((d) => d.revenue), 1)) * 100, 100)}%` }} />
                                    <span className="mt-2 text-xs text-slate-400">{item.month_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Profit Trend</h3>
                    <div className="h-64">
                        <div className="flex h-full items-end gap-2">
                            {liveMonthlyData.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center">
                                    <div className="w-full rounded-t bg-gradient-to-t from-green-500 to-emerald-400" style={{ height: `${Math.min((Math.max(item.profit, 0) / Math.max(...liveMonthlyData.map((d) => Math.max(d.profit, 0)), 1)) * 100, 100)}%` }} />
                                    <span className="mt-2 text-xs text-slate-400">{item.month_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

YearlySalesReportPage.layout = {
    breadcrumbs: [{ title: 'Yearly Sales Report', href: '/reports/yearly-sales' }],
};
