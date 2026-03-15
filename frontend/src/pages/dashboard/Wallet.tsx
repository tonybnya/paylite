import { useEffect, useState } from "react"
import { walletService } from "@/services/wallet.service"
import { Wallet } from "@/types/wallet"
import { WalletCard, WalletSkeleton } from "@/components/dashboard/WalletCard"
import { toast } from "sonner"
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ZapIcon, 
  Settings2Icon,
  RefreshCwIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchWallet = async () => {
        try {
            setIsLoading(true)
            const response = await walletService.getMyWallet()
            setWallet(response.data)
        } catch (error) {
            console.error("Failed to fetch wallet:", error)
            toast.error("Failed to load wallet data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWallet()
    }, [])

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
                    <p className="text-muted-foreground">Manage your digital assets and account settings.</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchWallet}
                    disabled={isLoading}
                    className="h-9 px-4 cursor-pointer"
                >
                    <RefreshCwIcon className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Primary Balance Section */}
                    {isLoading ? (
                        <div className="max-w-md">
                            <WalletSkeleton />
                        </div>
                    ) : wallet ? (
                        <div className="max-w-md">
                            <WalletCard wallet={wallet} onRefresh={fetchWallet} />
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-border rounded-xl bg-card flex flex-col items-center justify-center text-center">
                            <p className="text-muted-foreground mb-4">Failed to load wallet.</p>
                            <Button variant="secondary" onClick={fetchWallet}>Try Again</Button>
                        </div>
                    )}

                    {/* Features/Limits Section */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
                            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ZapIcon className="size-5 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Instant Transfers</h3>
                            <p className="text-sm text-muted-foreground">Move funds between your wallets instantly with zero fees.</p>
                        </div>
                        
                        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
                            <div className="size-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheckIcon className="size-5 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Security Standards</h3>
                            <p className="text-sm text-muted-foreground">Your funds are protected by bank-grade encryption and 2FA.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar/Details Area */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card Details Card */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <CreditCardIcon className="size-4 text-muted-foreground" />
                                Virtual Card
                            </h3>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                                <Settings2Icon className="size-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 border border-border flex flex-col items-center justify-center py-10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-500/5 to-transparent pointer-events-none" />
                                <CreditCardIcon className="size-12 text-muted-foreground/20 group-hover:scale-105 transition-transform" />
                                <p className="text-xs text-muted-foreground mt-4 font-medium italic">Virtual card coming soon</p>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Monthly Limit</span>
                                    <span className="font-medium text-foreground">FCFA 500,000</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[15%]" />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>Spent: FCFA 75,000</span>
                                    <span>Remaining: FCFA 425,000</span>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full border-border bg-background hover:bg-muted text-foreground font-semibold">
                            Upgrade Account
                        </Button>
                    </div>

                    {/* Quick Settings */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
                        <h3 className="font-semibold text-foreground">Quick Settings</h3>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-muted font-medium">
                                <Settings2Icon className="mr-3 size-4" />
                                Security Settings
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-muted font-medium">
                                <CreditCardIcon className="mr-3 size-4" />
                                Manage Cards
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
