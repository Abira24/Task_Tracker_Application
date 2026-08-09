"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const allNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Appointments", href: "/appointments", icon: Calendar, adminOnly: false },
  { title: "Customers", href: "/customers", icon: Users, adminOnly: false },
  { title: "Services", href: "/services", icon: Scissors, adminOnly: true },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, adminOnly: false },
  { title: "Inventory", href: "/inventory", icon: Package, adminOnly: true },
  { title: "Reports", href: "/analytics", icon: BarChart3, adminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [salonName, setSalonName] = useState("Muvi Salon");
  const [logo, setLogo] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user); })
      .catch(() => {});

    const loadSettings = () => {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          const s = data.settings;
          if (s?.salonName) setSalonName(s.salonName);
          if (s?.logo) setLogo(s.logo);
          else setLogo(null);
        })
        .catch(() => {});
    };

    loadSettings();
    window.addEventListener("settings-updated", loadSettings);
    return () => window.removeEventListener("settings-updated", loadSettings);
  }, []);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    const { logout } = await import("@/lib/actions/auth");
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const nameParts = salonName.split(" ");
  const displayName = nameParts.length > 1 ? nameParts[0] : salonName;
  const subDisplay = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Salon";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary shadow-sm overflow-hidden shrink-0">
          <div className="w-full h-full rounded-[7px] bg-white flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt={`${salonName} Logo`} className="w-full h-full object-cover" />
            ) : (
              <Image src="/logo.jpeg" alt={`${salonName} Logo`} className="w-full h-full object-cover" width={36} height={36} priority />
            )}
          </div>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground text-[14px] leading-tight truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-primary font-medium tracking-wider uppercase">
              {subDisplay}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {allNavItems
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
                {!collapsed && <span className="flex-1">{item.title}</span>}
              </Link>
            );
          })}
      </nav>

      {/* User */}
      <div className="px-2.5 py-3 border-t border-border/50">
        <div className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-lg", collapsed ? "justify-center" : "")}>
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate capitalize">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground rounded-lg"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden bg-white/80 backdrop-blur-sm text-foreground shadow-sm border border-border rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-60 bg-background border-r border-border transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-background border-r border-border sidebar-transition sticky top-0",
          collapsed ? "w-[60px]" : "w-56"
        )}
      >
        <SidebarContent />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}
