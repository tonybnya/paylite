import { useEffect, useState, useMemo } from "react"
import { transactionService } from "@/services/transaction.service"
import { Transaction } from "@/types/transaction"
import { toast } from "sonner"
import { 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  SearchIcon, 
  FilterIcon,
  Loader2Icon,
  ArrowUpDown,
  DownloadIcon,
  HistoryIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterType, setFilterType] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    const fetchTransactions = async () => {
        try {
            setIsLoading(true)
            const response = await transactionService.getMyTransactions({
                type: filterType === "all" ? undefined : filterType
            })
            // response.data.transactions based on my backend routes check
            setTransactions(response.transactions || [])
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
            toast.error("Failed to load transaction history")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [filterType])

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                tx.type.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        })
    }, [transactions, searchQuery])

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "DEPOSIT":
            case "TRANSFER_IN":
                return <ArrowDownLeftIcon className="size-4 text-emerald-500" />
            case "WITHDRAWAL":
            case "TRANSFER_OUT":
                return <ArrowUpRightIcon className="size-4 text-red-500" />
            default:
                return <ArrowUpDown className="size-4 text-zinc-500" />
        }
    }

    const formatCurrency = (amount: number, type: string) => {
        const isPositive = type === "DEPOSIT" || type === "TRANSFER_IN";
        return (
            <span className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? '+' : '-'}${Math.abs(amount).toFixed(2)}
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString))
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">View and manage your transaction history.</p>
                </div>
                <Button variant="outline" className="h-10 px-4 cursor-pointer">
                    <DownloadIcon className="mr-2 size-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by ID or type..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 w-full bg-background text-foreground border-border focus-visible:ring-ring"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px] h-10 bg-background text-foreground border-border">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="DEPOSIT">Deposit</SelectItem>
                            <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                            <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                            <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6 text-center">
                                            <div className="h-4 bg-muted rounded-full w-3/4 mx-auto opacity-50"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <HistoryIcon className="size-10 opacity-20" />
                                            <p className="text-sm">No transactions found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 rounded-lg flex items-center justify-center ${
                                                    tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                                    : 'bg-muted border border-border'
                                                }`}>
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">#{tx.id.split('-')[0]}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border inline-block uppercase tracking-wider">
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(tx.amount, tx.type)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-tighter">
                                                    Completed
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {!isLoading && filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-2 font-medium">
                    <p>Showing {filteredTransactions.length} of {transactions.length} transactions</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="xs" disabled className="h-8 opacity-50">Previous</Button>
                        <Button variant="outline" size="xs" disabled className="h-8 opacity-50">Next</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
