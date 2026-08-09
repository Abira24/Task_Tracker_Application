"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  getHours,
  getMinutes,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  X,
  Loader2,
  Plus,
  Phone,
  Mail,
  StickyNote,
} from "lucide-react";
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

const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  confirmed: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", bg: "bg-emerald-500" },
  "in-progress": { label: "In Progress", color: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500", bg: "bg-sky-500" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", bg: "bg-amber-500" },
  completed: { label: "Completed", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", bg: "bg-purple-500" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", bg: "bg-red-500" },
};

function to24h(time: string): string {
  if (!time) return "09:00";
  if (time.includes(":") && !time.includes("AM") && !time.includes("PM")) return time;
  const [t, mod] = time.split(" ");
  const [h, m] = t.split(":");
  let hour = parseInt(h);
  if (mod === "PM" && hour !== 12) hour += 12;
  if (mod === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}`;
}

function to12h(time: string): string {
  if (!time) return "9:00 AM";
  if (time.includes("AM") || time.includes("PM")) return time;
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function toMinutes(time: string): number {
  const t24 = to24h(time);
  const [h, m] = t24.split(":").map(Number);
  return h * 60 + m;
}

function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export default function AppointmentsPage() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userStylistId, setUserStylistId] = useState<string | null>(null);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    customerId: "",
    serviceId: "",
    stylistId: "",
    date: toDateStr(new Date()),
    startTime: "09:00",
    endTime: "10:00",
  });

  const isAdmin = userRole === "admin";

  const loadData = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        const role = userData.user?.role || "";
        const sid = userData.user?.stylistId || null;
        setUserRole(role);
        setUserStylistId(sid);
        const params = sid ? `?stylistId=${sid}` : "";
        return fetch(`/api/appointments${params}`).then((r) => r.json());
      })
      .then((data) => {
        setAppointments(data.appointments || []);
        setStylists(data.stylists || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const mappedApts = useMemo(() =>
    appointments.map((a: any) => ({
      ...a,
      dateStr: a.date ? toDateStr(new Date(a.date)) : "",
      startMin: toMinutes(a.startTime),
      endMin: toMinutes(a.endTime),
      stylistColor: a.stylistColor || "#8b5cf6",
    })),
    [appointments]
  );

  const getAptsForDate = useCallback((d: Date) => {
    const ds = toDateStr(d);
    return mappedApts.filter((a) => a.dateStr === ds);
  }, [mappedApts]);

  const navigatePrev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const navigateNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const openDetail = (apt: any) => {
    setSelectedApt(apt);
    setShowDetail(true);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setShowDetail(false);
    loadData();
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setShowDetail(false);
    loadData();
  };

  const openCreate = async () => {
    const [c, sv] = await Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]);
    setCustomers(c.customers || []);
    setServices(sv.services || []);
    setCreateForm({
      customerId: "", serviceId: "", stylistId: "",
      date: toDateStr(currentDate),
      startTime: "09:00", endTime: "10:00",
    });
    setShowCreate(true);
  };

  const createAppointment = async () => {
    setFormSubmitting(true);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: createForm.date,
          startTime: to12h(createForm.startTime),
          endTime: to12h(createForm.endTime),
          customerId: createForm.customerId,
          serviceId: createForm.serviceId,
          stylistId: createForm.stylistId,
        }),
      });
      setShowCreate(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const monthTitle = format(currentDate, "MMMM yyyy");
  const weekTitle = `${format(startOfWeek(currentDate), "MMM d")} – ${format(endOfWeek(currentDate), "MMM d, yyyy")}`;
  const dayTitle = format(currentDate, "EEEE, MMMM d, yyyy");
  const headerTitle = view === "month" ? monthTitle : view === "week" ? weekTitle : dayTitle;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            Appointments
          </h1>
          <p className="text-gray-500 text-[13px] mt-1 ml-[42px]">
            {mappedApts.length} total booking{mappedApts.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl text-[13px] font-medium cursor-pointer shadow-sm shadow-primary/20 h-9 px-4"
          >
            <Plus className="h-4 w-4" /> New Appointment
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={navigatePrev} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-[15px] font-semibold text-gray-900 min-w-[200px] text-center">{headerTitle}</h2>
          <Button variant="ghost" size="icon-sm" onClick={navigateNext} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={goToday} className="text-[12px] font-medium text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer hidden sm:flex">
            Today
          </Button>
        </div>
        <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                view === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          getAptsForDate={getAptsForDate}
          onDateClick={(d) => { setCurrentDate(d); setView("day"); }}
          onAptClick={openDetail}
          stylists={stylists}
        />
      )}
      {view === "week" && (
        <WeekView
          currentDate={currentDate}
          getAptsForDate={getAptsForDate}
          onAptClick={openDetail}
          stylists={stylists}
        />
      )}
      {view === "day" && (
        <DayView
          currentDate={currentDate}
          getAptsForDate={getAptsForDate}
          onAptClick={openDetail}
          stylists={stylists}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>View and manage this booking</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="mt-6 space-y-5 px-1">
              {/* Status */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {["pending", "confirmed", "in-progress", "completed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedApt.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer border ${
                        selectedApt.status === s
                          ? `${statusConfig[s]?.color || ""} border-current`
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100 border-transparent"
                      }`}
                    >
                      {statusConfig[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                <InfoRow icon={<User className="h-4 w-4 text-gray-400" />} label="Client" value={selectedApt.client} />
                {selectedApt.clientEmail && (
                  <InfoRow icon={<Mail className="h-4 w-4 text-gray-400" />} label="Email" value={selectedApt.clientEmail} />
                )}
                {selectedApt.clientPhone && (
                  <InfoRow icon={<Phone className="h-4 w-4 text-gray-400" />} label="Phone" value={selectedApt.clientPhone} />
                )}
                <InfoRow icon={<Scissors className="h-4 w-4 text-gray-400" />} label="Service" value={selectedApt.service} />
                <InfoRow
                  icon={<div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selectedApt.stylistColor }} />}
                  label="Stylist"
                  value={selectedApt.stylist}
                />
                <InfoRow icon={<CalendarIcon className="h-4 w-4 text-gray-400" />} label="Date" value={
                  selectedApt.date ? (() => {
                    const d = new Date(selectedApt.date.includes("T") ? selectedApt.date : selectedApt.date + "T00:00:00");
                    return isNaN(d.getTime()) ? String(selectedApt.date) : format(d, "MMMM d, yyyy");
                  })() : ""
                } />
                <InfoRow icon={<Clock className="h-4 w-4 text-gray-400" />} label="Time" value={`${to12h(selectedApt.startTime)} – ${to12h(selectedApt.endTime)}`} />
                {selectedApt.startTime && selectedApt.endTime && (() => {
                  const toMin = (t: string) => {
                    const [time, period] = t.split(" ");
                    let [h, m] = time.split(":").map(Number);
                    if (period === "PM" && h !== 12) h += 12;
                    if (period === "AM" && h === 12) h = 0;
                    return h * 60 + m;
                  };
                  const diff = toMin(selectedApt.endTime) - toMin(selectedApt.startTime);
                  const hrs = Math.floor(diff / 60);
                  const mins = diff % 60;
                  const label = hrs > 0 && mins > 0 ? `${hrs}h ${mins}m` : hrs > 0 ? `${hrs}h` : `${mins}m`;
                  return <InfoRow icon={<Clock className="h-4 w-4 text-gray-400" />} label="Duration" value={label} />;
                })()}
                {selectedApt.price != null && (
                  <InfoRow icon={<span className="text-gray-400 text-[13px] font-bold">$</span>} label="Price" value={`$${selectedApt.price}`} />
                )}
                {selectedApt.notes && (
                  <InfoRow icon={<StickyNote className="h-4 w-4 text-gray-400" />} label="Notes" value={selectedApt.notes} />
                )}
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => deleteAppointment(selectedApt.id)}
                    className="w-full rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer text-[13px]"
                  >
                    Delete Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      {isAdmin && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[16px]">New Appointment</DialogTitle>
              <DialogDescription>Book a new appointment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <FormField label="Customer">
                <select
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Service">
                <select
                  value={createForm.serviceId}
                  onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select service...</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Stylist">
                <select
                  value={createForm.stylistId}
                  onChange={(e) => setCreateForm({ ...createForm, stylistId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select stylist...</option>
                  {stylists.map((st: any) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date">
                <Input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  className="rounded-lg text-[13px]"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Time">
                  <Input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                    className="rounded-lg text-[13px]"
                  />
                </FormField>
                <FormField label="End Time">
                  <Input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                    className="rounded-lg text-[13px]"
                  />
                </FormField>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="rounded-lg cursor-pointer">
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
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px]">{label}</Label>
      {children}
    </div>
  );
}

/* ───── Month View ───── */
function MonthView({
  currentDate,
  getAptsForDate,
  onDateClick,
  onAptClick,
  stylists,
}: {
  currentDate: Date;
  getAptsForDate: (d: Date) => any[];
  onDateClick: (d: Date) => void;
  onAptClick: (a: any) => void;
  stylists: any[];
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const apts = getAptsForDate(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className={`min-h-[100px] sm:min-h-[110px] p-1.5 border-b border-r border-gray-100 last:border-r-0 transition-colors cursor-pointer hover:bg-gray-50/50 ${
                !inMonth ? "bg-gray-50/30" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    today
                      ? "bg-primary text-white font-bold"
                      : inMonth
                        ? "text-gray-700"
                        : "text-gray-300"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {apts.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-400">{apts.length}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {apts.slice(0, 3).map((apt: any) => (
                  <div
                    key={apt.id}
                    onClick={(e) => { e.stopPropagation(); onAptClick(apt); }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${apt.stylistColor}15`, color: apt.stylistColor, borderLeft: `2px solid ${apt.stylistColor}` }}
                  >
                    <span className="truncate">{to12h(apt.startTime).replace(/:00/g, "").replace(" ", "")} {apt.client}</span>
                  </div>
                ))}
                {apts.length > 3 && (
                  <p className="text-[9px] text-gray-400 font-medium px-1">+{apts.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Week View ───── */
function WeekView({
  currentDate,
  getAptsForDate,
  onAptClick,
  stylists,
}: {
  currentDate: Date;
  getAptsForDate: (d: Date) => any[];
  onAptClick: (a: any) => void;
  stylists: any[];
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100">
        <div className="py-3" />
        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="py-3 text-center border-l border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{format(day, "EEE")}</p>
              <p className={`text-[18px] font-bold mt-0.5 ${today ? "text-primary" : "text-gray-900"}`}>
                {format(day, "d")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[60px]">
            <div className="py-1 pr-2 text-right text-[11px] font-medium text-gray-400 border-r border-gray-100">
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
            </div>
            {weekDays.map((day) => {
              const apts = getAptsForDate(day).filter((a) => {
                const h = parseInt(to24h(a.startTime).split(":")[0]);
                return h === hour;
              });
              return (
                <div key={day.toISOString() + hour} className="border-l border-gray-100 p-0.5 relative">
                  {apts.map((apt: any) => {
                    const startH = parseInt(to24h(apt.startTime).split(":")[0]);
                    const startM = parseInt(to24h(apt.startTime).split(":")[1]);
                    const endH = parseInt(to24h(apt.endTime).split(":")[0]);
                    const endM = parseInt(to24h(apt.endTime).split(":")[1]);
                    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
                    const heightPx = Math.max((durationMin / 60) * 60, 28);
                    const topOffset = (startM / 60) * 60;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => onAptClick(apt)}
                        className="absolute left-0.5 right-0.5 rounded-lg p-1.5 border-l-[3px] cursor-pointer hover:shadow-sm transition-all overflow-hidden z-10"
                        style={{
                          top: `${topOffset}px`,
                          height: `${heightPx}px`,
                          borderColor: apt.stylistColor,
                          backgroundColor: `${apt.stylistColor}12`,
                        }}
                      >
                        <p className="text-[10px] font-bold text-gray-900 truncate">{apt.client}</p>
                        <p className="text-[9px] text-gray-500 truncate">{apt.service}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5">
                          {to12h(apt.startTime)} – {to12h(apt.endTime)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── Day View ───── */
function DayView({
  currentDate,
  getAptsForDate,
  onAptClick,
  stylists,
}: {
  currentDate: Date;
  getAptsForDate: (d: Date) => any[];
  onAptClick: (a: any) => void;
  stylists: any[];
}) {
  const dayApts = getAptsForDate(currentDate);
  const today = isToday(currentDate);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Time slots */}
      <div className="overflow-y-auto max-h-[600px]">
        {HOURS.map((hour) => {
          const hourApts = dayApts.filter((a) => {
            const h = parseInt(to24h(a.startTime).split(":")[0]);
            return h === hour;
          });

          return (
            <div key={hour} className="grid grid-cols-[70px_1fr] min-h-[72px] border-b border-gray-100">
              <div className="py-2 pr-3 text-right text-[12px] font-medium text-gray-400 border-r border-gray-100">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
              </div>
              <div className="relative p-1">
                {/* Current time indicator */}
                {today && (() => {
                  const now = new Date();
                  const currentHour = now.getHours();
                  if (currentHour !== hour) return null;
                  const mins = now.getMinutes();
                  return (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${(mins / 60) * 72}px` }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                        <div className="flex-1 h-px bg-red-400" />
                      </div>
                    </div>
                  );
                })()}

                {hourApts.map((apt: any) => {
                  const startM = parseInt(to24h(apt.startTime).split(":")[1]);
                  const endH = parseInt(to24h(apt.endTime).split(":")[0]);
                  const endM = parseInt(to24h(apt.endTime).split(":")[1]);
                  const durationMin = (endH * 60 + endM) - (hour * 60 + startM);
                  const heightPx = Math.max((durationMin / 60) * 72, 32);

                  return (
                    <div
                      key={apt.id}
                      onClick={() => onAptClick(apt)}
                      className="absolute left-1 right-1 rounded-xl p-3 border-l-[4px] cursor-pointer hover:shadow-md transition-all overflow-hidden group"
                      style={{
                        top: `${(startM / 60) * 72}px`,
                        height: `${heightPx}px`,
                        borderColor: apt.stylistColor,
                        backgroundColor: `${apt.stylistColor}10`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{apt.client}</p>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: statusConfig[apt.status]?.dot || "#9ca3af" }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-600 truncate">{apt.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: apt.stylistColor }} />
                          <span className="text-[10px] text-gray-500">{apt.stylist}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {to12h(apt.startTime)} – {to12h(apt.endTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      {dayApts.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 text-[12px] text-gray-500">
            <span className="font-medium text-gray-700">{dayApts.length} appointment{dayApts.length !== 1 ? "s" : ""}</span>
            {Object.entries(
              dayApts.reduce((acc: Record<string, number>, a: any) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
              }, {})
            ).map(([status, count]) => (
              <span key={status} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status]?.dot || "bg-gray-400"}`} />
                {statusConfig[status]?.label || status}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
