import { useEffect, useState } from "react"
import { walletService } from "@/services/wallet.service"
import { Wallet } from "@/types/wallet"
import { WalletCard, WalletSkeleton } from "@/components/dashboard/WalletCard"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

export default function UserDashboard() {
    const { user } = useAuth()
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchWallet = async () => {
        try {
            setIsLoading(true)
            const response = await walletService.getMyWallet()
            setWallet(response.data)
        } catch (error) {
            console.error("Failed to fetch wallet:", error)
            toast.error("Failed to load wallet balance")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWallet()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-zinc-400">
                    Welcome back, <span className="text-black font-medium">{user?.firstname || "User"}</span>. Here's what's happening with your account.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <WalletSkeleton />
                ) : wallet ? (
                    <WalletCard wallet={wallet} onRefresh={fetchWallet} />
                ) : (
                    <div className="flex items-center justify-center p-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                        <p className="text-zinc-500 text-sm">Failed to load wallet data.</p>
                    </div>
                )}

                {/* Placeholders for future Phase 3 features */}
                <div className="hidden lg:block p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 flex flex-col justify-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Upcoming</p>
                    <h3 className="text-sm font-medium text-zinc-300">Transaction History</h3>
                    <p className="text-xs text-zinc-600 mt-1">Detailed list and export coming soon.</p>
                </div>
                
                <div className="hidden md:block p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 flex flex-col justify-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Upcoming</p>
                    <h3 className="text-sm font-medium text-zinc-300">Analytics</h3>
                    <p className="text-xs text-zinc-600 mt-1">Spending charts and revenue tracks.</p>
                </div>
            </div>
        </div>
    )
}
