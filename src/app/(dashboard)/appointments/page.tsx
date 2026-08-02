"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Scissors,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Filter,
  LayoutList,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  confirmed: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "in-progress": { label: "In Progress", color: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  completed: { label: "Completed", color: "bg-primary-50 text-primary-700 border-primary-200", dot: "bg-primary" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function to12h(time: string) {
  if (!time) return "9:00 AM";
  if (time.includes("AM") || time.includes("PM")) return time;
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function to24h(time: string) {
  if (!time || time.includes(":")) {
    if (time && !time.includes("AM") && !time.includes("PM")) return time;
  }
  const [t, mod] = time.split(" ");
  let [h, m] = t.split(":");
  let hour = parseInt(h);
  if (mod === "PM" && hour !== 12) hour += 12;
  if (mod === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}`;
}

function toDateStr(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSelectedDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    customerId: "", serviceId: "", stylistId: "",
    date: toDateStr(new Date()),
    startTime: "09:00", endTime: "10:00",
  });

  const loadAppointments = () => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setStylists(data.stylists || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadAppointments, []);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isViewingToday = toDateStr(selectedDate) === toDateStr(now);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isToday = (d: Date) => toDateStr(d) === toDateStr(today);
  const isSelected = (d: Date) => toDateStr(d) === toDateStr(selectedDate);

  const selectedDateStr = toDateStr(selectedDate);

  const mappedAppointments = appointments.map((a: any) => ({
    id: a.id,
    client: a.client,
    clientEmail: a.clientEmail,
    clientPhone: a.clientPhone,
    service: a.service,
    date: a.date ? toDateStr(new Date(a.date)) : "",
    time: a.startTime,
    endTime: a.endTime,
    stylist: a.stylist,
    status: a.status,
    price: a.price,
    duration: a.duration,
    color: a.stylistColor || "#8b5cf6",
  }));

  const dayAppointments = mappedAppointments.filter((a) => a.date === selectedDateStr);

  const filteredAppointments = dayAppointments.filter((a) => {
    const matchesSearch = !searchTerm || (
      a.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.stylist?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayStylists = stylists.length > 0 ? stylists : [
    { id: "1", name: "Emma Wilson", color: "#8b5cf6" },
    { id: "2", name: "James Brown", color: "#0ea5e9" },
    { id: "3", name: "Sophia Lee", color: "#ec4899" },
    { id: "4", name: "Mia Garcia", color: "#10b981" },
  ];

  const getStylistColor = (stylistName: string) => {
    const s = displayStylists.find((st: any) => st.name === stylistName);
    return s?.color || "#8b5cf6";
  };

  const navigateDate = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
    const newDay = newDate.getDay();
    const newWeekStart = new Date(today);
    newWeekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
    const newWeekEnd = new Date(newWeekStart);
    newWeekEnd.setDate(newWeekStart.getDate() + 6);
    if (newDate < newWeekStart || newDate > newWeekEnd) {
      setWeekOffset(weekOffset + Math.round((newDate.getTime() - today.getTime()) / (7 * 86400000)));
    }
  };

  const openCreateDialog = async () => {
    const [c, sv] = await Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]);
    setCustomers(c.customers || []);
    setServices(sv.services || []);
    setCreateForm({
      customerId: "", serviceId: "", stylistId: "",
      date: selectedDateStr,
      startTime: "09:00", endTime: "10:00",
    });
    setShowCreateDialog(true);
  };

  const openDetailDialog = async (apt: any) => {
    const [c, sv] = await Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]);
    setCustomers(c.customers || []);
    setServices(sv.services || []);
    setSelectedApt({
      ...apt,
      editDate: apt.date,
      editStartTime: to24h(apt.time),
      editEndTime: to24h(apt.endTime),
      editCustomerId: "",
      editServiceId: "",
      editStylistId: "",
    });
    setShowDetailDialog(true);
  };

  const createAppointment = async () => {
    setFormSubmitting(true);
    try {
      const start12 = to12h(createForm.startTime);
      const end12 = to12h(createForm.endTime);
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: createForm.date,
          startTime: start12,
          endTime: end12,
          customerId: createForm.customerId,
          serviceId: createForm.serviceId,
          stylistId: createForm.stylistId,
        }),
      });
      setShowCreateDialog(false);
      loadAppointments();
    } catch (e) {
      console.error(e);
    } finally {
      setFormSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAppointments();
    setShowDetailDialog(false);
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    loadAppointments();
    setShowDetailDialog(false);
  };

  const statusCounts = dayAppointments.reduce((acc: Record<string, number>, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-[13px]">
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""} on{" "}
            <span className="text-gray-700 font-medium">{formatSelectedDate(selectedDate)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                view === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg text-[13px] font-medium cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigateDate(-1)}
          className="shrink-0 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none py-1">
          {daysInWeek.map((day, i) => {
            const hasAppts = mappedAppointments.some((a) => a.date === toDateStr(day));
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center min-w-[56px] px-2 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected(day)
                    ? "bg-primary text-white"
                    : isToday(day)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100/60 text-gray-600"
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wider ${
                    isSelected(day) ? "text-white/80" : ""
                  }`}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold leading-tight">{day.getDate()}</span>
                {hasAppts && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected(day) ? "bg-white/80" : "bg-primary"
                    }`}
                  />
                )}
                {isToday(day) && !isSelected(day) && (
                  <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigateDate(1)}
          className="shrink-0 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate(new Date())}
          className="hidden sm:flex text-[12px] font-medium text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer"
        >
          Today
        </Button>
      </div>

      {/* Search + Status Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, service, or stylist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-9 rounded-lg border-border/60 text-[13px] bg-white placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {["all", "confirmed", "pending", "in-progress", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100/60 text-gray-500 hover:bg-gray-200/80 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "All" : statusConfig[s]?.label || s}
              {s !== "all" && statusCounts[s] ? (
                <span className={`ml-1 text-[10px] ${statusFilter === s ? "text-primary/70" : "text-gray-400"}`}>
                  {statusCounts[s]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "calendar" ? (
        <Card className="border-border/50 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-[72px_1fr]">
              {/* Time labels */}
              <div className="hidden lg:flex flex-col border-r border-border/50">
                <div className="h-12 border-b border-border/50 bg-gray-50/50" />
                {timeSlots.map((time, i) => (
                  <div
                    key={time}
                    className={`h-14 flex items-start px-2 pt-1.5 text-[11px] font-medium ${
                      i % 2 === 0 ? "text-gray-500" : "text-gray-300"
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Stylist columns */}
              <div className="overflow-x-auto">
                <div className="flex" style={{ minWidth: displayStylists.length * 220 }}>
                  {displayStylists.map((stylist: any, si: number) => {
                    const stylistAppts = filteredAppointments.filter(
                      (a: any) => a.stylist === stylist.name && a.date === selectedDateStr
                    );
                    return (
                      <div
                        key={stylist.id}
                        className={`flex-1 min-w-[220px] ${
                          si < displayStylists.length - 1 ? "border-r border-border/50" : ""
                        }`}
                      >
                        {/* Stylist header */}
                        <div className="h-12 flex items-center gap-2.5 px-3 border-b border-border/50 bg-gray-50/50 sticky top-0 z-10">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: stylist.color }}
                          />
                          <span className="font-semibold text-[13px] text-gray-800 truncate">
                            {stylist.name}
                          </span>
                          <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
                            {stylistAppts.length}
                          </span>
                        </div>

                        {/* Time grid */}
                        <div className="relative">
                          {timeSlots.map((time, i) => (
                            <div
                              key={time}
                              className={`h-14 border-b ${
                                i % 2 === 0 ? "border-border/50" : "border-transparent"
                              } hover:bg-primary/[0.02] transition-colors`}
                            >
                              <div className="w-full h-px bg-gray-50 mt-7" />
                            </div>
                          ))}

                          {/* Current time indicator */}
                          {isViewingToday &&
                            si === 0 &&
                            (() => {
                              const slotIdx = timeSlots.findIndex((t) => {
                                const t24 = to24h(t);
                                const [th, tm] = t24.split(":").map(Number);
                                return currentHour < th || (currentHour === th && currentMinute < tm);
                              });
                              if (slotIdx === -1 && currentHour >= 17) return null;
                              const idx = slotIdx === -1 ? timeSlots.length - 1 : slotIdx;
                              const t24 = to24h(timeSlots[Math.max(0, idx)]);
                              const [th, tm] = t24.split(":").map(Number);
                              const offset = idx * 56 + (currentMinute / 60) * 56;
                              return (
                                <div
                                  className="absolute left-0 right-0 z-20 pointer-events-none"
                                  style={{ top: `${offset}px` }}
                                >
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                                    <div className="flex-1 h-px bg-red-400" />
                                  </div>
                                </div>
                              );
                            })()}

                          {/* Appointments */}
                          {stylistAppts.map((apt: any) => {
                            const startIdx = timeSlots.indexOf(apt.time);
                            const endIdx = timeSlots.indexOf(apt.endTime);
                            const duration = Math.max(endIdx - startIdx + 1, 1);
                            if (startIdx === -1) return null;
                            const statusColors: Record<string, string> = {
                              confirmed: "border-l-emerald-400 bg-emerald-50/80",
                              "in-progress": "border-l-sky-400 bg-sky-50/80",
                              pending: "border-l-amber-400 bg-amber-50/80",
                              completed: "border-l-primary bg-primary-50/80",
                              cancelled: "border-l-red-300 bg-red-50/60",
                            };
                            return (
                              <div
                                key={apt.id}
                                onClick={() => openDetailDialog(apt)}
                                className={`absolute left-1.5 right-1.5 rounded-lg p-2 border-l-[3px] hover:shadow-sm transition-all cursor-pointer overflow-hidden group ${
                                  statusColors[apt.status] || "border-l-gray-300 bg-gray-50"
                                }`}
                                style={{
                                  top: `${startIdx * 56 + 2}px`,
                                  height: `${Math.max(duration * 56 - 6, 28)}px`,
                                }}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-[11px] font-bold text-gray-900 truncate">{apt.client}</p>
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      statusConfig[apt.status]?.dot || "bg-gray-400"
                                    }`}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{apt.service}</p>
                                {duration > 1 && (
                                  <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {apt.time} – {apt.endTime}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAppointments.length === 0 ? (
            <Card className="border-border/50 rounded-xl">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-3">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-[13px] font-medium">
                  No appointments for {formatSelectedDate(selectedDate)}
                </p>
                <p className="text-gray-400 text-[12px] mt-1">
                  Try a different date or create a new booking
                </p>
                <Button
                  onClick={openCreateDialog}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:text-primary/80 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Book one now
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((apt: any) => (
              <Card
                key={apt.id}
                onClick={() => openDetailDialog(apt)}
                className="border-border/50 rounded-xl hover:border-border hover:shadow-sm transition-all cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Time block */}
                    <div
                      className="flex flex-col items-center justify-center w-14 h-14 rounded-lg text-white font-bold shrink-0"
                      style={{ backgroundColor: getStylistColor(apt.stylist) }}
                    >
                      <span className="text-[13px] leading-none">{apt.time?.split(" ")[0]}</span>
                      <span className="text-[9px] opacity-80 mt-0.5">{apt.time?.split(" ")[1]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[14px] text-gray-900">{apt.client}</h3>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 border ${
                            statusConfig[apt.status]?.color || statusConfig.confirmed.color
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              statusConfig[apt.status]?.dot || "bg-emerald-500"
                            }`}
                          />
                          {statusConfig[apt.status]?.label || apt.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Scissors className="h-3 w-3" /> {apt.service}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {apt.stylist}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {apt.time} - {apt.endTime}
                        </span>
                        {apt.price ? (
                          <span className="font-medium text-gray-700">${apt.price}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status !== "confirmed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(apt.id, "confirmed");
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Mark Confirmed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {apt.status !== "completed" && apt.status !== "cancelled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(apt.id, "completed");
                          }}
                          className="p-1.5 rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors cursor-pointer"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAppointment(apt.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">New Appointment</DialogTitle>
            <DialogDescription>Book for {formatSelectedDate(selectedDate)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Customer</Label>
              <select
                value={createForm.customerId}
                onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Service</Label>
              <select
                value={createForm.serviceId}
                onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
                className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select service...</option>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Stylist</Label>
              <select
                value={createForm.stylistId}
                onChange={(e) => setCreateForm({ ...createForm, stylistId: e.target.value })}
                className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select stylist...</option>
                {displayStylists.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Date</Label>
              <Input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                className="rounded-lg text-[13px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Start Time</Label>
                <Input
                  type="time"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  className="rounded-lg text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">End Time</Label>
                <Input
                  type="time"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  className="rounded-lg text-[13px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={createAppointment}
              disabled={formSubmitting || !createForm.customerId || !createForm.serviceId || !createForm.stylistId}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer"
            >
              {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Appointment Details</DialogTitle>
            <DialogDescription>View and manage this booking</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Client</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApt.client}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Service</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApt.service}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Stylist</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApt.stylist}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Status</p>
                  <Badge
                    className={`text-[11px] mt-1 border ${
                      statusConfig[selectedApt.status]?.color || statusConfig.confirmed.color
                    }`}
                  >
                    {statusConfig[selectedApt.status]?.label || selectedApt.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Time</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedApt.time} - {selectedApt.endTime}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50/80 border border-border/30">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">Price</p>
                  <p className="font-semibold text-gray-900 mt-0.5">${selectedApt.price || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Change Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["pending", "confirmed", "in-progress", "completed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedApt.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                        selectedApt.status === s
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100/60 text-gray-600 hover:bg-gray-200/80"
                      }`}
                    >
                      {statusConfig[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-border/50 pt-4">
                <Button
                  variant="outline"
                  onClick={() => deleteAppointment(selectedApt.id)}
                  className="rounded-lg text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button
                  onClick={() => setShowDetailDialog(false)}
                  className="rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <AppointmentsContent />
    </Suspense>
  );
}
