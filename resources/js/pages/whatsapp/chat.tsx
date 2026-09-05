import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MessageCircle,
    MoreVertical,
    Send,
    Smile,
    Paperclip,
    Image,
    FileText,
    Mic,
    Phone,
    Video,
    X,
    CheckCheck,
    Check,
    ArrowLeft,
    Pin,
    Archive,
    ChevronDown,
    Tag,
    ShoppingBag,
    DollarSign,
    Calendar,
    ExternalLink,
    MessageSquare,
    File,
    Play,
    Pause,
    Reply,
    Forward,
    Trash2,
    Star,
    Copy,
    Info,
    Users,
    Inbox,
    ArchiveIcon,
} from 'lucide-react';

type ConversationContact = {
    id: number;
    name: string;
    phone: string;
    whatsapp_number: string;
    avatar: string | null;
    status: 'active' | 'inactive' | 'blocked';
};

type Conversation = {
    id: number;
    contact: ConversationContact;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    is_archived: boolean;
    is_pinned: boolean;
};

type ChatMessage = {
    id: number;
    direction: 'inbound' | 'outbound';
    message_type: 'text' | 'image' | 'document' | 'template' | 'voice' | 'video';
    content: string;
    media_url: string | null;
    caption: string | null;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    sent_at: string;
    delivered_at: string | null;
    read_at: string | null;
};

type ActiveConversation = {
    id: number;
    contact: {
        id: number;
        name: string;
        phone: string;
        whatsapp_number: string;
        email: string | null;
        avatar: string | null;
        status: 'active' | 'inactive' | 'blocked';
        tags: string[];
        total_orders: number;
        total_purchase: number;
        last_order_date: string | null;
    };
    messages: ChatMessage[];
    unread_count: number;
};

type ContactInfo = {
    name: string;
    phone: string;
    email: string | null;
    tags: string[];
    total_orders: number;
    total_purchase: number;
    last_order_date: string | null;
};

type Props = {
    conversations: Conversation[];
    activeConversation: ActiveConversation | null;
    contactInfo: ContactInfo;
};

const QUICK_REPLIES = [
    'Thank you for your message!',
    'I will get back to you shortly.',
    'Your order has been confirmed.',
    'Please check your email for details.',
    'Is there anything else I can help with?',
];

const EMOJI_GRID = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲',
    '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤝',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞',
    '🙏', '💪', '🎉', '🎊', '✅', '❌', '⭐', '🔥', '💯', '✨',
];

const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

const MessageStatusIcon = ({ status }: { status: string }) => {
    if (status === 'sent') return <Check size={14} className="text-slate-400" />;
    if (status === 'delivered') return <CheckCheck size={14} className="text-slate-400" />;
    if (status === 'read') return <CheckCheck size={14} className="text-blue-400" />;
    if (status === 'failed') return <span className="text-xs text-red-400">!</span>;
    return null;
};

export default function WhatsAppChat({ conversations, activeConversation, contactInfo }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const [selectedConversation, setSelectedConversation] = useState<ActiveConversation | null>(activeConversation);
    const [messageInput, setMessageInput] = useState('');
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatOnMobile, setShowChatOnMobile] = useState(!!activeConversation);
    const [typingIndicator, setTypingIndicator] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages]);

    useEffect(() => {
        const handleClickOutside = () => {
            setShowEmojiPicker(false);
            setShowQuickReplies(false);
            setMenuOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredConversations = useMemo(() => {
        let result = conversations;
        if (activeFilter === 'unread') {
            result = result.filter((c) => c.unread_count > 0 && !c.is_archived);
        } else if (activeFilter === 'archived') {
            result = result.filter((c) => c.is_archived);
        } else {
            result = result.filter((c) => !c.is_archived);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.contact.name.toLowerCase().includes(q) ||
                    c.last_message.toLowerCase().includes(q),
            );
        }
        return result.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });
    }, [conversations, activeFilter, searchQuery]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversation) return;
        const newMessage: ChatMessage = {
            id: Date.now(),
            direction: 'outbound',
            message_type: 'text',
            content: messageInput,
            media_url: null,
            caption: null,
            status: 'sent',
            sent_at: new Date().toISOString(),
            delivered_at: null,
            read_at: null,
        };
        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
        });
        setMessageInput('');
        setShowQuickReplies(false);
        messageInputRef.current?.focus();

        setTimeout(() => setTypingIndicator(true), 1000);
        setTimeout(() => {
            setTypingIndicator(false);
            if (selectedConversation) {
                setSelectedConversation((prev) => {
                    if (!prev) return prev;
                    const msgs = prev.messages.map((m) =>
                        m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m,
                    );
                    return { ...prev, messages: msgs };
                });
            }
        }, 2000);
    };

    const handleSelectConversation = (conv: Conversation) => {
        const mockActive: ActiveConversation = {
            id: conv.id,
            contact: {
                ...conv.contact,
                email: null,
                tags: [],
                total_orders: 0,
                total_purchase: 0,
                last_order_date: null,
            },
            messages: [],
            unread_count: conv.unread_count,
        };
        setSelectedConversation(mockActive);
        setShowChatOnMobile(true);
    };

    const handleBackToList = () => {
        setShowChatOnMobile(false);
    };

    const handleInsertEmoji = (emoji: string) => {
        setMessageInput((prev) => prev + emoji);
        messageInputRef.current?.focus();
    };

    const handleQuickReply = (reply: string) => {
        setMessageInput(reply);
        setShowQuickReplies(false);
        messageInputRef.current?.focus();
    };

    const tagColors: Record<string, string> = {
        vip: 'bg-amber-500/20 text-amber-400',
        repeat: 'bg-blue-500/20 text-blue-400',
        new: 'bg-cyan-500/20 text-cyan-400',
        wholesale: 'bg-purple-500/20 text-purple-400',
        retail: 'bg-green-500/20 text-green-400',
        default: 'bg-slate-500/20 text-slate-400',
    };

    const groupMessagesByDate = (messages: ChatMessage[]) => {
        const groups: { date: string; messages: ChatMessage[] }[] = [];
        let currentDate = '';
        messages.forEach((msg) => {
            const msgDate = new Date(msg.sent_at).toDateString();
            if (msgDate !== currentDate) {
                currentDate = msgDate;
                groups.push({ date: msg.sent_at, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        });
        return groups;
    };

    const renderConversationList = () => (
        <div className={`flex h-full flex-col border-r border-slate-800 bg-slate-900/80 ${isMobileView && showChatOnMobile ? 'hidden' : 'w-full md:w-[380px] lg:w-[420px]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                        {getInitials('Me')}
                    </div>
                    <h2 className="text-lg font-semibold text-white">Chats</h2>
                </div>
                <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search or start new chat"
                        className="w-full rounded-lg bg-slate-800/80 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 px-4 pb-3">
                {[
                    { id: 'all' as const, label: 'All', icon: Inbox },
                    { id: 'unread' as const, label: 'Unread', icon: MessageCircle },
                    { id: 'archived' as const, label: 'Archived', icon: Archive },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            activeFilter === tab.id
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <tab.icon size={13} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                        const isActive = selectedConversation?.id === conv.id;
                        return (
                            <motion.button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-slate-800/50 ${
                                    isActive ? 'border-l-[3px] border-l-emerald-500 bg-slate-800/30' : ''
                                }`}
                                whileTap={{ scale: 0.99 }}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {conv.contact.avatar ? (
                                        <img
                                            src={conv.contact.avatar}
                                            alt={conv.contact.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                                            {getInitials(conv.contact.name)}
                                        </div>
                                    )}
                                    <div
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${
                                            conv.contact.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                                        }`}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            {conv.is_pinned && (
                                                <Pin size={12} className="flex-shrink-0 text-slate-500" />
                                            )}
                                            <span className={`truncate text-sm ${conv.unread_count > 0 ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                                                {conv.contact.name}
                                            </span>
                                        </div>
                                        <span className={`flex-shrink-0 text-[11px] ${conv.unread_count > 0 ? 'font-medium text-emerald-400' : 'text-slate-500'}`}>
                                            {formatRelativeTime(conv.last_message_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`truncate text-[13px] ${conv.unread_count > 0 ? 'font-medium text-slate-300' : 'text-slate-400'}`}>
                                            {conv.last_message}
                                        </p>
                                        {conv.unread_count > 0 && (
                                            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                            <MessageCircle size={28} className="text-slate-600" />
                        </div>
                        <p className="text-center text-sm font-medium text-slate-400">No conversations yet</p>
                        <p className="mt-1 text-center text-xs text-slate-500">Start a conversation to see it here</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderChatWindow = () => {
        if (!selectedConversation) {
            return (
                <div className={`flex flex-1 flex-col items-center justify-center bg-slate-950/50 ${isMobileView && !showChatOnMobile ? 'hidden' : ''}`}>
                    <div className="flex flex-col items-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500/20 bg-emerald-500/10">
                            <MessageCircle size={44} className="text-emerald-500" />
                        </div>
                        <h3 className="mb-2 text-xl font-light text-white">WhatsApp Web</h3>
                        <p className="max-w-md text-center text-sm text-slate-400">
                            Send and receive messages without keeping your phone online.
                        </p>
                        <p className="mt-2 text-center text-xs text-slate-500">
                            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                        </p>
                        <div className="mt-8 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-400">Connected</span>
                        </div>
                    </div>
                </div>
            );
        }

        const messageGroups = groupMessagesByDate(selectedConversation.messages);

        return (
            <div className={`flex flex-1 flex-col bg-slate-950/30 ${isMobileView && !showChatOnMobile ? 'hidden' : ''}`}>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {isMobileView && (
                            <button onClick={handleBackToList} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="relative">
                            {selectedConversation.contact.avatar ? (
                                <img
                                    src={selectedConversation.contact.avatar}
                                    alt={selectedConversation.contact.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                                    {getInitials(selectedConversation.contact.name)}
                                </div>
                            )}
                            <div
                                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
                                    selectedConversation.contact.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                                }`}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{selectedConversation.contact.name}</h3>
                            <p className="text-[11px] text-slate-400">
                                {selectedConversation.contact.status === 'active' ? 'online' : selectedConversation.contact.phone}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                            <Video size={18} />
                        </button>
                        <button className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                            <Phone size={18} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(!menuOpen);
                                }}
                                className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                                <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-2xl"
                                    >
                                        <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                                            <Info size={15} /> Contact info
                                        </button>
                                        <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                                            <Star size={15} /> Starred messages
                                        </button>
                                        <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                                            <MessageSquare size={15} /> Select messages
                                        </button>
                                        <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                                            <Archive size={15} /> Archive chat
                                        </button>
                                        <div className="my-1 h-px bg-slate-800" />
                                        <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-slate-800">
                                            <Trash2 size={15} /> Delete chat
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={() => setShowContactInfo(!showContactInfo)}
                            className={`rounded-lg p-2.5 transition-colors ${showContactInfo ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Info size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-4"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                >
                    {selectedConversation.messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-center backdrop-blur-sm">
                                <p className="text-xs text-slate-400">
                                    Messages are end-to-end encrypted. No one outside of this chat can read them.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-1">
                            {messageGroups.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    {/* Date Separator */}
                                    <div className="flex items-center justify-center py-3">
                                        <span className="rounded-lg bg-slate-800/80 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-sm">
                                            {formatDateSeparator(group.date)}
                                        </span>
                                    </div>
                                    {/* Messages */}
                                    {group.messages.map((msg, msgIdx) => {
                                        const isOutbound = msg.direction === 'outbound';
                                        const showTail =
                                            msgIdx === 0 ||
                                            group.messages[msgIdx - 1]?.direction !== msg.direction;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} ${showTail ? 'mt-2' : 'mt-0.5'}`}
                                            >
                                                <div
                                                    className={`relative max-w-[75%] rounded-xl px-3 py-2 shadow-sm ${
                                                        isOutbound
                                                            ? 'rounded-tr-none bg-emerald-900/70 text-white'
                                                            : 'rounded-tl-none bg-slate-800 text-slate-100'
                                                    }`}
                                                >
                                                    {/* Message Content */}
                                                    {msg.message_type === 'text' && (
                                                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                                    )}
                                                    {msg.message_type === 'image' && (
                                                        <div className="space-y-1">
                                                            <div className="overflow-hidden rounded-lg">
                                                                {msg.media_url ? (
                                                                    <img src={msg.media_url} alt="Media" className="max-h-64 w-full object-cover" />
                                                                ) : (
                                                                    <div className="flex h-40 w-48 items-center justify-center bg-slate-700/50">
                                                                        <Image size={32} className="text-slate-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {msg.caption && (
                                                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.caption}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.message_type === 'document' && (
                                                        <div className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                                                                <File size={20} className="text-blue-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-white">{msg.content}</p>
                                                                <p className="text-[11px] text-slate-400">Document</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg.message_type === 'template' && (
                                                        <div className="space-y-1">
                                                            <div className="rounded-lg bg-slate-700/30 p-3">
                                                                <p className="text-[13px] text-slate-200">{msg.content}</p>
                                                            </div>
                                                            {msg.media_url && (
                                                                <div className="overflow-hidden rounded-lg">
                                                                    <img src={msg.media_url} alt="Template" className="max-h-48 w-full object-cover" />
                                                                </div>
                                                            )}
                                                            {msg.caption && (
                                                                <p className="text-[14px] leading-relaxed">{msg.caption}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.message_type === 'voice' && (
                                                        <div className="flex items-center gap-3">
                                                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/30">
                                                                <Play size={14} className="text-emerald-300" />
                                                            </button>
                                                            <div className="flex-1">
                                                                <div className="h-1 w-24 rounded-full bg-slate-600">
                                                                    <div className="h-full w-1/3 rounded-full bg-emerald-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] text-slate-400">0:12</span>
                                                        </div>
                                                    )}

                                                    {/* Time & Status */}
                                                    <div className={`mt-1 flex items-center justify-end gap-1 ${isOutbound ? '' : ''}`}>
                                                        <span className="text-[10px] text-slate-400">
                                                            {formatMessageTime(msg.sent_at)}
                                                        </span>
                                                        {isOutbound && <MessageStatusIcon status={msg.status} />}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            <AnimatePresence>
                                {typingIndicator && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex justify-start"
                                    >
                                        <div className="rounded-xl rounded-tl-none bg-slate-800 px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-1">
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    className="h-2 w-2 rounded-full bg-slate-400"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                                    className="h-2 w-2 rounded-full bg-slate-400"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                                    className="h-2 w-2 rounded-full bg-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies Bar */}
                <AnimatePresence>
                    {showQuickReplies && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-800 bg-slate-900/80"
                        >
                            <div className="flex gap-2 overflow-x-auto px-4 py-2.5">
                                {QUICK_REPLIES.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickReply(reply)}
                                        className="flex-shrink-0 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-[12px] text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message Input Area */}
                <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowQuickReplies(false);
                                }}
                                className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                                <Smile size={22} />
                            </button>
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute bottom-full left-0 mb-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
                                    >
                                        <div className="mb-2 grid grid-cols-10 gap-1">
                                            {EMOJI_GRID.map((emoji, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleInsertEmoji(emoji)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-slate-800"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowQuickReplies(!showQuickReplies);
                                    setShowEmojiPicker(false);
                                }}
                                className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                                <Paperclip size={22} />
                            </button>
                        </div>
                        <div className="relative flex-1">
                            <input
                                ref={messageInputRef}
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type a message"
                                className="w-full rounded-lg bg-slate-800/80 py-2.5 px-4 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (messageInput.trim()) {
                                    handleSendMessage();
                                } else {
                                    setShowQuickReplies(!showQuickReplies);
                                }
                            }}
                            className={`rounded-lg p-2.5 transition-all ${
                                messageInput.trim()
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {messageInput.trim() ? <Send size={20} /> : <Mic size={22} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderContactInfoPanel = () => {
        if (!showContactInfo || !selectedConversation) return null;
        return (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden h-full flex-col overflow-hidden border-l border-slate-800 bg-slate-900/80 lg:flex"
            >
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h3 className="text-sm font-semibold text-white">Contact Info</h3>
                    <button
                        onClick={() => setShowContactInfo(false)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Avatar & Name */}
                    <div className="flex flex-col items-center border-b border-slate-800 px-5 py-8">
                        {selectedConversation.contact.avatar ? (
                            <img
                                src={selectedConversation.contact.avatar}
                                alt={selectedConversation.contact.name}
                                className="mb-3 h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
                                {getInitials(selectedConversation.contact.name)}
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-white">{selectedConversation.contact.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{selectedConversation.contact.phone}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-0 border-b border-slate-800">
                        {selectedConversation.contact.email && (
                            <div className="flex items-center gap-4 px-5 py-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                                    <span className="text-slate-400">@</span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500">Email</p>
                                    <p className="text-sm text-white">{selectedConversation.contact.email}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4 px-5 py-3.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                                <Phone size={16} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500">Phone</p>
                                <p className="text-sm text-white">{selectedConversation.contact.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {selectedConversation.contact.tags.length > 0 && (
                        <div className="border-b border-slate-800 px-5 py-4">
                            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">Tags</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedConversation.contact.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tagColors[tag] || tagColors.default}`}
                                    >
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Stats */}
                    <div className="border-b border-slate-800 px-5 py-4">
                        <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Order Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-slate-400" />
                                    <span className="text-sm text-slate-300">Total Orders</span>
                                </div>
                                <span className="text-sm font-medium text-white">{selectedConversation.contact.total_orders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={14} className="text-slate-400" />
                                    <span className="text-sm text-slate-300">Total Purchase</span>
                                </div>
                                <span className="text-sm font-medium text-emerald-400">
                                    {selectedConversation.contact.total_purchase.toLocaleString()}
                                </span>
                            </div>
                            {selectedConversation.contact.last_order_date && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-sm text-slate-300">Last Order</span>
                                    </div>
                                    <span className="text-sm text-white">
                                        {new Date(selectedConversation.contact.last_order_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 px-5 py-4">
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
                            <Send size={16} /> Send Offer
                        </button>
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700">
                            <FileText size={16} /> Send Invoice
                        </button>
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700">
                            <ExternalLink size={16} /> View History
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <Head title="WhatsApp Chat" />

            <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1600px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl m-4">
                {renderConversationList()}
                {renderChatWindow()}
                <AnimatePresence>
                    {renderContactInfoPanel()}
                </AnimatePresence>
            </main>
        </>
    );
}

WhatsAppChat.layout = {
    breadcrumbs: [{ title: 'WhatsApp Chat', href: '/whatsapp/chat' }],
};
