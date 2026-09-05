import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Order = {
    id: number;
    invoice_no: string;
    created_at: string;
    contact: { name: string };
    items: { product: { name: string }; quantity: number }[];
    subtotal: number;
    discount: number;
    delivery_charge: number;
    total: number;
    payment_status: string;
    order_status: string;
};

type Summary = {
    total_orders: number;
    total_sales: number;
    total_profit: number;
};

export default function DailySalesReportPage({ orders, summary, filters, currentMonth, currentYear }: { orders: { data: Order[]; current_page: number; last_page: number; per_page: number; total: number }; summary: Summary; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [useMonthFilter, setUseMonthFilter] = useState(!!filters.month || !!filters.year);
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
            const params = useMonthFilter ? `month=${month}&year=${year}` : `date=${date}`;
            const searchParam = search ? `&search=${search}` : '';
            const response = await fetch(`/reports/daily-sales/live?${params}${searchParam}`);
            const data = await response.json();
            setLiveSummary(data.summary);
            setLastUpdated(new Date());
            if (data.currentMonth !== month || data.currentYear !== year) {
                setMonth(data.currentMonth);
                setYear(data.currentYear);
            }
        } catch (error) {
            console.error('Failed to fetch live data:', error);
        }
    }, [month, year, date, search, useMonthFilter]);

    useEffect(() => {
        if (isLiveMode) {
            intervalRef.current = setInterval(fetchLiveData, 30000);
            return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        }
    }, [isLiveMode, fetchLiveData]);

    const formatKWD = (value: number) => `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

    const handleFilter = () => {
        setIsLiveMode(false);
        const params: Record<string, any> = { search };
        if (useMonthFilter) {
            params.month = month;
            params.year = year;
        } else {
            params.date = date;
        }
        router.get('/reports/daily-sales', params, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setUseMonthFilter(true);
        setIsLiveMode(true);
        router.get('/reports/daily-sales', { month: new Date().getMonth() + 1, year: new Date().getFullYear() }, { preserveState: true, replace: true });
    };

    const handlePage = (page: number) => {
        router.get('/reports/daily-sales', { ...filters, page }, { preserveState: true, replace: true });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Daily Sales Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Daily Sales Report</h1>
                            <p className="mt-1 text-sm text-slate-300">View sales for a specific day</p>
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

                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{liveSummary.total_orders}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Sales</p>
                        <p className="text-2xl font-bold text-teal-400">{formatKWD(liveSummary.total_sales)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Total Profit</p>
                        <p className="text-2xl font-bold text-green-400">{formatKWD(liveSummary.total_profit)}</p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input type="checkbox" checked={useMonthFilter} onChange={(e) => setUseMonthFilter(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-teal-500 focus:ring-teal-500" />
                            Month Filter
                        </label>

                        {useMonthFilter ? (
                            <>
                                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white">
                                    {months.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white" />
                            </>
                        ) : (
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white" />
                        )}

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-white" />
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
                                    <th className="p-3">Invoice No</th>
                                    <th className="p-3">Order Date</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Quantity</th>
                                    <th className="p-3">Sale Amount</th>
                                    <th className="p-3">Discount</th>
                                    <th className="p-3">Delivery</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Payment</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-3 font-medium text-white">{order.invoice_no}</td>
                                        <td className="p-3 text-slate-300">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-slate-300">{order.contact?.name}</td>
                                        <td className="p-3 text-slate-300">{order.items?.[0]?.product?.name}</td>
                                        <td className="p-3 text-slate-300">{order.items?.[0]?.quantity}</td>
                                        <td className="p-3 text-slate-300">{formatKWD(order.subtotal)}</td>
                                        <td className="p-3 text-red-400">{formatKWD(order.discount)}</td>
                                        <td className="p-3 text-slate-300">{formatKWD(order.delivery_charge)}</td>
                                        <td className="p-3 font-medium text-teal-400">{formatKWD(order.total)}</td>
                                        <td className="p-3">
                                            <span className={`rounded-full px-2 py-1 text-xs ${order.payment_status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{order.payment_status}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`rounded-full px-2 py-1 text-xs ${order.order_status === 'Done' ? 'bg-green-500/20 text-green-400' : order.order_status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{order.order_status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">Showing {orders.data.length} of {orders.total} orders</p>
                        <div className="flex gap-2">
                            <button onClick={() => handlePage(orders.current_page - 1)} disabled={orders.current_page === 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={20} /></button>
                            <button onClick={() => handlePage(orders.current_page + 1)} disabled={orders.current_page === orders.last_page} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

DailySalesReportPage.layout = {
    breadcrumbs: [{ title: 'Daily Sales Report', href: '/reports/daily-sales' }],
};
