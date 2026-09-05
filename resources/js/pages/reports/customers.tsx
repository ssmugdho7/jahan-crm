import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Customer = {
    id: number;
    name: string;
    mobile: string;
    email: string;
    orders_count: number;
    total_purchased: number;
    created_at: string;
};

export default function CustomerReportPage({ customers, filters, currentMonth, currentYear }: { customers: { data: Customer[]; current_page: number; last_page: number; per_page: number; total: number }; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
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
            const response = await fetch(`/reports/customers/live?month=${month}&year=${year}`);
            const data = await response.json();
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
        router.get('/reports/customers', { search, month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/customers', {}, { preserveState: true, replace: true });
    };

    const handlePage = (page: number) => {
        router.get('/reports/customers', { ...filters, page }, { preserveState: true, replace: true });
    };

    const viewCustomer = async (id: number) => {
        const response = await fetch(`/reports/customers/${id}`);
        const data = await response.json();
        setSelectedCustomer(data);
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Customer Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Customer Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Customer analytics and insights</p>
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
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-white" />
                        </div>
                        <button onClick={handleFilter} className="rounded-xl bg-teal-500 px-5 py-2 font-medium text-white hover:bg-teal-400">Search</button>
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-700 text-slate-400">
                                <tr>
                                    <th className="p-3">Customer Name</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Total Orders</th>
                                    <th className="p-3">Total Purchased</th>
                                    <th className="p-3">Last Order</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-3 font-medium text-white">{customer.name}</td>
                                        <td className="p-3 text-slate-300">{customer.mobile}</td>
                                        <td className="p-3 text-slate-300">{customer.orders_count}</td>
                                        <td className="p-3 text-teal-400">{formatKWD(customer.total_purchased)}</td>
                                        <td className="p-3 text-slate-300">{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button onClick={() => viewCustomer(customer.id)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400"><Eye size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">Showing {customers.data.length} of {customers.total} customers</p>
                        <div className="flex gap-2">
                            <button onClick={() => handlePage(customers.current_page - 1)} disabled={customers.current_page === 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={20} /></button>
                            <button onClick={() => handlePage(customers.current_page + 1)} disabled={customers.current_page === customers.last_page} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </section>

                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
                        <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-bold text-white">{selectedCustomer.customer.name}</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-slate-400">Phone</p><p className="text-white">{selectedCustomer.customer.mobile}</p></div>
                                <div><p className="text-sm text-slate-400">Email</p><p className="text-white">{selectedCustomer.customer.email || 'N/A'}</p></div>
                                <div><p className="text-sm text-slate-400">Total Orders</p><p className="text-white">{selectedCustomer.stats.total_orders}</p></div>
                                <div><p className="text-sm text-slate-400">Total Purchased</p><p className="text-teal-400">{formatKWD(selectedCustomer.stats.total_purchased)}</p></div>
                                <div><p className="text-sm text-slate-400">Total Paid</p><p className="text-green-400">{formatKWD(selectedCustomer.stats.total_paid)}</p></div>
                                <div><p className="text-sm text-slate-400">Due Amount</p><p className="text-red-400">{formatKWD(selectedCustomer.stats.due_amount)}</p></div>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="mt-6 rounded-xl bg-slate-800 px-5 py-2 text-white hover:bg-slate-700">Close</button>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

CustomerReportPage.layout = {
    breadcrumbs: [{ title: 'Customer Report', href: '/reports/customers' }],
};
