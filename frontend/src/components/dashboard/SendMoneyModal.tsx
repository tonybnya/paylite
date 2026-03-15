import { useState, useEffect } from "react"
import { useForm, FormProvider, FieldValues } from "react-hook-form"
import { toast } from "sonner"
import { ArrowRightIcon, SearchIcon, Loader2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { transactionService } from "@/services/transaction.service"
import { SearchUser } from "@/types/transaction"

interface SendMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  currentBalance?: number
}

export function SendMoneyModal({ open, onOpenChange, onSuccess, currentBalance }: SendMoneyModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<SearchUser | null>(null)

  const methods = useForm<FieldValues>({
    mode: "all",
    defaultValues: {
      recipientId: "",
      amount: "", // empty string is better for required validation
    },
  })

  // Explicitly destructure to ensure correct typings
  const { register, handleSubmit, formState: { errors, isValid }, setValue, setError, reset, clearErrors } = methods;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true)
        try {
          const results = await transactionService.searchUsers(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const onSubmit = async (data: FieldValues) => {
    const amount = parseFloat(data.amount);
    const recipientId = data.recipientId;

    if (!recipientId) {
      setError("recipientId", { message: "Please select a recipient" });
      return;
    }

    if (currentBalance !== undefined && amount > currentBalance) {
      setError("amount", { message: "Insufficient balance" })
      return
    }

    setIsSubmitting(true)
    try {
      await transactionService.transfer({
        to_user_id: recipientId,
        amount: amount,
      })
      toast.success(`Successfully sent $${amount} to ${selectedRecipient?.username}`)
      onOpenChange(false)
      reset()
      setSelectedRecipient(null)
      setSearchQuery("")
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Transfer error:", error)
      toast.error(error.response?.data?.error || "Failed to complete transfer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Send Money</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Search for a recipient and enter the amount you'd like to send.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipient Search Section */}
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-zinc-700"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2Icon className="size-4 animate-spin text-zinc-500" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && !selectedRecipient && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedRecipient(user)
                      setValue("recipientId", user.id, { shouldValidate: true })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                  >
                    <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {user.firstname[0]}{user.lastname[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.firstname} {user.lastname}</p>
                      <p className="text-xs text-zinc-500">@{user.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedRecipient && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-emerald-500/20 shadow-[0_0_15px_-5px_oklch(0.696_0.17_162.48/0.1)]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500 border border-emerald-500/20">
                    {selectedRecipient.firstname[0]}{selectedRecipient.lastname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedRecipient.firstname} {selectedRecipient.lastname}</p>
                    <p className="text-xs text-zinc-500">@{selectedRecipient.username}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="xs" 
                  onClick={() => {
                    setSelectedRecipient(null)
                    setValue("recipientId", "", { shouldValidate: true })
                  }}
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-7"
                >
                  Change
                </Button>
              </div>
            )}
            {errors.recipientId && <p className="text-xs text-rose-500">{String(errors.recipientId.message)}</p>}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Amount to send</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    {...register("amount", {
                      validate: (val) => {
                        const strVal = String(val).trim();
                        if (!strVal) return "Amount is required"
                        
                        // Regex: optional decimal, positive only
                        if (!/^\d*\.?\d+$/.test(strVal)) return "Invalid amount"
                        
                        const num = parseFloat(strVal);
                        if (num <= 0) return "Amount must be positive"
                        return true
                      }
                    })}
                    className="pl-7 h-12 text-lg font-bold bg-zinc-900 border-zinc-800 focus:ring-zinc-700"
                  />
                </div>
                {currentBalance !== undefined && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Available Balance: <span className="text-zinc-300 font-medium">${currentBalance.toFixed(2)}</span>
                  </p>
                )}
                {errors.amount && <p className="text-xs text-rose-500">{String(errors.amount.message)}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedRecipient || !isValid}
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-5 animate-spin" />
                ) : (
                  <>
                    Send Money
                    <ArrowRightIcon className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
