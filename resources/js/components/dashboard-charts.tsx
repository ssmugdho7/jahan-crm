import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#14b8a6', '#f43f5e', '#38bdf8', '#eab308', '#8b5cf6'];

function ChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
            <h3 className="mb-4 text-sm font-semibold text-slate-300">
                {title}
            </h3>
            {children}
        </div>
    );
}

const tooltipStyle = {
    contentStyle: {
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#f1f5f9',
    },
};

export function ContactsStatusChart({
    contactsByStatus,
}: {
    contactsByStatus: Record<string, number>;
}) {
    const data = Object.entries(contactsByStatus).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <ChartCard title="Contacts by Status">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export function SalesOverviewChart({
    profitByMonth,
    monthlyContacts,
    expensesByMonth,
}: {
    profitByMonth: Record<string, number>;
    monthlyContacts: Record<string, number>;
    expensesByMonth: Record<string, number>;
}) {
    const totalProfit = Object.values(profitByMonth).reduce((a, b) => a + Number(b), 0);
    const totalContacts = Object.values(monthlyContacts).reduce((a, b) => a + Number(b), 0);
    const totalExpenses = Object.values(expensesByMonth).reduce((a, b) => a + Number(b), 0);

    const data = [
        { name: 'Profit', value: totalProfit },
        { name: 'Contacts', value: totalContacts },
        { name: 'Expenses', value: totalExpenses },
    ].filter((item) => item.value > 0);

    return (
        <ChartCard title="Sales Overview">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}
