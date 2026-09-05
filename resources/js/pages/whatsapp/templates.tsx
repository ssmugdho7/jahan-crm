import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Pencil,
    Copy,
    Trash2,
    Eye,
    X,
    ChevronDown,
    ChevronRight,
    Image,
    Video,
    FileIcon,
    Upload,
    Braces,
    Check,
    AlertCircle,
    Clock,
    Type,
    Phone,
    Globe,
    MessageSquare,
    GripVertical,
    Search,
    Send,
    Smile,
    Paperclip,
    Mic,
    MoreVertical,
    Smartphone,
    ArrowLeft,
    Link,
} from 'lucide-react';

type Template = {
    id: number;
    name: string;
    category: string;
    body_text: string;
    header_text: string;
    footer_text: string;
    variables: string[];
    buttons: Button[];
    media_url: string | null;
    media_type: string | null;
    status: string;
    whatsapp_template_id: string | null;
    created_at: string;
};

type Button = {
    id: string;
    type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
    text: string;
    url?: string;
    phone_number?: string;
};

const CATEGORY_TABS = ['All', 'Marketing', 'Transactional', 'Utility'] as const;

const CATEGORY_COLORS: Record<string, string> = {
    Marketing: 'bg-blue-500/20 text-blue-400',
    Transactional: 'bg-emerald-500/20 text-emerald-400',
    Utility: 'bg-amber-500/20 text-amber-400',
};

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Check }> = {
    approved: { color: 'bg-emerald-500/20 text-emerald-400', icon: Check },
    pending: { color: 'bg-amber-500/20 text-amber-400', icon: Clock },
    rejected: { color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
};

const VARIABLE_OPTIONS = [
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'coupon', label: 'Coupon Code' },
    { value: 'discount', label: 'Discount' },
    { value: 'website', label: 'Website' },
    { value: 'product_name', label: 'Product Name' },
    { value: 'price', label: 'Price' },
    { value: 'tracking_number', label: 'Tracking Number' },
    { value: 'phone', label: 'Phone Number' },
];

const VARIABLE_COLORS: Record<string, string> = {
    customer_name: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    coupon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    discount: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    website: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    product_name: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    price: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    tracking_number: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    phone: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

function getVariableName(varStr: string): string {
    return varStr.replace(/\{\{|\}\}/g, '').trim();
}

function renderBodyWithVariables(text: string): React.ReactNode[] {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => {
        const match = part.match(/\{\{([^}]+)\}\}/);
        if (match) {
            const varName = match[1].trim();
            const colors = VARIABLE_COLORS[varName] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            return (
                <span key={i} className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${colors}`}>
                    {`{{${varName}}}`}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function getMediaTypeIcon(type: string | null) {
    switch (type) {
        case 'image': return <Image size={14} className="text-blue-400" />;
        case 'video': return <Video size={14} className="text-purple-400" />;
        case 'document': return <FileIcon size={14} className="text-amber-400" />;
        default: return null;
    }
}

function TemplateCard({ template, onEdit, onDuplicate, onDelete, onPreview }: {
    template: Template;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onPreview: () => void;
}) {
    const statusConfig = STATUS_CONFIG[template.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50"
        >
            <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <h3 className="truncate font-mono text-sm font-semibold text-white">{template.name}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.color}`}>
                                <StatusIcon size={10} />
                                {template.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[template.category] || 'bg-slate-500/20 text-slate-400'}`}>
                                {template.category}
                            </span>
                            {template.media_type && (
                                <span className="flex items-center gap-1 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                    {getMediaTypeIcon(template.media_type)}
                                    {template.media_type}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={onPreview} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-emerald-500/20 hover:text-emerald-400 group-hover:opacity-100" title="Preview">
                            <Eye size={14} />
                        </button>
                        <button onClick={onEdit} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-blue-500/20 hover:text-blue-400 group-hover:opacity-100" title="Edit">
                            <Pencil size={14} />
                        </button>
                        <button onClick={onDuplicate} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-amber-500/20 hover:text-amber-400 group-hover:opacity-100" title="Duplicate">
                            <Copy size={14} />
                        </button>
                        <button onClick={onDelete} className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {template.header_text && (
                    <div className="mb-2 rounded-lg bg-slate-800/50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-300">{template.header_text}</p>
                    </div>
                )}

                <div className="mb-3 line-clamp-3 text-[13px] leading-relaxed text-slate-400">
                    {renderBodyWithVariables(template.body_text)}
                </div>

                {template.footer_text && (
                    <p className="mb-3 text-[11px] text-slate-500">{template.footer_text}</p>
                )}

                {template.variables && template.variables.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                        {template.variables.map((v) => {
                            const varName = getVariableName(v);
                            const colors = VARIABLE_COLORS[varName] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
                            return (
                                <span key={v} className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${colors}`}>
                                    {v}
                                </span>
                            );
                        })}
                    </div>
                )}

                {template.buttons && template.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {template.buttons.map((btn) => (
                            <span key={btn.id} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400">
                                {btn.type === 'URL' && <Link size={10} />}
                                {btn.type === 'PHONE_NUMBER' && <Phone size={10} />}
                                {btn.type === 'QUICK_REPLY' && <MessageSquare size={10} />}
                                {btn.text}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-800/50 px-5 py-2">
                <p className="text-[10px] text-slate-600">
                    Created {new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </motion.div>
    );
}

function WhatsAppPreview({ template, variables }: { template: Partial<Template>; variables: Record<string, string> }) {
    const fillVariables = (text: string) => {
        if (!text) return text;
        return text.replace(/\{\{(\w+)\}\}/g, (_, name) => variables[name] || `{{${name}}}`);
    };

    return (
        <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-[#e5ddd5] shadow-2xl">
            <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                <ArrowLeft size={20} className="text-white" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    JC
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white">Jahan CRM Store</p>
                    <p className="text-[11px] text-emerald-200">online</p>
                </div>
                <div className="flex gap-4">
                    <Video size={18} className="text-white" />
                    <Phone size={18} className="text-white" />
                    <MoreVertical size={18} className="text-white" />
                </div>
            </div>

            <div className="space-y-2 p-3" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cdc4\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-[#dcf8c6] p-2.5 shadow-sm">
                        <p className="text-[13px] text-slate-800">Hi, I'm interested in your products!</p>
                        <p className="mt-0.5 text-right text-[10px] text-slate-500">10:30 AM ✓✓</p>
                    </div>
                </div>

                <div className="flex justify-start">
                    <div className="max-w-[85%] overflow-hidden rounded-lg bg-white shadow-sm">
                        {(template as Template).media_type === 'image' && (
                            <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-teal-500">
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <Image size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Template Image</p>
                                </div>
                            </div>
                        )}
                        {(template as Template).media_type === 'video' && (
                            <div className="relative h-40 bg-gradient-to-br from-purple-400 to-pink-500">
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <Video size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Template Video</p>
                                </div>
                            </div>
                        )}
                        <div className="p-3">
                            {template.header_text && (
                                <p className="mb-2 text-[14px] font-semibold text-slate-800">{fillVariables(template.header_text)}</p>
                            )}
                            <p className="whitespace-pre-wrap text-[13px] text-slate-800">{fillVariables(template.body_text || '')}</p>
                            {template.footer_text && (
                                <p className="mt-2 text-[11px] text-slate-500">{fillVariables(template.footer_text)}</p>
                            )}
                            {template.buttons && template.buttons.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {template.buttons.map((btn) => (
                                        <button key={btn.id} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-[12px] text-slate-600 transition hover:bg-slate-50">
                                            {btn.type === 'URL' && <Globe size={12} />}
                                            {btn.type === 'PHONE_NUMBER' && <Phone size={12} />}
                                            {btn.type === 'QUICK_REPLY' && <MessageSquare size={12} />}
                                            {btn.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="mt-2 text-right text-[10px] text-slate-500">10:31 AM ✓✓</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-[#f0f0f0] px-3 py-2">
                <Smile size={22} className="text-slate-500" />
                <Paperclip size={22} className="text-slate-500" />
                <div className="flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-slate-400">Type a message</div>
                <Mic size={22} className="text-slate-500" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Send size={16} />
                </div>
            </div>
        </div>
    );
}

function TemplateModal({ template, onClose }: { template: Template | null; onClose: () => void }) {
    const isEdit = !!template;
    const [name, setName] = useState(template?.name || '');
    const [category, setCategory] = useState(template?.category || 'Marketing');
    const [headerText, setHeaderText] = useState(template?.header_text || '');
    const [bodyText, setBodyText] = useState(template?.body_text || '');
    const [footerText, setFooterText] = useState(template?.footer_text || '');
    const [buttons, setButtons] = useState<Button[]>(template?.buttons || []);
    const [mediaType, setMediaType] = useState(template?.media_type || 'none');
    const [showVariableInsert, setShowVariableInsert] = useState(false);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const detectedVariables = useCallback(() => {
        const matches = bodyText.match(/\{\{\w+\}\}/g) || [];
        return [...new Set(matches)];
    }, [bodyText]);

    const insertVariable = (variable: string) => {
        const textarea = bodyRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = bodyText.substring(0, start) + `{{${variable}}}` + bodyText.substring(end);
        setBodyText(newText);
        setShowVariableInsert(false);
        setTimeout(() => {
            textarea.focus();
            const pos = start + variable.length + 4;
            textarea.setSelectionRange(pos, pos);
        }, 0);
    };

    const addButton = (type: Button['type']) => {
        setButtons([...buttons, { id: Date.now().toString(), type, text: '', url: '', phone_number: '' }]);
    };

    const updateButton = (id: string, field: keyof Button, value: string) => {
        setButtons(buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
    };

    const removeButton = (id: string) => {
        setButtons(buttons.filter((b) => b.id !== id));
    };

    const handleSave = () => {
        const data = {
            name,
            category,
            header_text: headerText,
            body_text: bodyText,
            footer_text: footerText,
            buttons,
            media_type: mediaType === 'none' ? null : mediaType,
            variables: detectedVariables(),
        };

        if (isEdit && template) {
            router.put(`/whatsapp/templates/${template.id}`, data, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            router.post('/whatsapp/templates', data, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    const handleSubmitForApproval = () => {
        const data = {
            name,
            category,
            header_text: headerText,
            body_text: bodyText,
            footer_text: footerText,
            buttons,
            media_type: mediaType === 'none' ? null : mediaType,
            variables: detectedVariables(),
            submit_for_approval: true,
        };

        if (isEdit && template) {
            router.put(`/whatsapp/templates/${template.id}`, data, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            router.post('/whatsapp/templates', data, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    const previewTemplate: Partial<Template> = {
        name,
        header_text: headerText,
        body_text: bodyText,
        footer_text: footerText,
        buttons,
        media_type: mediaType === 'none' ? null : mediaType,
    };

    const exampleVars: Record<string, string> = {
        customer_name: 'Ahmed',
        coupon: 'SAVE20',
        discount: '20%',
        website: 'jahan-crm.com',
        product_name: 'iPhone 15 Pro',
        price: '$999',
        tracking_number: 'TRK-2024-001',
        phone: '+96598765432',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 backdrop-blur-sm md:pt-20"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-6xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Template' : 'Create Template'}</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                    <div className="max-h-[70vh] overflow-y-auto p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Template Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., promotional_offer"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="Marketing">Marketing</option>
                                    <option value="Transactional">Transactional</option>
                                    <option value="Utility">Utility</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Header Text (optional)</label>
                                <input
                                    type="text"
                                    value={headerText}
                                    onChange={(e) => setHeaderText(e.target.value)}
                                    placeholder="e.g., Special Offer for {{customer_name}}!"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div className="relative">
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Body Text</label>
                                <textarea
                                    ref={bodyRef}
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    rows={5}
                                    placeholder="Hi {{customer_name}}, you have a {{discount}} discount on {{product_name}}!"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowVariableInsert(!showVariableInsert)}
                                    className="absolute right-2 top-9 rounded-lg bg-slate-800 p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                                    title="Insert variable"
                                >
                                    <Braces size={16} />
                                </button>
                                <AnimatePresence>
                                    {showVariableInsert && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="absolute right-0 top-16 z-10 w-64 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-2xl"
                                        >
                                            <p className="mb-2 px-2 text-[11px] font-medium text-slate-400">Click to insert:</p>
                                            {VARIABLE_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => insertVariable(opt.value)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white transition-colors hover:bg-slate-700"
                                                >
                                                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${VARIABLE_COLORS[opt.value] || ''}`}>
                                                        {`{{${opt.value}}}`}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{opt.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Footer Text (optional)</label>
                                <input
                                    type="text"
                                    value={footerText}
                                    onChange={(e) => setFooterText(e.target.value)}
                                    placeholder="e.g., Reply STOP to unsubscribe"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Media Type</label>
                                <select
                                    value={mediaType}
                                    onChange={(e) => setMediaType(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="none">None</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-300">Buttons</label>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => addButton('URL')} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                                            <Link size={10} /> URL
                                        </button>
                                        <button onClick={() => addButton('PHONE_NUMBER')} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                                            <Phone size={10} /> Phone
                                        </button>
                                        <button onClick={() => addButton('QUICK_REPLY')} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                                            <MessageSquare size={10} /> Reply
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {buttons.map((btn) => (
                                            <motion.div
                                                key={btn.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-start gap-2"
                                            >
                                                <div className="flex-1 space-y-1.5 rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                                                            {btn.type === 'QUICK_REPLY' ? 'Quick Reply' : btn.type === 'URL' ? 'URL' : 'Phone'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={btn.text}
                                                        onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                                        placeholder="Button text"
                                                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                                                    />
                                                    {btn.type === 'URL' && (
                                                        <input
                                                            type="url"
                                                            value={btn.url || ''}
                                                            onChange={(e) => updateButton(btn.id, 'url', e.target.value)}
                                                            placeholder="https://example.com"
                                                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                                                        />
                                                    )}
                                                    {btn.type === 'PHONE_NUMBER' && (
                                                        <input
                                                            type="tel"
                                                            value={btn.phone_number || ''}
                                                            onChange={(e) => updateButton(btn.id, 'phone_number', e.target.value)}
                                                            placeholder="+96598765432"
                                                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                                                        />
                                                    )}
                                                </div>
                                                <button onClick={() => removeButton(btn.id)} className="mt-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/20 hover:text-red-400">
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2">
                                <Braces size={14} className="mt-0.5 text-emerald-400" />
                                <div className="flex flex-wrap gap-1">
                                    {detectedVariables().length > 0 ? (
                                        detectedVariables().map((v) => {
                                            const varName = getVariableName(v);
                                            return (
                                                <span key={v} className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${VARIABLE_COLORS[varName] || 'bg-slate-500/20 text-slate-400'}`}>
                                                    {v}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-slate-500">No variables detected. Use {'{{variable_name}}'} syntax.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l border-slate-800 bg-slate-950/50 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Eye size={16} className="text-emerald-400" /> Live Preview
                        </h3>
                        <WhatsAppPreview template={previewTemplate} variables={exampleVars} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || !bodyText.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-green-400 disabled:opacity-50"
                    >
                        <Check size={16} />
                        {isEdit ? 'Save Changes' : 'Create Template'}
                    </button>
                    <button
                        onClick={handleSubmitForApproval}
                        disabled={!name.trim() || !bodyText.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50"
                    >
                        <Send size={16} />
                        Submit for Approval
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function PreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
    const exampleVars: Record<string, string> = {
        customer_name: 'Ahmed',
        coupon: 'SAVE20',
        discount: '20%',
        website: 'jahan-crm.com',
        product_name: 'iPhone 15 Pro',
        price: '$999',
        tracking_number: 'TRK-2024-001',
        phone: '+96598765432',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Template Preview</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <p className="mb-4 text-sm text-slate-400">
                    Previewing <span className="font-mono text-white">{template.name}</span> with example variable values
                </p>
                <WhatsAppPreview template={template} variables={exampleVars} />
            </motion.div>
        </motion.div>
    );
}

export default function WhatsAppTemplates({ templates }: { templates: Template[] }) {
    const [activeTab, setActiveTab] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const filteredTemplates = templates.filter((t) => {
        const matchesCategory = activeTab === 'All' || t.category === activeTab;
        const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.body_text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(`/whatsapp/templates/${id}`, { preserveScroll: true });
        }
    };

    const handleDuplicate = (template: Template) => {
        router.post('/whatsapp/templates', {
            name: `${template.name}_copy`,
            category: template.category,
            header_text: template.header_text,
            body_text: template.body_text,
            footer_text: template.footer_text,
            buttons: template.buttons,
            media_type: template.media_type,
            variables: template.variables,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="WhatsApp Templates" />
            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
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
                                <FileText size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Message Templates</h1>
                                <p className="mt-1 text-sm text-emerald-100">Create and manage WhatsApp message templates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingTemplate(null);
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-emerald-700 shadow-lg transition-all hover:bg-emerald-50"
                        >
                            <Plus size={18} /> Create Template
                        </button>
                    </div>
                </motion.section>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    activeTab === tab
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 sm:w-72"
                        />
                    </div>
                </motion.div>

                {/* Templates Grid */}
                <section>
                    {filteredTemplates.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-12"
                        >
                            <FileText size={56} className="mb-4 text-slate-600" />
                            <p className="mb-1 text-lg font-medium text-slate-400">No templates found</p>
                            <p className="mb-6 text-sm text-slate-500">
                                {searchQuery ? 'Try a different search term' : 'Create your first message template to get started'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => {
                                        setEditingTemplate(null);
                                        setShowCreateModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-green-400"
                                >
                                    <Plus size={18} /> Create Template
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredTemplates.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onEdit={() => {
                                            setEditingTemplate(template);
                                            setShowCreateModal(true);
                                        }}
                                        onDuplicate={() => handleDuplicate(template)}
                                        onDelete={() => handleDelete(template.id)}
                                        onPreview={() => setPreviewTemplate(template)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </main>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <TemplateModal
                        template={editingTemplate}
                        onClose={() => {
                            setShowCreateModal(false);
                            setEditingTemplate(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewTemplate && (
                    <PreviewModal
                        template={previewTemplate}
                        onClose={() => setPreviewTemplate(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

WhatsAppTemplates.layout = {
    breadcrumbs: [{ title: 'Templates', href: '/whatsapp/templates' }],
};
