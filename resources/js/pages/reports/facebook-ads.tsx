import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Ad = {
    id: number;
    campaign_name: string;
    objective: string;
    budget: number;
    amount_spent: number;
    reach: number;
    clicks: number;
    cpc: number;
    cpm: number;
    ctr: number;
    leads: number;
    purchases: number;
    roas: number;
    ad_date: string;
};

type Charts = {
    daily_spend: { date: string; total: number }[];
    roas_trend: { date: string; avg_roas: number }[];
    cpc_trend: { date: string; avg_cpc: number }[];
};

export default function FacebookAdsReportPage({ ads, summary, charts, filters, currentMonth, currentYear }: { ads: { data: Ad[]; current_page: number; last_page: number; total: number }; summary: { total_budget: number; total_spend: number; avg_roas: number; avg_cpc: number }; charts: Charts; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
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
            const response = await fetch(`/reports/facebook-ads/live?month=${month}&year=${year}`);
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
        router.get('/reports/facebook-ads', { start_date: startDate, end_date: endDate, search, month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/facebook-ads', {}, { preserveState: true, replace: true });
    };

    const handlePage = (page: number) => {
        router.get('/reports/facebook-ads', { ...filters, page }, { preserveState: true, replace: true });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Facebook Ads Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Facebook Ads Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Ad campaign performance analytics</p>
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

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Budget</p>
                        <p className="text-2xl font-bold text-blue-400">{formatKWD(liveSummary.total_budget)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Spend</p>
                        <p className="text-2xl font-bold text-red-400">{formatKWD(liveSummary.total_spend)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Average ROAS</p>
                        <p className="text-2xl font-bold text-green-400">{liveSummary.avg_roas?.toFixed(2)}x</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Average CPC</p>
                        <p className="text-2xl font-bold text-teal-400">{formatKWD(liveSummary.avg_cpc)}</p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white">
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white" />
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-white" />
                        </div>
                        <button onClick={handleFilter} className="rounded-xl bg-teal-500 px-5 py-2 font-medium text-white hover:bg-teal-400">Apply</button>
                        <button onClick={handleResetToCurrentMonth} className="rounded-xl bg-slate-700 px-5 py-2 font-medium text-white hover:bg-slate-600">Current Month</button>
                        <div className="ml-auto flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-400">
                                <input type="checkbox" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-teal-500 focus:ring-teal-500" />
                                Auto-refresh (30s)
                            </label>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-700 text-slate-400">
                                <tr>
                                    <th className="p-3">Campaign</th>
                                    <th className="p-3">Objective</th>
                                    <th className="p-3">Budget</th>
                                    <th className="p-3">Spent</th>
                                    <th className="p-3">Reach</th>
                                    <th className="p-3">Clicks</th>
                                    <th className="p-3">CPC</th>
                                    <th className="p-3">CTR</th>
                                    <th className="p-3">Leads</th>
                                    <th className="p-3">Purchases</th>
                                    <th className="p-3">ROAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.data.map((ad) => (
                                    <tr key={ad.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-3 font-medium text-white">{ad.campaign_name}</td>
                                        <td className="p-3 text-slate-300">{ad.objective}</td>
                                        <td className="p-3 text-slate-300">{formatKWD(ad.budget)}</td>
                                        <td className="p-3 text-red-400">{formatKWD(ad.amount_spent)}</td>
                                        <td className="p-3 text-slate-300">{ad.reach.toLocaleString()}</td>
                                        <td className="p-3 text-slate-300">{ad.clicks.toLocaleString()}</td>
                                        <td className="p-3 text-slate-300">{formatKWD(ad.cpc)}</td>
                                        <td className="p-3 text-slate-300">{ad.ctr}%</td>
                                        <td className="p-3 text-slate-300">{ad.leads}</td>
                                        <td className="p-3 text-slate-300">{ad.purchases}</td>
                                        <td className={`p-3 font-medium ${ad.roas >= 1 ? 'text-green-400' : 'text-red-400'}`}>{ad.roas?.toFixed(2)}x</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">Showing {ads.data.length} of {ads.total} campaigns</p>
                        <div className="flex gap-2">
                            <button onClick={() => handlePage(ads.current_page - 1)} disabled={ads.current_page === 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={20} /></button>
                            <button onClick={() => handlePage(ads.current_page + 1)} disabled={ads.current_page === ads.last_page} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">Daily Spend</h3>
                        <div className="h-48">
                            <div className="flex h-full items-end gap-1">
                                {liveCharts.daily_spend.map((item) => (
                                    <div key={item.date} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-red-500 to-orange-400" style={{ height: `${Math.min((item.total / Math.max(...liveCharts.daily_spend.map((d) => d.total), 1)) * 100, 100)}%` }} />
                                        <span className="mt-1 text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">ROAS Trend</h3>
                        <div className="h-48">
                            <div className="flex h-full items-end gap-1">
                                {liveCharts.roas_trend.map((item) => (
                                    <div key={item.date} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-green-500 to-emerald-400" style={{ height: `${Math.min((item.avg_roas / Math.max(...liveCharts.roas_trend.map((d) => d.avg_roas), 1)) * 100, 100)}%` }} />
                                        <span className="mt-1 text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <h3 className="mb-4 font-semibold text-white">CPC Trend</h3>
                        <div className="h-48">
                            <div className="flex h-full items-end gap-1">
                                {liveCharts.cpc_trend.map((item) => (
                                    <div key={item.date} className="flex flex-1 flex-col items-center">
                                        <div className="w-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${Math.min((item.avg_cpc / Math.max(...liveCharts.cpc_trend.map((d) => d.avg_cpc), 1)) * 100, 100)}%` }} />
                                        <span className="mt-1 text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
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

FacebookAdsReportPage.layout = {
    breadcrumbs: [{ title: 'Facebook Ads Report', href: '/reports/facebook-ads' }],
};
