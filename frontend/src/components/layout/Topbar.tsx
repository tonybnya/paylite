import { Bell, Search, Menu } from "lucide-react"

export default function Topbar() {
    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Search className="h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        className="bg-transparent border-none outline-none text-sm w-48 text-foreground placeholder:text-muted-foreground/70"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-foreground border border-background"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-medium leading-none">John Doe</span>
                        <span className="text-xs text-muted-foreground mt-1">Admin</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        JD
                    </div>
                </div>
            </div>
        </header>
    )
}
