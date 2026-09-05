import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Globe,
    Mail,
    Building2,
    Phone,
    Camera,
    Save,
    Wifi,
    WifiOff,
    RefreshCw,
    Copy,
    Key,
    Eye,
    EyeOff,
    Link,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';

const countryCodes = [
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
];

type WhatsAppAccount = {
    id: number;
    business_name: string | null;
    phone_number: string | null;
    country_code: string | null;
    whatsapp_business_account_id: string | null;
    phone_number_id: string | null;
    meta_app_id: string | null;
    business_website: string | null;
    business_email: string | null;
    business_logo: string | null;
    connection_status: string | null;
    last_sync_at: string | null;
    webhook_url: string | null;
    webhook_verify_token: string | null;
};

type Props = {
    account: WhatsAppAccount | null;
};

export default function WhatsAppSettings({ account }: Props) {
    const [showToken, setShowToken] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [testing, setTesting] = useState(false);

    const form = useForm({
        business_name: account?.business_name ?? '',
        phone_number: account?.phone_number ?? '',
        country_code: account?.country_code ?? '+965',
        business_website: account?.business_website ?? '',
        business_email: account?.business_email ?? '',
        business_logo: account?.business_logo ?? '',
        whatsapp_business_account_id: account?.whatsapp_business_account_id ?? '',
        phone_number_id: account?.phone_number_id ?? '',
        meta_app_id: account?.meta_app_id ?? '',
        meta_app_secret: '',
        permanent_access_token: '',
        webhook_verify_token: account?.webhook_verify_token ?? '',
    });

    const isConnected = account?.connection_status === 'connected';
    const webhookUrl = account?.webhook_url || `${window.location.origin}/webhook/whatsapp`;

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/whatsapp/settings', {
            preserveScroll: true,
            onSuccess: () => {
                showToast('success', 'Settings saved successfully!');
            },
            onError: () => {
                showToast('error', 'Failed to save settings. Please try again.');
            },
        });
    };

    const handleConnect = () => {
        setConnecting(true);
        router.post('/whatsapp/connect', {}, {
            preserveScroll: true,
            onFinish: () => setConnecting(false),
            onSuccess: () => showToast('success', 'WhatsApp connected successfully!'),
            onError: () => showToast('error', 'Failed to connect. Please check your credentials.'),
        });
    };

    const handleTestConnection = () => {
        setTesting(true);
        router.post('/whatsapp/test-connection', {}, {
            preserveScroll: true,
            onFinish: () => setTesting(false),
            onSuccess: () => showToast('success', 'Connection test successful!'),
            onError: () => showToast('error', 'Connection test failed.'),
        });
    };

    const handleDisconnect = () => {
        if (confirm('Are you sure you want to disconnect WhatsApp?')) {
            router.post('/whatsapp/disconnect', {}, {
                preserveScroll: true,
                onSuccess: () => showToast('success', 'WhatsApp disconnected.'),
                onError: () => showToast('error', 'Failed to disconnect.'),
            });
        }
    };

    const handleGenerateWebhook = () => {
        router.post('/whatsapp/generate-webhook', {}, {
            preserveScroll: true,
            onSuccess: () => showToast('success', 'Webhook token generated!'),
            onError: () => showToast('error', 'Failed to generate webhook token.'),
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied to clipboard!');
    };

    return (
        <>
            <Head title="WhatsApp Settings" />

            {/* Toast Notification */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg ${
                        toast.type === 'success'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </motion.div>
            )}

            <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/30 md:p-8"
                >
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                                <MessageCircle size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">WhatsApp Business Settings</h1>
                                <p className="mt-1 text-sm text-emerald-100">Configure your WhatsApp Business API connection</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur-sm ${
                                isConnected
                                    ? 'border border-emerald-400/30 bg-emerald-500/20'
                                    : 'border border-red-400/30 bg-red-500/20'
                            }`}>
                                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                            {account?.last_sync_at && (
                                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                                    <Clock size={14} className="text-emerald-200" />
                                    <span className="text-xs text-emerald-100">
                                        Last sync: {new Date(account.last_sync_at).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-3"
                >
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
                    >
                        {connecting ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                        Connect WhatsApp
                    </button>
                    <button
                        onClick={handleTestConnection}
                        disabled={testing || !isConnected}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 disabled:opacity-50"
                    >
                        {testing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Test Connection
                    </button>
                    <button
                        onClick={handleDisconnect}
                        disabled={!isConnected}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-400 disabled:opacity-50"
                    >
                        <WifiOff size={16} />
                        Disconnect
                    </button>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5">
                                <Building2 size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Business Information</h2>
                                <p className="text-xs text-slate-400">Your WhatsApp Business profile details</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Business Name</label>
                                <input
                                    type="text"
                                    value={form.data.business_name}
                                    onChange={(e) => form.setData('business_name', e.target.value)}
                                    placeholder="Your Business Name"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Phone Number</label>
                                <div className="flex gap-2">
                                    <select
                                        value={form.data.country_code}
                                        onChange={(e) => form.setData('country_code', e.target.value)}
                                        className="w-32 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                                    >
                                        {countryCodes.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={form.data.phone_number}
                                        onChange={(e) => form.setData('phone_number', e.target.value)}
                                        placeholder="51234567"
                                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Business Website</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="url"
                                        value={form.data.business_website}
                                        onChange={(e) => form.setData('business_website', e.target.value)}
                                        placeholder="https://yourbusiness.com"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Business Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        value={form.data.business_email}
                                        onChange={(e) => form.setData('business_email', e.target.value)}
                                        placeholder="contact@yourbusiness.com"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Business Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 transition-colors hover:border-emerald-500">
                                        {form.data.business_logo ? (
                                            <img src={form.data.business_logo} alt="Logo" className="h-full w-full object-cover" />
                                        ) : (
                                            <Camera size={24} className="text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Recommended size: 200x200px</p>
                                        <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Meta API Credentials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                                <Key size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Meta API Credentials</h2>
                                <p className="text-xs text-slate-400">Your Meta Developer credentials for WhatsApp Business API</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">WhatsApp Business Account ID</label>
                                <input
                                    type="text"
                                    value={form.data.whatsapp_business_account_id}
                                    onChange={(e) => form.setData('whatsapp_business_account_id', e.target.value)}
                                    placeholder="WABA-XXXXXXXXX"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Phone Number ID</label>
                                <input
                                    type="text"
                                    value={form.data.phone_number_id}
                                    onChange={(e) => form.setData('phone_number_id', e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXXXXX"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Meta App ID</label>
                                <input
                                    type="text"
                                    value={form.data.meta_app_id}
                                    onChange={(e) => form.setData('meta_app_id', e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXXXXX"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Meta App Secret</label>
                                <div className="relative">
                                    <input
                                        type={showSecret ? 'text' : 'password'}
                                        value={form.data.meta_app_secret}
                                        onChange={(e) => form.setData('meta_app_secret', e.target.value)}
                                        placeholder="••••••••••••••••••••••••"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Permanent Access Token</label>
                                <div className="relative">
                                    <input
                                        type={showToken ? 'text' : 'password'}
                                        value={form.data.permanent_access_token}
                                        onChange={(e) => form.setData('permanent_access_token', e.target.value)}
                                        placeholder="••••••••••••••••••••••••••••••••"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-20 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowToken(!showToken)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(form.data.permanent_access_token)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Webhook Configuration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5">
                                <Link size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Webhook Configuration</h2>
                                <p className="text-xs text-slate-400">Configure webhooks to receive real-time message updates</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Webhook URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={webhookUrl}
                                            readOnly
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(webhookUrl)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white transition-colors hover:bg-slate-700"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500">This URL will receive webhook events from Meta</p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Webhook Verify Token</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.data.webhook_verify_token}
                                        onChange={(e) => form.setData('webhook_verify_token', e.target.value)}
                                        placeholder="Your verify token"
                                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateWebhook}
                                        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                                    >
                                        <Shield size={16} />
                                        Generate
                                    </button>
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500">Used to verify webhook subscriptions</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end"
                    >
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50"
                        >
                            {form.processing ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            Save Settings
                        </button>
                    </motion.div>
                </form>

                {/* Connection Status Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm"
                >
                    <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-sm text-slate-300">
                        {isConnected ? 'WhatsApp Business API is connected and active' : 'WhatsApp Business API is not connected'}
                    </span>
                </motion.div>
            </main>
        </>
    );
}
