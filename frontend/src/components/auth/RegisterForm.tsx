import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export function RegisterForm() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
        if (error) setError(null)
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }
        setIsLoading(true)
        setError(null)

        try {
            await register(formData)
            toast.success("Account created successfully!", {
                description: "You can now sign in with your credentials.",
            })
            navigate("/auth/login")
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed. Please check your details and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const inputClasses = "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 focus-visible:border-zinc-300 dark:focus-visible:border-zinc-700 focus-visible:ring-0 transition-all rounded-lg h-11 text-zinc-900 dark:text-zinc-100 autofill:shadow-[0_0_0_1000px_#f9f9fb_inset] dark:autofill:shadow-[0_0_0_1000px_#18181b_inset] [color-scheme:light] dark:[color-scheme:dark]"

    return (
        <Card className="w-full max-w-lg bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl">
            <CardHeader className="space-y-2 text-center pt-8">
                <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Create an account
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Join PayLite to start managing your assets
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstname">First name</Label>
                            <Input
                                id="firstname"
                                type="text"
                                placeholder="John"
                                required
                                value={formData.firstname}
                                onChange={handleInputChange}
                                className={inputClasses}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastname">Last name</Label>
                            <Input
                                id="lastname"
                                type="text"
                                placeholder="Doe"
                                required
                                value={formData.lastname}
                                onChange={handleInputChange}
                                className={inputClasses}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="johndoe"
                            required
                            value={formData.username}
                            onChange={handleInputChange}
                            className={inputClasses}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputClasses}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`${inputClasses} pr-10`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`${inputClasses} pr-10`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Sign up"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center pb-8 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <a href="/auth/login" className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300 hover:underline transition-colors">
                        Sign in
                    </a>
                </span>
            </CardFooter>
        </Card>
    )
}
