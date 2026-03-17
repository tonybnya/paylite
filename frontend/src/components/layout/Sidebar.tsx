import { Link, useLocation } from "react-router-dom"
import {LayoutDashboard, ShieldAlert, ArrowLeftRight, Wallet, PieChart, Users, LogOut, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation()
    const { user, logout } = useAuth()

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
        <>
            {/* Mobile Backdrop */}
            <div 
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground hover:text-zinc-300 transition-colors">
                        <img src="/logo.svg" alt="Logo" className="w-8 h-8 [!filter:invert(1)]" />
                        PayLite
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-6">
                        <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</h2>
                        <nav className="space-y-1">
                            {mainNav.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        (isActive(item.href) && item.href !== "/dashboard") || (item.href === "/dashboard" && location.pathname === "/dashboard")
                                            ? "bg-secondary text-secondary-foreground"
                                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {user?.is_admin && (
                        <div className="px-4">
                            <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administration</h2>
                            <nav className="space-y-1">
                                {adminNav.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            (isActive(item.href) && item.href !== "/admin") || (item.href === "/admin" && location.pathname === "/admin")
                                                ? "bg-secondary text-secondary-foreground"
                                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border mt-auto">
                    <button 
                      onClick={() => logout()}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}
