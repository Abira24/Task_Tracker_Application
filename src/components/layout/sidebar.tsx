"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Package,
  BarChart3,
  Settings,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", href: "/appointments", icon: Calendar },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Services", href: "/services", icon: Scissors },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, badge: "5" },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    const { logout } = await import("@/lib/actions/auth");
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-accent shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg leading-tight">
              Glamour
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              Salon Suite
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/15 text-white shadow-lg shadow-purple-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-violet-300" : ""
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl",
            collapsed ? "justify-center" : ""
          )}
        >
          <Avatar className="h-9 w-9 border-2 border-white/20">
            <AvatarFallback className="bg-violet-600 text-white text-xs">
              JD
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Jane Doe
              </p>
              <p className="text-xs text-white/50 truncate">Admin</p>
            </div>
          )}
          {!collapsed && (
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-white/50 hover:text-white hover:bg-white/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-sidebar-bg text-white hover:bg-sidebar-accent"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar-bg transform transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-sidebar-bg border-r border-white/10 sidebar-transition sticky top-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-bg border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-sidebar-accent transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </>
  );
}
