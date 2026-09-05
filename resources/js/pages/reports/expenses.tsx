import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Expense = {
    id: number;
    category: string;
    description: string;
    amount: number;
    payment_method: string;
    expense_date: string;
    user: { name: string };
};

type CategorySummary = {
    category: string;
    total: number;
};

export default function ExpenseReportPage({ expenses, summary, category_summary, filters, currentMonth, currentYear }: { expenses: { data: Expense[]; current_page: number; last_page: number; total: number }; summary: { today_expenses: number; monthly_expenses: number }; category_summary: CategorySummary[]; filters: Record<string, string>; currentMonth: number; currentYear: number }) {
    const [category, setCategory] = useState(filters.category || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || currentMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || currentYear || new Date().getFullYear());
    const [liveSummary, setLiveSummary] = useState(summary);
    const [liveCategorySummary, setLiveCategorySummary] = useState(category_summary);
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
            const response = await fetch(`/reports/expenses/live?month=${month}&year=${year}`);
            const data = await response.json();
            setLiveSummary(data.summary);
            setLiveCategorySummary(data.category_summary);
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
        router.get('/reports/expenses', { category, start_date: startDate, end_date: endDate, search, month, year }, { preserveState: true, replace: true });
    };

    const handleResetToCurrentMonth = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setIsLiveMode(true);
        router.get('/reports/expenses', {}, { preserveState: true, replace: true });
    };

    const handlePage = (page: number) => {
        router.get('/reports/expenses', { ...filters, page }, { preserveState: true, replace: true });
    };

    const categories = ['Facebook Boost', 'Mobile Internet', 'Office Expense', 'Salary', 'Transport', 'Other'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <Head title="Expense Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                    <HeroBackground />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Expense Report</h1>
                            <p className="mt-1 text-sm text-slate-300">Track and analyze your expenses</p>
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

                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Today's Expenses</p>
                        <p className="text-2xl font-bold text-red-400">{formatKWD(liveSummary.today_expenses)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                        <p className="text-sm text-slate-400">Monthly Expenses</p>
                        <p className="text-2xl font-bold text-red-400">{formatKWD(liveSummary.monthly_expenses)}</p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                    <h3 className="mb-4 font-semibold text-white">Category Summary</h3>
                    <div className="space-y-3">
                        {liveCategorySummary.map((item) => (
                            <div key={item.category} className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">{item.category}</span>
                                <span className="font-medium text-red-400">{formatKWD(item.total)}</span>
                            </div>
                        ))}
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
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white">
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
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
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Payment Method</th>
                                    <th className="p-3">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.data.map((expense) => (
                                    <tr key={expense.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-3 text-slate-300">{new Date(expense.expense_date).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{expense.category}</span>
                                        </td>
                                        <td className="p-3 text-slate-300">{expense.description}</td>
                                        <td className="p-3 font-medium text-red-400">{formatKWD(expense.amount)}</td>
                                        <td className="p-3 text-slate-300">{expense.payment_method}</td>
                                        <td className="p-3 text-slate-300">{expense.user?.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">Showing {expenses.data.length} of {expenses.total} expenses</p>
                        <div className="flex gap-2">
                            <button onClick={() => handlePage(expenses.current_page - 1)} disabled={expenses.current_page === 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={20} /></button>
                            <button onClick={() => handlePage(expenses.current_page + 1)} disabled={expenses.current_page === expenses.last_page} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

ExpenseReportPage.layout = {
    breadcrumbs: [{ title: 'Expense Report', href: '/reports/expenses' }],
};
