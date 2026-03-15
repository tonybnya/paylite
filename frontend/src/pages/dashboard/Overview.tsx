import { useEffect, useState } from "react"
import { walletService } from "@/services/wallet.service"
import { transactionService } from "@/services/transaction.service"
import { Wallet } from "@/types/wallet"
import { Transaction } from "@/types/transaction"
import { WalletCard, WalletSkeleton } from "@/components/dashboard/WalletCard"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  BarChart3Icon, 
  HistoryIcon,
  ChevronRightIcon
} from "lucide-react"

export default function Overview() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [walletRes, txRes] = await Promise.all([
                walletService.getMyWallet(),
                transactionService.getMyTransactions({ per_page: 3 })
            ])
            setWallet(walletRes.data)
            setRecentTransactions(txRes.transactions || [])
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
            toast.error("Failed to load dashboard overview")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">
                    Welcome back, <span className="text-foreground font-medium">{user?.firstname || "User"}</span>. Here's what's happening today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Wallet Card - Navigates to Wallet Page (except on buttons) */}
                <div 
                    onClick={() => navigate("/dashboard/wallet")}
                    className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                    {isLoading ? (
                        <WalletSkeleton />
                    ) : wallet ? (
                        <div onClick={(e) => e.stopPropagation()}>
                            <WalletCard wallet={wallet} onRefresh={fetchData} />
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-8 border border-dashed border-border rounded-xl bg-card">
                            <p className="text-muted-foreground text-sm font-medium">Failed to load wallet data.</p>
                        </div>
                    )}
                </div>

                {/* Transactions Card - Informative Preview */}
                <div 
                    onClick={() => navigate("/dashboard/transactions")}
                    className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-zinc-900 border border-border flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                                <HistoryIcon className="size-5 text-zinc-400 group-hover:text-zinc-100" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Recent activity</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="flex-1 space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse opacity-50">
                                    <div className="size-8 rounded-lg bg-muted" />
                                    <div className="flex-1 h-3 bg-muted rounded" />
                                </div>
                            ))
                        ) : recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between group/tx">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                                            tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                            : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                                                ? <ArrowDownLeftIcon className="size-4" /> 
                                                : <ArrowUpRightIcon className="size-4" />
                                            }
                                        </div>
                                        <span className="text-xs font-medium text-foreground">
                                            #{tx.id.split('-')[0]}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold ${
                                        tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                                        ? 'text-emerald-500' 
                                        : 'text-red-500'
                                    }`}>
                                        {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? '+' : '-'}${Math.abs(tx.amount).toFixed(0)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-4 opacity-50">
                                <HistoryIcon className="size-8 mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-tighter">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analytics Card - Informative Preview */}
                <div 
                    onClick={() => navigate("/dashboard/analytics")}
                    className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-zinc-900 border border-border flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                                <BarChart3Icon className="size-5 text-zinc-400 group-hover:text-zinc-100" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Analytics</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Spending stats</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weekly Spent</p>
                                <p className="text-lg font-bold text-foreground">FCFA 45k</p>
                            </div>
                            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[65%]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/10">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Savings</p>
                                <p className="text-sm font-bold text-emerald-500">+12%</p>
                            </div>
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/10">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Growth</p>
                                <p className="text-sm font-bold text-blue-500">+8.5%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
