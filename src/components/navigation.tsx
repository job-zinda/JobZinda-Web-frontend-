"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Briefcase, LayoutDashboard, UserCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Freelancers", href: "/freelancers", icon: Users },
  { name: "Subscription", href: "/subscription", icon: Briefcase },
  { name: "Profile", href: "/profile", icon: UserCircle },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 bg-background/80 backdrop-blur-[24px] border border-border/40 p-2 rounded-full shadow-[0_8px_32px_-8px_rgba(114,48,230,0.12)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative p-3 rounded-full flex items-center justify-center transition-all duration-300",
                isActive 
                  ? "text-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(131,71,248,0.2)]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 relative z-10" />
              {/* Tooltip to show name on hover but space is limited, keeping it clean */}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
