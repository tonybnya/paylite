import { Link } from "react-router-dom"

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tighter">Paylite</h1>
                    <p className="text-zinc-400 text-lg">Fintech Dashboard Platform</p>
                </div>
                
                <div className="pt-8 flex flex-wrap gap-4 justify-center">
                    <Link to="/auth/login" className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
                        Login
                    </Link>
                    <Link to="/auth/register" className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-white font-semibold rounded-full hover:bg-zinc-800 transition-colors">
                        Register
                    </Link>
                </div>
                
                <div className="pt-12 text-zinc-600 text-sm flex gap-4 justify-center">
                    <Link to="/dashboard" className="hover:text-zinc-400">User Dashboard</Link>
                    <span>&bull;</span>
                    <Link to="/admin" className="hover:text-zinc-400">Admin Dashboard</Link>
                </div>
            </div>
        </div>
    )
}
