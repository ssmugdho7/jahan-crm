import { Head, router, useForm } from '@inertiajs/react';
import { Download, Pencil, Plus, Trash2, Users, X, Sparkles, FileText, Wand2, Loader2, Bell, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Tesseract from 'tesseract.js';
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
    mobile: string | null;
    order_number: string | null;
    product_name: string | null;
    profit: string | null;
    total_order_amount: string | null;
    order_date: string | null;
    order_status: string;
    paid_status: string;
};

export default function ContactsPage({ contacts, search }: { contacts: Contact[]; search?: string }) {
    const [countryCode, setCountryCode] = useState('+965');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [aiInput, setAiInput] = useState('');
    const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>({
        mobile: true,
        order_number: true,
        product_name: true,
        order_date: true,
    });
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, reset } = useForm({
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
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            );
        }
    }, []);

    useEffect(() => {
        if (listRef.current) {
            const items = listRef.current.querySelectorAll('.contact-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
            );
        }
    }, [contacts]);

    const parseAndFill = (text: string) => {
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{3,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,6}/);
        if (phoneMatch) {
            const phone = phoneMatch[0].replace(/[^0-9+]/g, '');
            const matchedCode = countryCodes.find((c) => phone.startsWith(c.code));
            if (matchedCode) {
                setCountryCode(matchedCode.code);
                setData('mobile', phone.slice(matchedCode.code.length));
            } else {
                setData('mobile', phone);
            }
        }

        const orderMatch = text.match(/(?:Order|Order\s*No|Order\s*Number|A)\s*[:#]?\s*([A-Za-z0-9-]+)/i);
        if (orderMatch) {
            setData('order_number', orderMatch[1]);
        }

        const productMatch = text.match(/(?:Product|Item|Product\s*Name)\s*[:#]?\s*(.+)/i);
        if (productMatch) {
            setData('product_name', productMatch[1].trim());
        }

        const amountMatch = text.match(/(?:Total|Amount|KWD|KD)\s*[:#]?\s*([\d.,]+)/i);
        if (amountMatch) {
            setData('total_order_amount', amountMatch[1].replace(/,/g, ''));
        }

        const profitMatch = text.match(/(?:Profit)\s*[:#]?\s*([\d.,]+)/i);
        if (profitMatch) {
            setData('profit', profitMatch[1].replace(/,/g, ''));
        }

        if (text.toLowerCase().includes('paid')) {
            setData('paid_status', 'Paid');
        } else if (text.toLowerCase().includes('non-paid') || text.toLowerCase().includes('unpaid')) {
            setData('paid_status', 'Non-Paid');
        }

        if (text.toLowerCase().includes('completed') || text.toLowerCase().includes('done')) {
            setData('order_status', 'Done');
        } else if (text.toLowerCase().includes('pending')) {
            setData('order_status', 'Pending');
        } else if (text.toLowerCase().includes('upcoming')) {
            setData('order_status', 'Upcoming');
        } else if (text.toLowerCase().includes('cancel')) {
            setData('order_status', 'Cancel');
        }
    };

    const handleAiAutofill = () => {
        parseAndFill(aiInput);
    };

    const handleClearAi = () => {
        setAiInput('');
        reset();
        setCountryCode('+965');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setOcrProcessing(true);
                try {
                    const result = await Tesseract.recognize(file, 'eng', {
                        logger: (m) => console.log(m),
                    });
                    const extractedText = result.data.text;
                    setAiInput(extractedText);
                    if (extractedText.trim()) {
                        parseAndFill(extractedText);
                    }
                } catch (err) {
                    console.error('OCR failed:', err);
                    alert('Failed to extract text from image. Please try again.');
                } finally {
                    setOcrProcessing(false);
                }
            } else {
                alert('Please upload an image file (JPG, PNG, etc.)');
            }
        }
        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mobileWithCode = `${countryCode}${data.mobile}`;
        post('/contacts', {
            data: {
                ...data,
                mobile: mobileWithCode,
            },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCountryCode('+965');
                setShowForm(false);
            },
        });
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
        if (!editingContact) return;
        const mobileWithCode = `${countryCode}${data.mobile}`;
        put(`/contacts/${editingContact.id}`, {
            data: { ...data, mobile: mobileWithCode },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCountryCode('+965');
                setEditingContact(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            router.delete(`/contacts/${id}`, { preserveScroll: true });
        }
    };

    const statusColor = (status: string) => {
        const styles: Record<string, string> = {
            Done: 'bg-green-500/20 text-green-400',
            Cancel: 'bg-red-500/20 text-red-400',
            Pending: 'bg-sky-400/20 text-sky-400',
            Upcoming: 'bg-yellow-400/20 text-yellow-400',
        };
        return styles[status] ?? 'bg-slate-500/20 text-slate-400';
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingContact(null);
        reset();
        setCountryCode('+965');
        setAiInput('');
    };

    const contactForm = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={closeForm}>
            <div
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                    <h2 className="text-lg font-semibold text-white">
                        {editingContact ? 'Edit Contact' : 'Add Contact'}
                    </h2>
                    <button onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="border-b border-slate-800 px-5 py-3">
                    <div className="mb-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-sm font-medium text-white">AI Assistant</span>
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">⚡</span>
                    </div>
                    <p className="mb-2 text-xs text-slate-400">Paste WhatsApp, Invoice or Customer Details</p>
                    <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder={"Customer: +96598765432\nProduct: iPhone 15 Pro Max\nOrder A1025"}
                        rows={3}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                    />
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleAiAutofill}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400"
                        >
                            <Wand2 size={14} /> AI Autofill
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={ocrProcessing}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50"
                        >
                            {ocrProcessing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                            {ocrProcessing ? 'Processing...' : 'Upload'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={handleClearAi}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-700"
                        >
                            <Trash2 size={14} /> Clear
                        </button>
                    </div>
                </div>

                <form onSubmit={editingContact ? handleUpdate : handleSubmit} className="max-h-[55vh] overflow-y-auto px-5 py-3">
                    <div className="space-y-3">
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-300">Mobile Number</label>
                                <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={aiEnabled.mobile}
                                        onChange={(e) => setAiEnabled({ ...aiEnabled, mobile: e.target.checked })}
                                        className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <Sparkles size={10} className="text-purple-400" /> AI
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
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
                                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-300">Order Number</label>
                                <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={aiEnabled.order_number}
                                        onChange={(e) => setAiEnabled({ ...aiEnabled, order_number: e.target.checked })}
                                        className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <Sparkles size={10} className="text-purple-400" /> AI
                                </label>
                            </div>
                            <input
                                type="text"
                                value={data.order_number}
                                onChange={(e) => setData('order_number', e.target.value)}
                                placeholder="e.g., A1025"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-300">Product Name</label>
                                <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={aiEnabled.product_name}
                                        onChange={(e) => setAiEnabled({ ...aiEnabled, product_name: e.target.checked })}
                                        className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <Sparkles size={10} className="text-purple-400" /> AI
                                </label>
                            </div>
                            <input
                                type="text"
                                value={data.product_name}
                                onChange={(e) => setData('product_name', e.target.value)}
                                placeholder="e.g., iPhone 15 Pro Max"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-300">Profit (KWD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={data.profit}
                                    onChange={(e) => setData('profit', e.target.value)}
                                    placeholder="0.000"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-300">Total Amount (KWD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={data.total_order_amount}
                                    onChange={(e) => setData('total_order_amount', e.target.value)}
                                    placeholder="0.000"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-300">Order Date</label>
                                <label className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={aiEnabled.order_date}
                                        onChange={(e) => setAiEnabled({ ...aiEnabled, order_date: e.target.checked })}
                                        className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <Sparkles size={10} className="text-purple-400" /> AI
                                </label>
                            </div>
                            <input
                                type="date"
                                value={data.order_date}
                                onChange={(e) => setData('order_date', e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">Order Status</label>
                            <div className="flex flex-wrap gap-1.5">
                                {([
                                    ['Done', 'bg-green-500', '🟢'],
                                    ['Cancel', 'bg-red-500', '🔴'],
                                    ['Pending', 'bg-sky-400', '🔵'],
                                    ['Upcoming', 'bg-yellow-400', '🟡'],
                                ] as const).map(([label, color, emoji]) => (
                                    <label
                                        key={label}
                                        className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                            data.order_status === label
                                                ? `border-${color.replace('bg-', '')} ${color}/20 text-white`
                                                : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="order_status"
                                            value={label}
                                            checked={data.order_status === label}
                                            onChange={(e) => setData('order_status', e.target.value)}
                                            className="sr-only"
                                        />
                                        {emoji} {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">Payment Status</label>
                            <div className="flex gap-1.5">
                                {([
                                    ['Paid', 'bg-green-500', '🟢'],
                                    ['Non-Paid', 'bg-red-500', '🔴'],
                                ] as const).map(([label, color, emoji]) => (
                                    <label
                                        key={label}
                                        className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                            data.paid_status === label
                                                ? `border-${color.replace('bg-', '')} ${color}/20 text-white`
                                                : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paid_status"
                                            value={label}
                                            checked={data.paid_status === label}
                                            onChange={(e) => setData('paid_status', e.target.value)}
                                            className="sr-only"
                                        />
                                        {emoji} {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : editingContact ? 'Update' : 'Save Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Contacts" />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                        <p className="mt-1 text-sm text-slate-300">Manage your customer contact numbers</p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="/contacts/csv"
                            download
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 font-medium text-white transition-all hover:bg-slate-700"
                        >
                            <Download size={18} />
                            Download CSV
                        </a>
                        <button
                            onClick={() => {
                                closeForm();
                                setShowForm(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40"
                        >
                            <Plus size={18} />
                            Add Contact
                        </button>
                    </div>
                </section>

                {showForm && contactForm}
                {editingContact && contactForm}

                {search && (
                    <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-amber-400" />
                            <span className="text-sm text-amber-300">Filtered from notification: <strong className="text-white">"{search}"</strong></span>
                        </div>
                        <button onClick={() => router.get('/contacts', {}, { preserveState: false, replace: true })} className="text-xs text-amber-400 hover:text-amber-300">Clear</button>
                    </div>
                )}

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">All Contacts ({contacts.length})</h2>
                    </div>
                    <div ref={listRef} className="space-y-3">
                        {contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8">
                                <Users className="mb-3 h-12 w-12 text-slate-600" />
                                <p className="text-sm text-slate-400">No contacts yet</p>
                                <p className="text-xs text-slate-500">Add your first contact to get started</p>
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="contact-item group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white">
                                            {contact.mobile ? contact.mobile.slice(-2) : '??'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{contact.mobile ?? 'No number'}</p>
                                            <p className="text-xs text-slate-400">
                                                {contact.product_name ?? 'No product'} · {contact.profit ? `${Number(contact.profit).toLocaleString()} KWD` : 'No profit'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(contact.order_status)}`}>{contact.order_status}</span>
                                        <button onClick={() => handleEdit(contact)} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-blue-500/20 hover:text-blue-400 group-hover:opacity-100">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(contact.id)} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

ContactsPage.layout = {
    breadcrumbs: [{ title: 'Contacts', href: '/contacts' }],
};
