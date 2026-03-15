import { useState } from "react"
import { Wallet } from "@/types/wallet"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Wallet as WalletIcon, SendIcon, DownloadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SendMoneyModal } from "./SendMoneyModal"
import { ReceiveMoneyModal } from "./ReceiveMoneyModal"

interface WalletCardProps {
  wallet: Wallet
  className?: string
  onRefresh?: () => void
}

export function WalletCard({ wallet, className, onRefresh }: WalletCardProps) {
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)

  // Format balance with currency
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: wallet.currency || "USD",
  }).format(wallet.balance)

  return (
    <>
      <Card className={cn("relative overflow-hidden border-none bg-zinc-950 text-white shadow-2xl h-full flex flex-col", className)}>
        {/* Subtle Gradient Overlay for Premium Look */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-zinc-400">Total Balance</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Available Funds</CardDescription>
          </div>
          <div className="p-2 bg-zinc-900 rounded-lg border border-white/10">
            <WalletIcon size={20} className="text-white" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="mt-4 flex flex-col gap-1">
            <div className="text-3xl font-bold tracking-tight geist-sans">
              {formattedBalance}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Wallet
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Currency</p>
              <p className="text-sm font-medium">{wallet.currency}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Status</p>
              <p className="text-sm font-medium">Verified</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-white/5 border-t border-white/5 p-4 grid grid-cols-2 gap-3 mt-auto">
          <Button 
            className="bg-white text-black hover:bg-zinc-200 font-bold"
            onClick={() => setIsSendOpen(true)}
          >
            <SendIcon className="mr-2 size-4" />
            Send
          </Button>
          <Button 
            variant="outline"
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
            onClick={() => setIsReceiveOpen(true)}
          >
            <DownloadIcon className="mr-2 size-4 text-emerald-500" />
            Receive
          </Button>
        </CardFooter>
      </Card>

      <SendMoneyModal 
        open={isSendOpen} 
        onOpenChange={setIsSendOpen}
        currentBalance={wallet.balance}
        onSuccess={onRefresh}
      />

      <ReceiveMoneyModal
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
      />
    </>
  )
}

export function WalletSkeleton() {
  return (
    <Card className="border-none bg-zinc-950 shadow-2xl animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-zinc-900 rounded" />
        <div className="size-8 bg-zinc-900 rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="mt-4 h-10 w-32 bg-zinc-900 rounded" />
        <div className="mt-2 h-3 w-20 bg-zinc-900 rounded" />
        <div className="mt-8 h-12 w-full bg-zinc-900 rounded" />
      </CardContent>
    </Card>
  )
}
