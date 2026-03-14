import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tighter">PayLite</h1>
                    <p className="text-zinc-400 text-lg">Fintech Dashboard Platform</p>
                </div>
                
                <div className="pt-8 flex flex-wrap gap-4 justify-center">
                    {user ? (
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="cursor-pointer w-full sm:w-64 h-12 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                        >
                            Go to Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate("/auth/login")}
                                className="cursor-pointer flex-1 h-12 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={() => navigate("/auth/register")}
                                className="cursor-pointer flex-1 h-12 bg-zinc-900 border border-zinc-800 text-white font-semibold hover:bg-zinc-800 transition-colors"
                            >
                                Register
                            </Button>
                        </>
                    )}
                </div>
                
                <div className="pt-12 text-zinc-600 text-sm flex gap-4 justify-center">
                    <Link to="/dashboard" className="hover:text-zinc-400">Dashboard</Link>
                    {user?.is_admin && (
                        <>
                            <span>&bull;</span>
                            <Link to="/admin" className="hover:text-zinc-400">Admin Portal</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
