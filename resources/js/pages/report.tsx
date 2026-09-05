import { Head, router, useForm } from '@inertiajs/react';
import { FileText, FileSpreadsheet, Pencil, Printer } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

const countryCodes = [
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
];

type Contact = {
    id: number;
    name: string | null;
    email: string | null;
    mobile: string | null;
    order_number: string | null;
    product_name: string | null;
    profit: string | null;
    total_order_amount: string | null;
    order_date: string | null;
    order_status: string;
    paid_status: string;
    company: { id: number; name: string } | null;
};

type Filters = {
    mobile?: string;
    email?: string;
    product_name?: string;
    profit_min?: string;
    profit_max?: string;
    order_status?: string;
    date_from?: string;
    date_to?: string;
};

const statusColors: Record<string, string> = {
    Done: 'bg-green-500/20 text-green-400',
    Cancel: 'bg-red-500/20 text-red-400',
    Pending: 'bg-sky-400/20 text-sky-400',
    Upcoming: 'bg-yellow-400/20 text-yellow-400',
};

export default function Report({
    contacts,
    filters: initialFilters,
    exchangeRate,
}: {
    contacts: Contact[];
    filters: Filters;
    exchangeRate: number;
}) {
    const [filters, setFilters] = useState<Filters>(() => {
        if (!initialFilters.date_from && !initialFilters.date_to) {
            const now = new Date();
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                ...initialFilters,
                date_from: prevMonth.toISOString().split('T')[0],
                date_to: lastDay.toISOString().split('T')[0],
            };
        }
        return initialFilters;
    });
    const [preview, setPreview] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [countryCode, setCountryCode] = useState('+965');
    const mainRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableSectionElement>(null);

    const { data, setData, put, processing, reset } = useForm({
        mobile: '',
        order_number: '',
        product_name: '',
        profit: '',
        total_order_amount: '',
        order_date: '',
        order_status: 'Pending',
        paid_status: 'Non-Paid',
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
        if (preview && tableRef.current) {
            const rows = tableRef.current.querySelectorAll('tr');
            gsap.fromTo(
                rows,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [preview, contacts]);

    const applyFilters = () => {
        router.get('/report', { ...filters }, { preserveScroll: true, preserveState: true });
    };

    const resetFilters = () => {
        setFilters({});
        router.get('/report', {}, { preserveScroll: true });
    };

    const generatePreview = () => {
        setPreview(true);
        applyFilters();
    };

    const handlePrint = () => {
        generatePreview();
        setTimeout(() => window.print(), 300);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        const fullMobile = contact.mobile ?? '';
        const matchedCode = countryCodes.find((c) => fullMobile.startsWith(c.code));
        const code = matchedCode?.code ?? '+965';
        const number = matchedCode ? fullMobile.slice(code.length) : fullMobile;
        setCountryCode(code);
        setData({
            mobile: number,
            order_number: contact.order_number ?? '',
            product_name: contact.product_name ?? '',
            profit: contact.profit ?? '',
            total_order_amount: contact.total_order_amount ?? '',
            order_date: contact.order_date ? contact.order_date.split('T')[0] : '',
            order_status: contact.order_status,
            paid_status: contact.paid_status ?? 'Non-Paid',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingContact) {
            return;
        }

        const mobileWithCode = `${countryCode}${data.mobile}`;
        put(`/contacts/${editingContact.id}`, {
            data: {
                ...data,
                mobile: mobileWithCode,
            },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingContact(null);
                setCountryCode('+965');
                router.get('/report', { ...filters }, { preserveScroll: true, preserveState: true });
            },
        });
    };

    const exportCsv = () => {
        generatePreview();
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        setTimeout(() => window.open(`/report/csv?${params.toString()}`, '_blank'), 300);
    };

    const moneyKwd = (value: string | null | number) =>
        value
            ? Number(value).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'KWD',
                  maximumFractionDigits: 2,
              })
            : '—';

    const moneyBdt = (value: string | null | number) =>
        value
            ? (Number(value) * exchangeRate).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                  maximumFractionDigits: 2,
              })
            : '—';

    const date = (value: string | null) =>
        value
            ? new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '—';

    const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFilters({ ...filters, [key]: e.target.value });

    const totalKwd = contacts
        .filter((c) => c.order_status === 'Done')
        .reduce((sum, c) => sum + parseFloat(c.profit ?? '0'), 0);

    const nonPaidTotalBdt = contacts
        .filter((c) => c.order_status === 'Done' && c.paid_status === 'Non-Paid')
        .reduce((sum, c) => sum + (parseFloat(c.profit ?? '0') * exchangeRate), 0);

    return (
        <>
            <Head title="Report" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7 print:space-y-0 print:p-0" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center print:hidden">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Report</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Generate and export order reports
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={generatePreview}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40"
                        >
                            <FileText size={18} /> Generate Report
                        </button>
                        <button
                            onClick={exportCsv}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-green-400 hover:shadow-emerald-500/40"
                        >
                            <FileSpreadsheet size={18} /> Excel
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 font-medium text-white transition-all hover:bg-slate-700"
                        >
                            <Printer size={18} /> Print / PDF
                        </button>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white print:hidden">
                    <h2 className="mb-4 font-semibold">Filters</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Mobile</label>
                            <input
                                type="text"
                                value={filters.mobile ?? ''}
                                onChange={set('mobile')}
                                placeholder="Search by phone..."
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Email</label>
                            <input
                                type="text"
                                value={filters.email ?? ''}
                                onChange={set('email')}
                                placeholder="Search by email..."
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Product Name</label>
                            <input
                                type="text"
                                value={filters.product_name ?? ''}
                                onChange={set('product_name')}
                                placeholder="Search by product name..."
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Profit Min (KWD)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.profit_min ?? ''}
                                onChange={set('profit_min')}
                                placeholder="0.00"
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Profit Max (KWD)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.profit_max ?? ''}
                                onChange={set('profit_max')}
                                placeholder="0.00"
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Order Status</label>
                            <select
                                value={filters.order_status ?? ''}
                                onChange={set('order_status')}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                            >
                                <option value="">All</option>
                                <option value="Done">Done</option>
                                <option value="Cancel">Cancel</option>
                                <option value="Pending">Pending</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Date From</label>
                            <input
                                type="date"
                                value={filters.date_from ?? ''}
                                onChange={set('date_from')}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Date To</label>
                            <input
                                type="date"
                                value={filters.date_to ?? ''}
                                onChange={set('date_to')}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={applyFilters}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Reset
                        </button>
                    </div>
                </section>

                {preview && (
                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white print:border-none print:bg-white print:text-black print:p-0">
                        <div className="mb-4 hidden print:block">
                            <h2 className="text-2xl font-bold">Order Report</h2>
                            <p className="text-sm text-gray-500">
                                Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm print:text-xs">
                                <thead className="border-y border-slate-700 bg-slate-800 text-slate-300 print:border-yellow-400 print:bg-yellow-400 print:text-black">
                                    <tr>
                                        <th className="p-3 font-medium">#</th>
                                        <th className="p-3 font-medium">Mobile</th>
                                        <th className="p-3 font-medium">Order Number</th>
                                        <th className="p-3 font-medium">Product Name</th>
                                        <th className="p-3 font-medium">Profit (KWD)</th>
                                        <th className="p-3 font-medium">Profit (BDT)</th>
                                        <th className="p-3 font-medium">Total Order Amount (KWD)</th>
                                        <th className="p-3 font-medium">Order Date</th>
                                        <th className="p-3 font-medium">Status</th>
                                        <th className="p-3 font-medium">Paid</th>
                                        <th className="p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody ref={tableRef}>
                                    {contacts.map((contact, i) => (
                                        <tr
                                            key={contact.id}
                                            className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 print:border-b print:border-yellow-300 print:hover:bg-transparent"
                                        >
                                            <td className="p-3 text-slate-400 print:text-black">{i + 1}</td>
                                            <td className="p-3 print:text-black">{contact.mobile ?? '—'}</td>
                                            <td className="p-3 print:text-black">{contact.order_number ?? '—'}</td>
                                            <td className="p-3 print:text-black">{contact.product_name ?? '—'}</td>
                                            <td className="p-3 print:text-black">{moneyKwd(contact.profit)}</td>
                                            <td className="p-3 font-medium text-teal-400 print:text-black">{moneyBdt(contact.profit)}</td>
                                            <td className="p-3 print:text-black">{moneyKwd(contact.total_order_amount)}</td>
                                            <td className="p-3 print:text-black">{date(contact.order_date)}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        statusColors[contact.order_status] ?? 'bg-slate-500/20 text-slate-400'
                                                    } print:bg-transparent print:text-black`}
                                                >
                                                    {contact.order_status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${contact.paid_status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} print:bg-transparent print:text-black`}>
                                                    {contact.paid_status ?? 'Non-Paid'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleEdit(contact)}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-500/20 hover:text-blue-400 print:hidden"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="p-6 text-center text-slate-400">
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between border-t border-slate-800 pt-3 text-sm text-slate-400 print:border-t print:border-yellow-300 print:text-black">
                            <span className="font-medium">Total records: {contacts.length}</span>
                            <div className="flex gap-6">
                                <span className="font-medium text-red-400 print:text-black">
                                    Non-Paid: {moneyBdt(nonPaidTotalBdt / exchangeRate)}
                                </span>
                                <span className="font-medium print:text-black">
                                    Total KWD: {moneyKwd(totalKwd)}
                                </span>
                                <span className="font-medium text-teal-400 print:text-black">
                                    Total BDT: {moneyBdt(totalKwd)}
                                </span>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {editingContact && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Edit Contact</h2>
                            <button
                                onClick={() => setEditingContact(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Mobile number</label>
                                <div className="mt-1.5 flex gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-32 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                    >
                                        {countryCodes.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                        placeholder="Enter number"
                                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Order Number</label>
                                <input
                                    type="text"
                                    value={data.order_number}
                                    onChange={(e) => setData('order_number', e.target.value)}
                                    placeholder="e.g., ORD-001"
                                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Product Name</label>
                                <input
                                    type="text"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    placeholder="e.g., iPhone 15"
                                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Profit (KWD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.profit}
                                    onChange={(e) => setData('profit', e.target.value)}
                                    placeholder="0.00"
                                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Total Order Amount (KWD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.total_order_amount}
                                    onChange={(e) => setData('total_order_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Order's date</label>
                                <input
                                    type="date"
                                    value={data.order_date}
                                    onChange={(e) => setData('order_date', e.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                                />
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-300">Order's status</p>
                                <div className="flex flex-wrap gap-3">
                                    {([
                                        ['Done', 'bg-green-500'],
                                        ['Cancel', 'bg-red-500'],
                                        ['Pending', 'bg-sky-400'],
                                        ['Upcoming', 'bg-yellow-400'],
                                    ] as const).map(([label, color]) => (
                                        <label key={label} className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="order_status"
                                                value={label}
                                                checked={data.order_status === label}
                                                onChange={(e) => setData('order_status', e.target.value)}
                                                className="sr-only"
                                            />
                                            <span
                                                className={`inline-block h-3.5 w-3.5 rounded-full ${color} ${
                                                    data.order_status === label
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                                        : ''
                                                }`}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-300">Paid Status</p>
                                <div className="flex flex-wrap gap-3">
                                    {([
                                        ['Paid', 'bg-green-500'],
                                        ['Non-Paid', 'bg-red-500'],
                                    ] as const).map(([label, color]) => (
                                        <label key={label} className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="paid_status"
                                                value={label}
                                                checked={data.paid_status === label}
                                                onChange={(e) => setData('paid_status', e.target.value)}
                                                className="sr-only"
                                            />
                                            <span
                                                className={`inline-block h-3.5 w-3.5 rounded-full ${color} ${
                                                    data.paid_status === label
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                                        : ''
                                                }`}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Update Contact'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingContact(null)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 font-medium text-white transition-all hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Report.layout = {
    breadcrumbs: [{ title: 'Report', href: '/report' }],
};
