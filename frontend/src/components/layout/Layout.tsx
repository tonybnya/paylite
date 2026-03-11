import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 relative overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto w-full">
                    {/* The max-w-7xl and padding help create a "container" feel on large screens, while staying full-width on mobile */}
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
