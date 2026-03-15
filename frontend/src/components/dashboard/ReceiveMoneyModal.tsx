import { useState } from "react"
import { toast } from "sonner"
import { CopyIcon, CheckIcon, QrCodeIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface ReceiveMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveMoneyModal({ open, onOpenChange }: ReceiveMoneyModalProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const walletAddress = user?.email || user?.username || "N/A"

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    toast.success("Wallet address copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Receive Money</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Share your wallet address or QR code to receive funds.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-8 py-6">
          {/* Mock QR Code Section */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-zinc-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative size-48 rounded-2xl bg-white p-4 shadow-2xl flex items-center justify-center overflow-hidden">
               {/* Using a rich-looking SVG/Icon combo for "Mock QR" */}
               <div className="absolute inset-0 bg-zinc-100/50" />
               <QrCodeIcon className="size-full text-zinc-950 relative z-10" />
               <div className="absolute inset-0 flex flex-wrap gap-1 p-4 opacity-10 select-none pointer-events-none">
                 {Array.from({ length: 144 }).map((_, i) => (
                   <div key={i} className={`size-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                 ))}
               </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
                Your Wallet Address
              </label>
              <div className="flex items-center gap-2 p-1 pl-4 rounded-xl bg-zinc-900 border border-zinc-800 group transition-all hover:border-zinc-700">
                <span className="text-sm font-medium text-zinc-300 truncate flex-1">
                  {walletAddress}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="size-10 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckIcon className="size-4 text-emerald-500" /> : <CopyIcon className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
                <CheckIcon className="size-3 text-emerald-500" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Transfers made to this address will be credited to your wallet instantly.
              </p>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 font-bold transition-all active:scale-[0.98]"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
