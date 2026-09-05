import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    Sparkles,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Megaphone,
    BarChart3,
    FileText,
    Brain,
    Lightbulb,
    Target,
    Copy,
    Check,
    RotateCcw,
    Zap,
    ChevronRight,
} from 'lucide-react';

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
    created_at: string;
};

type Message = {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'insight' | 'report' | 'recommendation' | 'error';
};

type QuickAction = {
    icon: React.ElementType;
    label: string;
    query: string;
    color: string;
};

const bdt = (n: number) => `৳${n.toLocaleString()}`;

const quickActions: QuickAction[] = [
    { icon: BarChart3, label: 'Dashboard Summary', query: 'Show me a full dashboard summary', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, label: "Today's Profit", query: "What's my profit today?", color: 'from-emerald-500 to-teal-500' },
    { icon: TrendingUp, label: 'Revenue Analysis', query: 'Analyze my revenue trends', color: 'from-purple-500 to-pink-500' },
    { icon: Megaphone, label: 'Facebook Ads Analysis', query: 'Analyze my Facebook Ads performance', color: 'from-orange-500 to-amber-500' },
    { icon: Users, label: 'Customer Insights', query: 'Show me customer insights', color: 'from-pink-500 to-rose-500' },
    { icon: Package, label: 'Inventory Status', query: 'What is my inventory status?', color: 'from-cyan-500 to-blue-500' },
    { icon: FileText, label: 'Income Statement', query: 'Show me the income statement', color: 'from-teal-500 to-emerald-500' },
    { icon: Target, label: 'Business Health', query: 'How healthy is my business?', color: 'from-red-500 to-orange-500' },
];

const followUpSuggestions: Record<string, string[]> = {
    revenue: ['Compare with last month', 'Which month was best?', 'Show profit trend'],
    profit: ['What reduces my profit?', 'Show profit by product', 'Compare expenses vs profit'],
    customers: ['Who are top buyers?', 'Show repeat customers', 'Who has unpaid orders?'],
    products: ['Which product loses money?', 'Restock recommendations', 'Product performance ranking'],
    facebook: ['Which campaign has best ROAS?', 'Budget optimization tips', 'Worst performing ads'],
    orders: ['Show pending orders', 'Show upcoming deliveries', 'Order completion rate'],
    health: ['How to improve?', 'Set business goals', 'Risk assessment'],
    income: ['Breakdown by category', 'Compare with last month', 'Biggest expense'],
};

export default function SalesChatbot({ contacts }: { contacts: Contact[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [showSuggestions, setShowSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const getFollowUps = (text: string): string[] => {
        const lower = text.toLowerCase();
        if (lower.includes('revenue') || lower.includes('income') || lower.includes('sales')) return followUpSuggestions.revenue;
        if (lower.includes('profit') || lower.includes('net')) return followUpSuggestions.profit;
        if (lower.includes('customer') || lower.includes('client')) return followUpSuggestions.customers;
        if (lower.includes('product') || lower.includes('item') || lower.includes('inventory')) return followUpSuggestions.products;
        if (lower.includes('facebook') || lower.includes('ads') || lower.includes('campaign') || lower.includes('roas')) return followUpSuggestions.facebook;
        if (lower.includes('order') || lower.includes('pending') || lower.includes('upcoming')) return followUpSuggestions.orders;
        if (lower.includes('health') || lower.includes('score') || lower.includes('recommend')) return followUpSuggestions.health;
        if (lower.includes('statement') || lower.includes('expense') || lower.includes('cost')) return followUpSuggestions.income;
        return ['Show full summary', 'Give recommendations', 'Predict next month'];
    };

    const analyzeQuery = (query: string): { text: string; type: Message['type']; suggestions: string[] } => {
        const lower = query.toLowerCase();
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const totalContacts = contacts.length;
        const totalProfit = contacts.reduce((s, c) => s + Number(c.profit || 0), 0);
        const totalRevenue = contacts.reduce((s, c) => s + Number(c.total_order_amount || 0), 0);

        const todayContacts = contacts.filter((c) => {
            const d = c.order_date ? new Date(c.order_date).toISOString().slice(0, 10) : c.created_at.slice(0, 10);
            return d === today;
        });
        const todayProfit = todayContacts.reduce((s, c) => s + Number(c.profit || 0), 0);
        const todayRevenue = todayContacts.reduce((s, c) => s + Number(c.total_order_amount || 0), 0);

        const statusCounts: Record<string, number> = {};
        const paidCounts: Record<string, number> = {};
        const productSales: Record<string, { count: number; profit: number; revenue: number }> = {};
        const mobileCounts: Record<string, number> = {};

        contacts.forEach((c) => {
            statusCounts[c.order_status] = (statusCounts[c.order_status] || 0) + 1;
            paidCounts[c.paid_status] = (paidCounts[c.paid_status] || 0) + 1;
            if (c.mobile) mobileCounts[c.mobile] = (mobileCounts[c.mobile] || 0) + 1;
            if (c.product_name) {
                if (!productSales[c.product_name]) productSales[c.product_name] = { count: 0, profit: 0, revenue: 0 };
                productSales[c.product_name].count++;
                productSales[c.product_name].profit += Number(c.profit || 0);
                productSales[c.product_name].revenue += Number(c.total_order_amount || 0);
            }
        });

        const repeatCustomers = Object.entries(mobileCounts)
            .filter(([, count]) => count > 1)
            .sort((a, b) => b[1] - a[1]);

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1].profit - a[1].profit)
            .slice(0, 5);

        const worstProducts = Object.entries(productSales)
            .sort((a, b) => a[1].profit - b[1].profit)
            .slice(0, 3);

        const pendingOrders = contacts.filter((c) => c.order_status === 'Pending');
        const upcomingOrders = contacts.filter((c) => c.order_status === 'Upcoming');
        const deliveredOrders = contacts.filter((c) => c.order_status === 'Done');
        const cancelledOrders = contacts.filter((c) => c.order_status === 'Cancel');
        const unpaidOrders = contacts.filter((c) => c.paid_status === 'Non-Paid');
        const paidOrders = contacts.filter((c) => c.paid_status === 'Paid');

        const completionRate = totalContacts > 0 ? ((deliveredOrders.length / totalContacts) * 100).toFixed(1) : '0';
        const paymentRate = totalContacts > 0 ? ((paidOrders.length / totalContacts) * 100).toFixed(1) : '0';
        const cancelRate = totalContacts > 0 ? ((cancelledOrders.length / totalContacts) * 100).toFixed(1) : '0';
        const avgOrderValue = totalContacts > 0 ? totalRevenue / totalContacts : 0;

        // Dashboard Summary
        if (lower.includes('summary') || lower.includes('dashboard') || lower.includes('overview')) {
            return {
                text: `📊 **Business Dashboard Summary**\n\n` +
                    `**Revenue:** ${bdt(totalRevenue)} total | ${bdt(todayRevenue)} today\n` +
                    `**Profit:** ${bdt(totalProfit)} total | ${bdt(todayProfit)} today\n` +
                    `**Total Orders:** ${totalContacts}\n` +
                    `**Today's Orders:** ${todayContacts.length}\n\n` +
                    `**Order Status:**\n` +
                    `🟢 Done: ${deliveredOrders.length} (${completionRate}%)\n` +
                    `🟡 Pending: ${pendingOrders.length}\n` +
                    `🔵 Upcoming: ${upcomingOrders.length}\n` +
                    `🔴 Cancelled: ${cancelledOrders.length} (${cancelRate}%)\n\n` +
                    `**Payments:**\n` +
                    `✅ Paid: ${paidOrders.length} (${paymentRate}%)\n` +
                    `❌ Unpaid: ${unpaidOrders.length}\n\n` +
                    `**Top Product:** ${topProducts[0] ? topProducts[0][0] : 'N/A'} (${bdt(topProducts[0]?.[1].profit || 0)} profit)\n` +
                    `**Avg Order Value:** ${bdt(avgOrderValue)}\n` +
                    `**Repeat Customers:** ${repeatCustomers.length}`,
                type: 'insight',
                suggestions: ['Give recommendations', 'Compare with last month', 'Show profit details'],
            };
        }

        // Profit
        if (lower.includes('profit') || lower.includes('net') || lower.includes('earn')) {
            return {
                text: `💰 **Profit Analysis**\n\n` +
                    `**Total Profit:** ${bdt(totalProfit)}\n` +
                    `**Today's Profit:** ${bdt(todayProfit)}\n` +
                    `**Avg Profit/Order:** ${bdt(totalContacts > 0 ? totalProfit / totalContacts : 0)}\n\n` +
                    `**Profit by Product:**\n` +
                    topProducts.map(([name, data], i) => `${i + 1}. ${name}: ${bdt(data.profit)}`).join('\n') +
                    (worstProducts.length > 0 ? `\n\n⚠️ **Lowest Performers:**\n` + worstProducts.map(([name, data]) => `• ${name}: ${bdt(data.profit)}`).join('\n') : ''),
                type: 'insight',
                suggestions: ['What reduces my profit?', 'Show profit trend', 'Compare with last month'],
            };
        }

        // Revenue
        if (lower.includes('revenue') || lower.includes('sales') || lower.includes('income') || lower.includes('total')) {
            const thisMonth = contacts.filter((c) => {
                if (!c.order_date) return false;
                const d = new Date(c.order_date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            const lastMonth = contacts.filter((c) => {
                if (!c.order_date) return false;
                const d = new Date(c.order_date);
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
            });
            const thisMonthRev = thisMonth.reduce((s, c) => s + Number(c.total_order_amount || 0), 0);
            const lastMonthRev = lastMonth.reduce((s, c) => s + Number(c.total_order_amount || 0), 0);
            const diff = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 'N/A';

            return {
                text: `📈 **Revenue Analysis**\n\n` +
                    `**Total Revenue:** ${bdt(totalRevenue)}\n` +
                    `**Today's Revenue:** ${bdt(todayRevenue)}\n` +
                    `**This Month:** ${bdt(thisMonthRev)} (${thisMonth.length} orders)\n` +
                    `**Last Month:** ${bdt(lastMonthRev)} (${lastMonth.length} orders)\n` +
                    `**Month-over-Month:** ${diff === 'N/A' ? 'N/A' : (Number(diff) >= 0 ? `↑ +${diff}%` : `↓ ${diff}%`)}\n\n` +
                    `**Revenue by Product:**\n` +
                    topProducts.map(([name, data], i) => `${i + 1}. ${name}: ${bdt(data.revenue)} (${data.count} orders)`).join('\n'),
                type: 'insight',
                suggestions: ['Compare months', 'Show profit breakdown', 'Revenue by product'],
            };
        }

        // Customers
        if (lower.includes('customer') || lower.includes('client') || lower.includes('buyer') || lower.includes('repeat')) {
            const repeatList = repeatCustomers.slice(0, 5).map(([mobile, count]) => `• ${mobile}: ${count} orders`).join('\n');
            return {
                text: `👥 **Customer Insights**\n\n` +
                    `**Total Customers:** ${totalContacts}\n` +
                    `**Unique Phone Numbers:** ${Object.keys(mobileCounts).length}\n` +
                    `**Repeat Customers:** ${repeatCustomers.length}\n\n` +
                    (repeatList ? `**Top Repeat Buyers:**\n${repeatList}\n\n` : '') +
                    `**Unpaid Customers:** ${unpaidOrders.length}\n` +
                    `**Paid Customers:** ${paidOrders.length} (${paymentRate}%)`,
                type: 'insight',
                suggestions: ['Who has unpaid orders?', 'Top buyers by value', 'Customer growth trend'],
            };
        }

        // Products / Inventory
        if (lower.includes('product') || lower.includes('item') || lower.includes('inventory') || lower.includes('stock') || lower.includes('best selling') || lower.includes('best product')) {
            return {
                text: `📦 **Product Performance**\n\n` +
                    `**Total Products Sold:** ${Object.keys(productSales).length}\n` +
                    `**Total Orders:** ${totalContacts}\n\n` +
                    `**🏆 Top Products by Profit:**\n` +
                    topProducts.map(([name, data], i) =>
                        `${i + 1}. **${name}**\n   Orders: ${data.count} | Revenue: ${bdt(data.revenue)} | Profit: ${bdt(data.profit)}`
                    ).join('\n\n') +
                    (worstProducts.length > 0 ? `\n\n⚠️ **Lowest Performers:**\n` +
                        worstProducts.map(([name, data]) => `• ${name}: ${bdt(data.profit)} (${data.count} orders)`).join('\n') : ''),
                type: 'insight',
                suggestions: ['Which loses money?', 'Restock recommendations', 'Product comparison'],
            };
        }

        // Facebook / Ads
        if (lower.includes('facebook') || lower.includes('ads') || lower.includes('campaign') || lower.includes('roas') || lower.includes('ad spend')) {
            return {
                text: `📢 **Facebook Ads Analysis**\n\n` +
                    `To track Facebook Ads performance, add ad spend data in the **Income Statement** page.\n\n` +
                    `**Based on current data:**\n` +
                    `• Total Revenue: ${bdt(totalRevenue)}\n` +
                    `• Total Profit: ${bdt(totalProfit)}\n` +
                    `• Profit Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%\n\n` +
                    `💡 **Tips:**\n` +
                    `• Track your ad spend in Income Statement\n` +
                    `• Compare ad spend vs revenue generated\n` +
                    `• Focus on products with highest profit margins\n` +
                    `• Target repeat customers for better ROAS`,
                type: 'insight',
                suggestions: ['Show ad spend data', 'Which products to promote?', 'Budget optimization'],
            };
        }

        // Orders
        if (lower.includes('order') || lower.includes('pending') || lower.includes('upcoming') || lower.includes('delivery') || lower.includes('cancel')) {
            return {
                text: `🛒 **Order Overview**\n\n` +
                    `**Total Orders:** ${totalContacts}\n\n` +
                    `🟢 **Done:** ${deliveredOrders.length} (${completionRate}%)\n` +
                    `🟡 **Pending:** ${pendingOrders.length}\n` +
                    `🔵 **Upcoming:** ${upcomingOrders.length}\n` +
                    `🔴 **Cancelled:** ${cancelledOrders.length} (${cancelRate}%)\n\n` +
                    (pendingOrders.length > 0 ? `**Pending Orders:**\n` + pendingOrders.slice(0, 5).map((c) => `• ${c.product_name || 'Order'} - ${c.mobile || 'N/A'}`).join('\n') + '\n\n' : '') +
                    (upcomingOrders.length > 0 ? `**Upcoming Orders:**\n` + upcomingOrders.slice(0, 5).map((c) => `• ${c.product_name || 'Order'} - ${c.mobile || 'N/A'}`).join('\n') : ''),
                type: 'insight',
                suggestions: ['Show completion rate', 'Contact pending customers', 'Reduce cancellations'],
            };
        }

        // Income Statement
        if (lower.includes('statement') || lower.includes('expense') || lower.includes('cost') || lower.includes('spending')) {
            return {
                text: `📄 **Income Statement Overview**\n\n` +
                    `**Total Revenue:** ${bdt(totalRevenue)}\n` +
                    `**Total Profit:** ${bdt(totalProfit)}\n` +
                    `**Net Margin:** ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%\n\n` +
                    `To track detailed expenses, visit the **Income Statement** page and add:\n` +
                    `• Mobile Internet Cost\n` +
                    `• Facebook Boost Cost\n` +
                    `• Other Expenses\n\n` +
                    `💡 Track all expenses to get accurate profit calculations.`,
                type: 'insight',
                suggestions: ['Add new expense', 'Compare with last month', 'Show biggest expense categories'],
            };
        }

        // Business Health
        if (lower.includes('health') || lower.includes('score') || lower.includes('performance') || lower.includes('how')) {
            const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
            const score = Math.min(100, Math.round(
                (parseFloat(completionRate) * 0.3) +
                (parseFloat(profitMargin) * 0.3) +
                (parseFloat(paymentRate) * 0.2) +
                (repeatCustomers.length > 0 ? 10 : 0) +
                (todayContacts.length > 0 ? 10 : 0)
            ));

            let status = '';
            if (score >= 80) status = '🟢 Excellent';
            else if (score >= 60) status = '🔵 Good';
            else if (score >= 40) status = '🟡 Needs Attention';
            else status = '🔴 Critical';

            return {
                text: `🎯 **Business Health Report**\n\n` +
                    `**Health Score:** ${score}% ${status}\n\n` +
                    `**Key Metrics:**\n` +
                    `• Profit Margin: ${profitMargin}%\n` +
                    `• Order Completion: ${completionRate}%\n` +
                    `• Payment Collection: ${paymentRate}%\n` +
                    `• Repeat Customers: ${repeatCustomers.length}\n` +
                    `• Cancel Rate: ${cancelRate}%\n` +
                    `• Avg Order Value: ${bdt(avgOrderValue)}\n\n` +
                    `**Recommendations:**\n` +
                    (parseFloat(profitMargin) < 15 ? `⚠️ Low profit margin (${profitMargin}%). Focus on cost reduction.\n` : `✅ Profit margin is healthy (${profitMargin}%).\n`) +
                    (unpaidOrders.length > 0 ? `⚠️ ${unpaidOrders.length} unpaid orders. Follow up with customers.\n` : `✅ All orders are paid.\n`) +
                    (parseFloat(cancelRate) > 10 ? `⚠️ High cancel rate (${cancelRate}%). Improve order process.\n` : `✅ Cancel rate is low.\n`) +
                    (repeatCustomers.length === 0 ? `⚠️ No repeat customers. Improve retention.\n` : `✅ ${repeatCustomers.length} repeat customers found.\n`),
                type: 'insight',
                suggestions: ['Set business goals', 'Improve retention', 'Reduce expenses'],
            };
        }

        // Recommendations
        if (lower.includes('recommend') || lower.includes('improve') || lower.includes('suggest') || lower.includes('advice') || lower.includes('tips')) {
            const recs: string[] = [];
            if (unpaidOrders.length > 0) recs.push(`📞 Follow up with ${unpaidOrders.length} unpaid orders (potential ${bdt(unpaidOrders.reduce((s, c) => s + Number(c.total_order_amount || 0), 0))})`);
            if (worstProducts[0] && worstProducts[0][1].profit < 0) recs.push(`⚠️ Review "${worstProducts[0][0]}" - generating negative profit`);
            if (topProducts[0]) recs.push(`📈 Promote "${topProducts[0][0]}" - your best performer (${bdt(topProducts[0][1].profit)} profit)`);
            if (repeatCustomers.length === 0) recs.push('🎯 Implement customer loyalty program to increase repeat orders');
            if (parseFloat(cancelRate) > 10) recs.push(`🔍 Investigate why ${cancelledOrders.length} orders were cancelled`);
            if (parseFloat(paymentRate) < 80) recs.push('💳 Offer prepaid discounts to improve payment collection');
            recs.push('📊 Track all expenses in Income Statement for accurate profit calculation');
            recs.push('📢 Add Facebook Ads data to optimize ad spend');

            return {
                text: `💡 **Smart Recommendations**\n\n` +
                    recs.map((r, i) => `${i + 1}. ${r}`).join('\n\n'),
                type: 'recommendation',
                suggestions: ['Implement top recommendation', 'Set goals', 'Show business health'],
            };
        }

        // Predictions
        if (lower.includes('predict') || lower.includes('forecast') || lower.includes('future') || lower.includes('next month') || lower.includes('next week')) {
            const thisMonthContacts = contacts.filter((c) => {
                if (!c.order_date) return false;
                const d = new Date(c.order_date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            const monthlyRevenue = thisMonthContacts.reduce((s, c) => s + Number(c.total_order_amount || 0), 0);
            const monthlyProfit = thisMonthContacts.reduce((s, c) => s + Number(c.profit || 0), 0);

            return {
                text: `🔮 **Predictive Analytics**\n\n` +
                    `Based on your current month data:\n\n` +
                    `**This Month:**\n` +
                    `• Revenue: ${bdt(monthlyRevenue)} (${thisMonthContacts.length} orders)\n` +
                    `• Profit: ${bdt(monthlyProfit)}\n` +
                    `• Avg per Order: ${bdt(thisMonthContacts.length > 0 ? monthlyRevenue / thisMonthContacts.length : 0)}\n\n` +
                    `**Projected Next Month (if trend continues):**\n` +
                    `• Est. Revenue: ${bdt(monthlyRevenue * 1.05)} (5% growth)\n` +
                    `• Est. Profit: ${bdt(monthlyProfit * 1.05)}\n` +
                    `• Est. Orders: ~${Math.round(thisMonthContacts.length * 1.05)}\n\n` +
                    `⚠️ *Predictions are estimates based on current trends. Actual results may vary.*`,
                type: 'insight',
                suggestions: ['How to increase growth?', 'Compare with last month', 'Set revenue target'],
            };
        }

        // Reports
        if (lower.includes('report') || lower.includes('generate') || lower.includes('export')) {
            return {
                text: `📄 **Available Reports**\n\n` +
                    `I can help you understand your data. For detailed reports, visit:\n\n` +
                    `• **Report Page** — Full analytics dashboard\n` +
                    `• **Income Statement** — Revenue & expenses\n` +
                    `• **Dashboard** — Visual charts & KPIs\n\n` +
                    `**Quick Stats:**\n` +
                    `• Total Contacts: ${totalContacts}\n` +
                    `• Revenue: ${bdt(totalRevenue)}\n` +
                    `• Profit: ${bdt(totalProfit)}\n` +
                    `• Orders Done: ${deliveredOrders.length}\n` +
                    `• Orders Pending: ${pendingOrders.length}`,
                type: 'report',
                suggestions: ['Full dashboard summary', 'Show profit details', 'Customer report'],
            };
        }

        // Compare
        if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
            return {
                text: `📊 **Comparison Analysis**\n\n` +
                    `**Revenue vs Profit:**\n` +
                    `• Revenue: ${bdt(totalRevenue)}\n` +
                    `• Profit: ${bdt(totalProfit)}\n` +
                    `• Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%\n\n` +
                    `**Order Status:**\n` +
                    `• Completed: ${deliveredOrders.length} vs Cancelled: ${cancelledOrders.length}\n` +
                    `• Pending: ${pendingOrders.length} vs Upcoming: ${upcomingOrders.length}\n\n` +
                    `**Payments:**\n` +
                    `• Paid: ${paidOrders.length} vs Unpaid: ${unpaidOrders.length}`,
                type: 'insight',
                suggestions: ['Compare months', 'Compare products', 'Revenue trend'],
            };
        }

        // Default
        return {
            text: `🤖 **Jahan AI Assistant**\n\nI understand your business data! Here's a quick overview:\n\n` +
                `**Revenue:** ${bdt(totalRevenue)}\n` +
                `**Profit:** ${bdt(totalProfit)}\n` +
                `**Orders:** ${totalContacts}\n` +
                `**Completion Rate:** ${completionRate}%\n\n` +
                `Try asking me about:\n` +
                `• Revenue, profit, or expenses\n` +
                `• Products and inventory\n` +
                `• Customer insights\n` +
                `• Facebook Ads performance\n` +
                `• Business health score\n` +
                `• Recommendations\n` +
                `• Predictions and forecasts`,
            type: 'insight',
            suggestions: ['Dashboard summary', 'Show recommendations', 'Business health'],
        };
    };

    const handleSend = (text?: string) => {
        const query = text || inputValue.trim();
        if (!query) return;

        const userMessage: Message = {
            id: Date.now(),
            text: query,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setShowSuggestions([]);

        setTimeout(() => {
            const { text: responseText, type, suggestions } = analyzeQuery(query);
            const botMessage: Message = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'bot',
                timestamp: new Date(),
                type,
            };
            setMessages((prev) => [...prev, botMessage]);
            setShowSuggestions(suggestions);
            setIsTyping(false);
        }, 800 + Math.random() * 600);
    };

    const copyMessage = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/`(.*?)`/g, '<code class="rounded bg-slate-700/50 px-1.5 py-0.5 text-teal-300 text-xs">$1</code>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="mb-4 flex w-[400px] flex-col overflow-hidden rounded-[20px] border border-slate-700/50 bg-slate-900/95 shadow-2xl shadow-slate-900/80 backdrop-blur-xl sm:w-[420px]"
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden border-b border-slate-700/50 bg-gradient-to-r from-teal-600 to-cyan-600 p-5">
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                        <Brain size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Jahan AI</h2>
                                        <p className="text-xs text-white/70">Business Intelligence</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setMessages([]); setShowSuggestions([]); }}
                                        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                        title="New conversation"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '440px', minHeight: '440px' }}>
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center py-4 text-center"
                                >
                                    <div className="relative mb-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
                                            <Sparkles size={32} className="text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                        </div>
                                    </div>
                                    <h3 className="mb-1 text-lg font-bold text-white">Welcome to Jahan AI</h3>
                                    <p className="mb-6 max-w-[280px] text-sm leading-relaxed text-slate-400">
                                        Your intelligent business assistant. I analyze your CRM data and provide smart insights.
                                    </p>
                                    <div className="grid w-full grid-cols-2 gap-2">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.label}
                                                onClick={() => handleSend(action.query)}
                                                className="group flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-left transition-all hover:border-slate-600 hover:bg-slate-700/50"
                                            >
                                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}>
                                                    <action.icon size={14} className="text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`relative max-w-[85%] ${message.sender === 'user' ? '' : 'w-full'}`}>
                                        {message.sender === 'bot' && (
                                            <div className="mb-1.5 flex items-center gap-1.5">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-cyan-500">
                                                    <Bot size={11} className="text-white" />
                                                </div>
                                                <span className="text-[11px] font-medium text-teal-400">Jahan AI</span>
                                                {message.type && (
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                        message.type === 'insight' ? 'bg-blue-500/20 text-blue-400' :
                                                        message.type === 'recommendation' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        message.type === 'report' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-slate-700 text-slate-400'
                                                    }`}>
                                                        {message.type}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                                message.sender === 'user'
                                                    ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white'
                                                    : 'border border-slate-700/50 bg-slate-800/80 text-slate-300'
                                            }`}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
                                        </div>
                                        {message.sender === 'bot' && (
                                            <div className="mt-1.5 flex items-center gap-1">
                                                <button
                                                    onClick={() => copyMessage(message.id, message.text)}
                                                    className="rounded-md p-1 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-400"
                                                    title="Copy"
                                                >
                                                    {copiedId === message.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 flex items-start gap-2"
                                >
                                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-cyan-500">
                                        <Bot size={11} className="text-white" />
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/80 px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '0ms' }} />
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '150ms' }} />
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {showSuggestions.length > 0 && !isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-3 flex flex-wrap gap-1.5"
                                >
                                    {showSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-[11px] text-slate-400 transition-all hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-300"
                                        >
                                            <ChevronRight size={10} />
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-slate-700/50 bg-slate-900/80 p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="Ask about your business..."
                                    className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <p className="mt-2 text-center text-[10px] text-slate-600">
                                Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-500">Ctrl+K</kbd> to toggle
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 transition-shadow hover:shadow-teal-500/50"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Sparkles size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
