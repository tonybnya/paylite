import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, ShieldAlert, ArrowLeftRight, Wallet, PieChart, Users } from "lucide-react"

export default function Sidebar() {
    const location = useLocation()

    const isActive = (path: string) => location.pathname.startsWith(path)

    const mainNav = [
        { title: "Overview", icon: LayoutDashboard, href: "/dashboard" },
        { title: "Transactions", icon: ArrowLeftRight, href: "/dashboard/transactions" },
        { title: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
        { title: "Analytics", icon: PieChart, href: "/dashboard/analytics" },
    ]

    const adminNav = [
        { title: "Admin Portal", icon: ShieldAlert, href: "/admin" },
        { title: "User Management", icon: Users, href: "/admin/users" },
    ]

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link to="/" className="text-xl font-bold tracking-tight text-foreground hover:text-zinc-300 transition-colors">
                    Paylite
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-6">
                    <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</h2>
                    <nav className="space-y-1">
                        {mainNav.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(item.href) && item.href !== "/dashboard" || (item.href === "/dashboard" && location.pathname === "/dashboard")
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="px-4">
                    <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administration</h2>
                    <nav className="space-y-1">
                        {adminNav.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(item.href) && item.href !== "/admin" || (item.href === "/admin" && location.pathname === "/admin")
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-border mt-auto">
                <Link to="/auth/login" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors">
                    Sign Out
                </Link>
            </div>
        </aside>
    )
}
