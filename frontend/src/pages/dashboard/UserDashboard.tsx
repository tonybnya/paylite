import { Link } from "react-router-dom"

export default function UserDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
            <p className="text-zinc-400 mb-8">Dashboard Phase 3 goes here.</p>
            <Link to="/" className="text-sm underline hover:text-zinc-300">Back to Home</Link>
        </div>
    )
}
