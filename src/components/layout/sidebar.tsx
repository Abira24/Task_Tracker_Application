"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  { title: "Tasks", href: "/tasks", icon: CheckSquare, badge: "" },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    const { logout } = await import("@/lib/actions/auth");
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "JD";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-primary shadow-md overflow-hidden shrink-0 p-0.5">
          <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.jpeg"
              alt="Muvi Salon Logo"
              className="w-full h-full object-cover"
              width={44}
              height={44}
              priority
            />
          </div>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-[16px] leading-tight tracking-tight">
              Muvi
            </span>
            <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">
              Salon
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/5 text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-primary" : ""
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge className="bg-pink-100 text-pink-600 text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center rounded-full font-semibold">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl",
            collapsed ? "justify-center" : ""
          )}
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary-400 via-primary-500 to-purple-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate capitalize">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200 rounded-xl"
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 sidebar-transition sticky top-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
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
