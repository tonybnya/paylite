import { useEffect, useState, useMemo } from "react"
import { walletService } from "@/services/wallet.service"
import { transactionService } from "@/services/transaction.service"
import { Wallet } from "@/types/wallet"
import { Transaction } from "@/types/transaction"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon, 
  PieChartIcon, 
  BarChart3Icon,
  CalendarIcon,
  Loader2Icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"

export default function AnalyticsPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [walletRes, txRes] = await Promise.all([
                walletService.getMyWallet(),
                transactionService.getMyTransactions({ per_page: 50 }) // Fetch more for analytics
            ])
            setWallet(walletRes.data)
            setTransactions(txRes.transactions || [])
        } catch (error) {
            console.error("Failed to fetch analytics data:", error)
            toast.error("Failed to load live analytics")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // --- Data Aggregation Logic ---

    const analytics = useMemo(() => {
        if (!transactions.length) return null;

        // 1. Group by Month (Last 6 months)
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                name: format(date, 'MMM'),
                start: startOfMonth(date),
                end: endOfMonth(date),
                revenue: 0,
                spending: 0,
                savings: 0
            };
        });

        transactions.forEach(tx => {
            const txDate = parseISO(tx.created_at);
            const monthData = last6Months.find(m => isWithinInterval(txDate, { start: m.start, end: m.end }));
            
            if (monthData) {
                if (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN') {
                    monthData.revenue += tx.amount;
                } else {
                    monthData.spending += Math.abs(tx.amount);
                }
                monthData.savings = monthData.revenue - monthData.spending;
            }
        });

        // 2. Spending Breakdown by Type
        const spendingByType = [
            { name: 'Transfers Out', value: 0, color: '#ef4444' }, // red-500
            { name: 'Withdrawals', value: 0, color: '#f59e0b' },   // amber-500
        ];

        transactions.forEach(tx => {
            if (tx.type === 'TRANSFER_OUT') spendingByType[0].value += Math.abs(tx.amount);
            if (tx.type === 'WITHDRAWAL') spendingByType[1].value += Math.abs(tx.amount);
        });

        // Filter out empty categories
        const filteredSpending = spendingByType.filter(c => c.value > 0);

        // 3. Totals
        const totalRevenue = transactions.reduce((acc, tx) => 
            (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN') ? acc + tx.amount : acc, 0);
        
        const totalSpending = transactions.reduce((acc, tx) => 
            (tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT') ? acc + Math.abs(tx.amount) : acc, 0);

        const efficiency = totalRevenue > 0 ? ((totalRevenue - totalSpending) / totalRevenue) * 100 : 0;

        return {
            monthlyTrends: last6Months,
            spendingBreakdown: filteredSpending.length > 0 ? filteredSpending : [{ name: 'No Spending', value: 1, color: '#27272a' }],
            totalRevenue,
            totalSpending,
            efficiency,
            savingsTrends: last6Months.map(m => ({ month: m.name, amount: m.savings }))
        };
    }, [transactions]);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2Icon className="size-10 text-emerald-500 animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Aggregating live insights...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">Live insights gathered from your wallet and {transactions.length} transactions.</p>
                </div>
                <Button variant="outline" className="h-10 cursor-pointer" onClick={fetchData}>
                    <CalendarIcon className="mr-2 size-4" />
                    Refresh Data
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Revenue</CardTitle>
                        <DollarSignIcon className="size-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${analytics?.totalRevenue.toLocaleString() || "0"}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Total income tracked</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Spending</CardTitle>
                        <TrendingDownIcon className="size-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${analytics?.totalSpending.toLocaleString() || "0"}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Total expenses tracked</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet Balance</CardTitle>
                        <BarChart3Icon className="size-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${wallet?.balance.toLocaleString() || "0"}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{wallet?.currency || "USD"} Assets</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Savings Rate</CardTitle>
                        <PieChartIcon className="size-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {analytics?.efficiency.toFixed(1) || "0"}%
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Income retained</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Cash Flow Area Chart */}
                <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUpIcon className="size-5 text-emerald-500" />
                            <div>
                                <CardTitle className="text-lg">Live Cash Flow</CardTitle>
                                <CardDescription>Monthly comparison of income and expenses</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.monthlyTrends}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    strokeWidth={2}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="spending" 
                                    stroke="#ef4444" 
                                    fillOpacity={1} 
                                    fill="url(#colorSpend)" 
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Spending Breakdown Pie Chart */}
                <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieChartIcon className="size-5 text-blue-500" />
                            <div>
                                <CardTitle className="text-lg">Spending Mix</CardTitle>
                                <CardDescription>Expense distribution by transaction type</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.spendingBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics?.spendingBreakdown.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Bar Chart */}
            <Card className="border-border bg-card shadow-sm overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3Icon className="size-5 text-violet-500" />
                        <div>
                            <CardTitle className="text-lg">Live Monthly Savings</CardTitle>
                            <CardDescription>Net profit (Revenue - Spending) per month</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.savingsTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                            <XAxis 
                                dataKey="month" 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip 
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar 
                                dataKey="amount" 
                                fill="#8b5cf6" 
                                radius={[6, 6, 0, 0]} 
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
