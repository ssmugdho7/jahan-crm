import { Head, router, useForm } from '@inertiajs/react';
import { Calculator, Pencil, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type IncomeStatement = {
    id: number;
    period: string | null;
    total_sales: number;
    facebook_boost_cost: number;
    mobile_internet_cost: number;
    net_profit: number;
    created_at: string;
};

type Totals = {
    total_sales: number;
    facebook_boost_cost: number;
    mobile_internet_cost: number;
    net_profit: number;
};

type LastMonthTotals = Totals & {
    period: string;
};

export default function IncomeStatementPage({
    statements,
    totals,
    lastMonthTotals,
}: {
    statements: IncomeStatement[];
    totals: Totals;
    lastMonthTotals: LastMonthTotals;
}) {
    const [showForm, setShowForm] = useState(false);
    const [editingStatement, setEditingStatement] = useState<IncomeStatement | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        period: '',
        total_sales: '',
        facebook_boost_cost: '',
        mobile_internet_cost: '',
    });

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(
                mainRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }
    }, []);

    useEffect(() => {
        if (listRef.current) {
            const items = listRef.current.querySelectorAll('.statement-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [statements]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/income-statement', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleEdit = (statement: IncomeStatement) => {
        setEditingStatement(statement);
        setData({
            period: statement.period ?? '',
            total_sales: statement.total_sales.toString(),
            facebook_boost_cost: statement.facebook_boost_cost.toString(),
            mobile_internet_cost: statement.mobile_internet_cost.toString(),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingStatement) {
            return;
        }

        put(`/income-statement/${editingStatement.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingStatement(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this statement?')) {
            router.delete(`/income-statement/${id}`, { preserveScroll: true });
        }
    };

    const money = (value: number) =>
        value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'BDT',
            maximumFractionDigits: 2,
        });

    const date = (value: string) =>
        new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const netProfit = (totalSales: number, facebook: number, mobile: number) =>
        totalSales - facebook - mobile;

    const closeForm = () => {
        setShowForm(false);
        setEditingStatement(null);
        reset();
    };

    const statementForm = (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/30">
            <h2 className="mb-4 text-lg font-semibold">
                {editingStatement ? 'Edit Income Statement' : 'New Income Statement'}
            </h2>
            <form onSubmit={editingStatement ? handleUpdate : handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Period</label>
                        <input
                            type="text"
                            value={data.period}
                            onChange={(e) => setData('period', e.target.value)}
                            placeholder="e.g., July 2026"
                            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Total Sales Revenue (BDT)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.total_sales}
                            onChange={(e) => setData('total_sales', e.target.value)}
                            placeholder="0.00"
                            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Facebook Ads (BDT)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.facebook_boost_cost}
                            onChange={(e) => setData('facebook_boost_cost', e.target.value)}
                            placeholder="0.00"
                            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Mobile Internet (BDT)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.mobile_internet_cost}
                            onChange={(e) => setData('mobile_internet_cost', e.target.value)}
                            placeholder="0.00"
                            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50"
                    >
                        <Calculator size={18} />
                        {processing ? 'Saving...' : editingStatement ? 'Update Statement' : 'Save Statement'}
                    </button>
                    <button
                        type="button"
                        onClick={closeForm}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 font-medium text-white transition-all hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );

    return (
        <>
            <Head title="Income Statement" />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Track your revenue and expenses
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            closeForm();
                            setShowForm(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40"
                    >
                        <Plus size={18} /> Add Entry
                    </button>
                </section>

                {showForm && statementForm}
                {editingStatement && statementForm}

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Last Month Summary - {lastMonthTotals.period}</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-emerald-500/20 p-2">
                                <TrendingUp size={18} className="text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{money(lastMonthTotals.total_sales)}</p>
                            <p className="text-sm text-slate-400">Total Sales</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-pink-500/20 p-2">
                                <TrendingDown size={18} className="text-pink-400" />
                            </div>
                            <p className="text-2xl font-bold text-pink-400">{money(lastMonthTotals.facebook_boost_cost)}</p>
                            <p className="text-sm text-slate-400">Facebook Ads</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-blue-500/20 p-2">
                                <DollarSign size={18} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{money(lastMonthTotals.mobile_internet_cost)}</p>
                            <p className="text-sm text-slate-400">Mobile Internet</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className={`mb-2 inline-flex rounded-lg ${lastMonthTotals.net_profit >= 0 ? 'bg-teal-500/20' : 'bg-red-500/20'} p-2`}>
                                <Calculator size={18} className={lastMonthTotals.net_profit >= 0 ? 'text-teal-400' : 'text-red-400'} />
                            </div>
                            <p className={`text-2xl font-bold ${lastMonthTotals.net_profit >= 0 ? 'text-teal-400' : 'text-red-400'}`}>{money(lastMonthTotals.net_profit)}</p>
                            <p className="text-sm text-slate-400">Net Profit</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Summary</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-emerald-500/20 p-2">
                                <TrendingUp size={18} className="text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{money(totals.total_sales)}</p>
                            <p className="text-sm text-slate-400">Total Sales</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-pink-500/20 p-2">
                                <TrendingDown size={18} className="text-pink-400" />
                            </div>
                            <p className="text-2xl font-bold text-pink-400">{money(totals.facebook_boost_cost)}</p>
                            <p className="text-sm text-slate-400">Facebook Ads</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className="mb-2 inline-flex rounded-lg bg-blue-500/20 p-2">
                                <DollarSign size={18} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{money(totals.mobile_internet_cost)}</p>
                            <p className="text-sm text-slate-400">Mobile Internet</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                            <div className={`mb-2 inline-flex rounded-lg ${totals.net_profit >= 0 ? 'bg-teal-500/20' : 'bg-red-500/20'} p-2`}>
                                <Calculator size={18} className={totals.net_profit >= 0 ? 'text-teal-400' : 'text-red-400'} />
                            </div>
                            <p className={`text-2xl font-bold ${totals.net_profit >= 0 ? 'text-teal-400' : 'text-red-400'}`}>{money(totals.net_profit)}</p>
                            <p className="text-sm text-slate-400">Net Profit</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                    <h2 className="mb-4 font-semibold">Statements</h2>

                    <div ref={listRef} className="space-y-3">
                        {statements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8">
                                <Calculator className="mb-3 h-12 w-12 text-slate-600" />
                                <p className="text-sm text-slate-400">No income statements yet</p>
                                <p className="text-xs text-slate-500">Add your first statement to get started</p>
                            </div>
                        ) : (
                            statements.map((statement) => {
                                const profit = netProfit(statement.total_sales, statement.facebook_boost_cost, statement.mobile_internet_cost);

                                return (
                                    <div
                                        key={statement.id}
                                        className="statement-item group rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {statement.period || date(statement.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(statement)}
                                                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-500/20 hover:text-blue-400"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(statement.id)}
                                                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Total Sales</p>
                                                <p className="font-medium text-emerald-400">{money(statement.total_sales)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Facebook Ads</p>
                                                <p className="font-medium text-pink-400">-{money(statement.facebook_boost_cost)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Mobile Internet</p>
                                                <p className="font-medium text-blue-400">-{money(statement.mobile_internet_cost)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Net Profit</p>
                                                <p className={`font-bold ${profit >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                                                    {money(profit)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

IncomeStatementPage.layout = {
    breadcrumbs: [{ title: 'Income Statement', href: '/income-statement' }],
};
