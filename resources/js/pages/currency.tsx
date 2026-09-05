import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Save, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type CurrencySetting = {
    id: number;
    from_currency: string;
    to_currency: string;
    rate: number;
};

export default function Currency({
    currencies,
    defaultRate,
}: {
    currencies: CurrencySetting[];
    defaultRate: number;
}) {
    const { data, setData, post, processing } = useForm({
        from_currency: 'KWD',
        to_currency: 'BDT',
        rate: defaultRate.toString(),
    });

    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(
                mainRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/currency', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Currency Settings" />
            <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Currency Settings</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Manage exchange rates for profit conversion
                        </p>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/30">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20">
                            <DollarSign className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Exchange Rate</h2>
                            <p className="text-sm text-slate-400">
                                Set the conversion rate from KWD to BDT
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    From Currency
                                </label>
                                <input
                                    type="text"
                                    value={data.from_currency}
                                    onChange={(e) => setData('from_currency', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-teal-500"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    To Currency
                                </label>
                                <input
                                    type="text"
                                    value={data.to_currency}
                                    onChange={(e) => setData('to_currency', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-teal-500"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    Exchange Rate
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={data.rate}
                                    onChange={(e) => setData('rate', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-teal-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                                <RotateCcw className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    1 KWD = {data.rate} BDT
                                </p>
                                <p className="text-xs text-slate-400">
                                    This rate will be applied to all profit conversions in reports
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 font-medium text-white hover:bg-teal-400 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </section>

                {currencies.length > 0 && (
                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white">
                        <h2 className="mb-4 font-semibold">Current Rates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-y border-slate-700 bg-slate-800 text-slate-300">
                                    <tr>
                                        <th className="p-3 font-medium">From</th>
                                        <th className="p-3 font-medium">To</th>
                                        <th className="p-3 font-medium">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currencies.map((currency) => (
                                        <tr
                                            key={currency.id}
                                            className="border-b border-slate-800 last:border-0"
                                        >
                                            <td className="p-3 font-medium">{currency.from_currency}</td>
                                            <td className="p-3">{currency.to_currency}</td>
                                            <td className="p-3">{currency.rate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}

Currency.layout = {
    breadcrumbs: [{ title: 'Currency', href: '/currency' }],
};
