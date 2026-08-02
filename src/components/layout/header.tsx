"use client";

import { Bell, X, Calendar, CheckCircle2, Clock, AlertCircle, Trash2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  appointmentId?: string;
  type: "appointment_today" | "status_change" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
  deleted: boolean;
}

function getStoredSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function storeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function Header() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) return;
      const data = await res.json();
      const appointments = data.appointments || [];

      const readIds = getStoredSet("notification_read");
      const deletedIds = getStoredSet("notification_deleted");

      const todayNow = new Date();
      const today = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, "0")}-${String(todayNow.getDate()).padStart(2, "0")}`;
      const todayAppts = appointments.filter((a: any) => {
        const d = new Date(a.date);
        const apptDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return apptDate === today;
      });

      const newNotifications: Notification[] = [];

      todayAppts.forEach((apt: any) => {
        const baseId = `today-${apt.id}`;
        if (!deletedIds.has(baseId)) {
          newNotifications.push({
            id: baseId,
            appointmentId: apt.id,
            type: "appointment_today",
            title: "Today's Appointment",
            message: `${apt.client} - ${apt.service} at ${apt.startTime}`,
            time: apt.startTime,
            read: readIds.has(baseId),
            deleted: false,
          });
        }

        if (apt.status === "in-progress") {
          const id = `progress-${apt.id}`;
          if (!deletedIds.has(id)) {
            newNotifications.push({
              id,
              appointmentId: apt.id,
              type: "status_change",
              title: "In Progress",
              message: `${apt.client}'s ${apt.service} is now in progress`,
              time: apt.startTime,
              read: readIds.has(id),
              deleted: false,
            });
          }
        }

        if (apt.status === "completed") {
          const id = `completed-${apt.id}`;
          if (!deletedIds.has(id)) {
            newNotifications.push({
              id,
              appointmentId: apt.id,
              type: "status_change",
              title: "Completed",
              message: `${apt.client}'s ${apt.service} has been completed`,
              time: apt.startTime,
              read: readIds.has(id),
              deleted: false,
            });
          }
        }

        if (apt.status === "cancelled") {
          const id = `cancelled-${apt.id}`;
          if (!deletedIds.has(id)) {
            newNotifications.push({
              id,
              appointmentId: apt.id,
              type: "status_change",
              title: "Cancelled",
              message: `${apt.client}'s ${apt.service} has been cancelled`,
              time: apt.startTime,
              read: readIds.has(id),
              deleted: false,
            });
          }
        }

        if (apt.status === "pending") {
          const id = `pending-${apt.id}`;
          if (!deletedIds.has(id)) {
            newNotifications.push({
              id,
              appointmentId: apt.id,
              type: "reminder",
              title: "Pending Confirmation",
              message: `${apt.client} is waiting for confirmation for ${apt.service}`,
              time: apt.startTime,
              read: readIds.has(id),
              deleted: false,
            });
          }
        }
      });

      if (todayAppts.length === 0 && !deletedIds.has("no-appointments")) {
        newNotifications.push({
          id: "no-appointments",
          type: "reminder",
          title: "No Appointments Today",
          message: "You have no appointments scheduled for today",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: readIds.has("no-appointments"),
          deleted: false,
        });
      }

      try {
        const invRes = await fetch("/api/inventory");
        if (invRes.ok) {
          const invData = await invRes.json();
          const invItems = invData.items || [];
          const lowStock = invItems.filter((i: any) => i.stock <= i.minStock);
          lowStock.forEach((item: any) => {
            const id = `low-stock-${item.id}`;
            if (!deletedIds.has(id)) {
              const isOut = item.stock === 0;
              newNotifications.push({
                id,
                type: "status_change",
                title: isOut ? "Out of Stock" : "Low Stock",
                message: `${item.name} — ${item.stock} left (min: ${item.minStock})`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: readIds.has(id),
                deleted: false,
              });
            }
          });
        }
      } catch {}

      setNotifications(newNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    const readIds = getStoredSet("notification_read");
    notifications.forEach((n) => readIds.add(n.id));
    storeSet("notification_read", readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    const readIds = getStoredSet("notification_read");
    readIds.add(id);
    storeSet("notification_read", readIds);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const deletedIds = getStoredSet("notification_deleted");
    deletedIds.add(id);
    storeSet("notification_deleted", deletedIds);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.appointmentId) {
      router.push("/appointments");
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string, title: string) => {
    if (title === "Low Stock" || title === "Out of Stock") return <Package className="h-4 w-4 text-amber-500" />;
    switch (type) {
      case "appointment_today":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "status_change":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 h-12 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => {
              const willOpen = !showNotifications;
              setShowNotifications(willOpen);
              if (willOpen) markAllAsRead();
            }}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-premium-lg border border-border overflow-hidden z-50 animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="font-semibold text-[13px] text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] text-primary font-medium">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-[13px]">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0 cursor-pointer group ${
                        !notification.read ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notification.type, notification.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-[13px] ${!notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">{notification.message}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{notification.time}</p>
                      </div>
                      <button
                        onClick={(e) => deleteNotification(e, notification.id)}
                        className="shrink-0 mt-0.5 p-1 rounded-md text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-border/50">
                <button
                  onClick={() => {
                    router.push("/appointments");
                    setShowNotifications(false);
                  }}
                  className="w-full text-center text-[13px] font-medium text-primary hover:text-primary/80 transition-colors py-1"
                >
                  View all appointments
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-muted-foreground text-[11px] font-medium">Online</span>
        </div>
      </div>
    </header>
  );
}
