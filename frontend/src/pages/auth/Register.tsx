import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function Register() {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && user) {
            navigate("/dashboard", { replace: true })
        }
    }, [user, isLoading, navigate])
    return (
        <div className="min-h-screen flex items-center justify-center relative bg-white dark:bg-zinc-950 overflow-hidden py-12 px-4">
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 dark:bg-zinc-800/30 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-300/30 dark:bg-zinc-900/40 blur-[120px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center">
                {/* Branding */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-zinc-900/10 dark:shadow-white/10">
                        <span className="text-white dark:text-zinc-900 font-bold text-2xl tracking-tighter">P</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">PayLite</h1>
                </div>

                {/* Form */}
                <RegisterForm />
            </div>
        </div>
    )
}
