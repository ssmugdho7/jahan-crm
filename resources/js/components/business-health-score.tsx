import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Target,
    DollarSign,
    Megaphone,
    Users,
    Package,
    ShoppingCart,
    CreditCard,
    Zap,
    Brain,
    Lightbulb,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

type Contact = {
    id: number;
    order_status: string;
    paid_status: string;
    profit: string | null;
    total_order_amount: string | null;
    product_name: string | null;
    order_date: string | null;
    created_at: string;
};

type HealthScoreProps = {
    contacts: Contact[];
    stats: {
        contacts: number;
        totalProfit: number;
        totalIncome: number;
        netProfit: number;
    };
};

type Metric = {
    label: string;
    icon: React.ElementType;
    value: number;
    weight: number;
    color: string;
    trend: number;
};

const getScoreLabel = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', emoji: '🟢' };
    if (score >= 75) return { text: 'Very Good', color: 'text-blue-400', bg: 'bg-blue-500/20', emoji: '🔵' };
    if (score >= 60) return { text: 'Good', color: 'text-amber-400', bg: 'bg-amber-500/20', emoji: '🟡' };
    if (score >= 40) return { text: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-500/20', emoji: '🟠' };
    return { text: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20', emoji: '🔴' };
};

const getMetricColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-amber-500';
    return 'bg-red-500';
};

const getMetricTextColor = (value: number) => {
    if (value >= 80) return 'text-emerald-400';
    if (value >= 60) return 'text-blue-400';
    if (value >= 40) return 'text-amber-400';
    return 'text-red-400';
};

export default function BusinessHealthScore({ contacts, stats }: HealthScoreProps) {
    const metrics = useMemo<Metric[]>(() => {
        const totalOrders = contacts.length;
        const completedOrders = contacts.filter((c) => c.order_status === 'Done').length;
        const paidOrders = contacts.filter((c) => c.paid_status === 'Paid').length;
        const uniqueProducts = new Set(contacts.filter((c) => c.product_name).map((c) => c.product_name)).size;

        // Revenue Growth (based on profit margin)
        const profitMargin = stats.totalIncome > 0 ? (stats.netProfit / stats.totalIncome) * 100 : 0;
        const revenueGrowth = Math.min(Math.max(profitMargin + 30, 0), 100);

        // Profit Margin
        const profitMarginScore = Math.min(Math.max(profitMargin + 40, 0), 100);

        // Facebook ROAS (simulated based on profit)
        const roas = stats.totalIncome > 0 ? (stats.netProfit / stats.totalIncome) * 5 * 100 : 50;
        const facebookScore = Math.min(Math.max(roas, 0), 100);

        // Expense Control
        const expenseRatio = stats.totalIncome > 0 ? ((stats.totalIncome - stats.netProfit) / stats.totalIncome) * 100 : 50;
        const expenseControl = Math.min(Math.max(100 - expenseRatio + 20, 0), 100);

        // Customer Growth
        const customerScore = Math.min(stats.contacts * 8, 100);

        // Order Completion
        const orderCompletion = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        // Inventory Health (based on unique products)
        const inventoryScore = Math.min(uniqueProducts * 12, 100);

        // Payment Collection
        const paymentCollection = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

        return [
            { label: 'Revenue Growth', icon: TrendingUp, value: Math.round(revenueGrowth), weight: 25, color: '#3B82F6', trend: revenueGrowth > 50 ? 12 : -5 },
            { label: 'Profit Margin', icon: DollarSign, value: Math.round(profitMarginScore), weight: 20, color: '#10B981', trend: profitMarginScore > 50 ? 8 : -3 },
            { label: 'Facebook Ads', icon: Megaphone, value: Math.round(facebookScore), weight: 15, color: '#F97316', trend: facebookScore > 50 ? 15 : -8 },
            { label: 'Customer Growth', icon: Users, value: Math.round(customerScore), weight: 10, color: '#8B5CF6', trend: customerScore > 50 ? 10 : -2 },
            { label: 'Order Completion', icon: ShoppingCart, value: Math.round(orderCompletion), weight: 10, color: '#06B6D4', trend: orderCompletion > 70 ? 5 : -10 },
            { label: 'Payment Collection', icon: CreditCard, value: Math.round(paymentCollection), weight: 5, color: '#EC4899', trend: paymentCollection > 70 ? 7 : -4 },
            { label: 'Inventory Status', icon: Package, value: Math.round(inventoryScore), weight: 5, color: '#EAB308', trend: inventoryScore > 50 ? 3 : -1 },
            { label: 'Expense Control', icon: Zap, value: Math.round(expenseControl), weight: 10, color: '#14B8A6', trend: expenseControl > 50 ? 6 : -6 },
        ];
    }, [contacts, stats]);

    const healthScore = useMemo(() => {
        const weightedSum = metrics.reduce((sum, m) => sum + (m.value * m.weight) / 100, 0);
        return Math.round(weightedSum);
    }, [metrics]);

    const scoreInfo = getScoreLabel(healthScore);

    const insights = useMemo(() => {
        const items = [];
        if (healthScore >= 80) items.push('Your business is performing excellently this period.');
        if (healthScore >= 60 && healthScore < 80) items.push('Your business is doing well with room for improvement.');
        if (healthScore < 60) items.push('Your business needs attention in several areas.');

        const profitMargin = stats.totalIncome > 0 ? (stats.netProfit / stats.totalIncome) * 100 : 0;
        if (profitMargin > 20) items.push(`Strong profit margin at ${profitMargin.toFixed(1)}%. Keep it up.`);
        if (profitMargin < 10) items.push('Profit margin is low. Consider cost optimization.');

        const completedOrders = contacts.filter((c) => c.order_status === 'Done').length;
        const totalOrders = contacts.length;
        if (totalOrders > 0) {
            const completionRate = (completedOrders / totalOrders) * 100;
            if (completionRate > 80) items.push(`Order completion rate is strong at ${completionRate.toFixed(0)}%.`);
            if (completionRate < 50) items.push('Order completion rate needs improvement.');
        }

        const paidOrders = contacts.filter((c) => c.paid_status === 'Paid').length;
        if (totalOrders > 0) {
            const collectionRate = (paidOrders / totalOrders) * 100;
            if (collectionRate < 60) items.push('Payment collection rate is low. Follow up on pending payments.');
        }

        return items.slice(0, 3);
    }, [healthScore, stats, contacts]);

    const recommendations = useMemo(() => {
        const items = [];
        const paidOrders = contacts.filter((c) => c.paid_status === 'Paid').length;
        const totalOrders = contacts.length;
        if (totalOrders > 0 && (paidOrders / totalOrders) < 0.7) {
            items.push({ icon: CreditCard, text: 'Follow up with customers who have overdue payments.' });
        }
        items.push({ icon: Megaphone, text: 'Review Facebook Ads campaigns for optimization opportunities.' });
        items.push({ icon: TrendingUp, text: 'Focus on high-margin products to improve profitability.' });
        if (healthScore < 70) {
            items.push({ icon: Target, text: 'Set clear monthly targets for revenue and orders.' });
        }
        return items.slice(0, 3);
    }, [contacts, healthScore]);

    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 hover:scale-[1.02]"
        >
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5">
                    <Target size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Business Health</h3>
                    <p className="text-xs text-slate-400">Overall performance score</p>
                </div>
            </div>

            {/* Score Circle */}
            <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#1E293B" strokeWidth="10" />
                        <motion.circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke={healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#3B82F6' : healthScore >= 40 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-4xl font-bold text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            {healthScore}%
                        </motion.span>
                        <span className={`text-xs font-medium ${scoreInfo.color}`}>{scoreInfo.text}</span>
                    </div>
                </div>
            </div>

            {/* Trend */}
            <div className="mb-6 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1">
                    <ArrowUpRight size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">+6%</span>
                </div>
                <span className="text-xs text-slate-500">vs last month</span>
            </div>

            {/* Metrics */}
            <div className="mb-6 space-y-3">
                {metrics.slice(0, 6).map((metric, i) => (
                    <div key={metric.label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <metric.icon size={14} className="text-slate-400" />
                                <span className="text-slate-400">{metric.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{metric.value}%</span>
                                <span className={`flex items-center text-[10px] ${metric.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {metric.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${getMetricColor(metric.value)}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insights */}
            <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Brain size={14} className="text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">AI Insights</span>
                </div>
                <div className="space-y-2">
                    {insights.map((insight, i) => (
                        <p key={i} className="text-xs leading-relaxed text-slate-300">{insight}</p>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Recommendations</span>
                </div>
                <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <rec.icon size={12} className="mt-0.5 text-slate-500" />
                            <p className="text-xs text-slate-400">{rec.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
