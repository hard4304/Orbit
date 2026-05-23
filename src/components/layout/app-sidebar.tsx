"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, CheckSquare, Dumbbell, LogOut, Wallet, Utensils, BookOpen, Sparkles, Bug, Send, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TelegramSettingsDialog } from "@/components/layout/telegram-settings-dialog";
import { OrbitLogo } from "@/components/ui/orbit-logo";

const navItems = [
  { title: "Home", href: "/home", icon: LayoutDashboard },
  { title: "Habits", href: "/habits", icon: CheckSquare },
  { title: "Gym", href: "/gym", icon: Dumbbell },
  { title: "Finance", href: "/finance", icon: Wallet },
  { title: "Food", href: "/food", icon: Utensils },
  { title: "Learning", href: "/learning", icon: BookOpen },
  { title: "Body Care", href: "/body-care", icon: Sparkles },
  { title: "Reports", href: "/reports", icon: Bug },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [telegramOpen, setTelegramOpen] = useState(false);

  const isAdmin = session?.user?.name === "hard4304";

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  const allNavItems = isAdmin
    ? [...navItems, { title: "Admin", href: "/admin/reports", icon: Shield }]
    : navItems;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center border-r border-sidebar-border bg-sidebar py-6">
        {/* Logo */}
        <Link href="/home" className="mb-8">
          <OrbitLogo size={32} />
        </Link>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {allNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-colors w-16 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="size-5" />
                <span className="text-[11px] font-medium leading-tight">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-xl p-2 hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-48">
            <DropdownMenuItem onClick={() => setTelegramOpen(true)}>
              <Send className="size-4 mr-2" />
              Telegram
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      <TelegramSettingsDialog open={telegramOpen} onOpenChange={setTelegramOpen} />
    </>
  );
}
