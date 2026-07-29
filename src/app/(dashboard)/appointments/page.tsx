"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  completed: "bg-violet-50 text-violet-700 border-violet-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
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

export default function AppointmentsPage() {
  const [view, setView] = useState<"calendar" | "list">("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    customerId: "", serviceId: "", stylistId: "",
    date: new Date().toISOString().split("T")[0],
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

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isToday = (d: Date) => d.toDateString() === today.toDateString();

  const filteredAppointments = appointments.filter((a: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return a.client?.toLowerCase().includes(q) ||
           a.service?.toLowerCase().includes(q) ||
           a.stylist?.toLowerCase().includes(q);
  });

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];

  const mappedAppointments = filteredAppointments.map((a: any) => ({
    id: a.id,
    client: a.client,
    clientEmail: a.clientEmail,
    clientPhone: a.clientPhone,
    service: a.service,
    date: a.date ? new Date(a.date).toISOString().split("T")[0] : "",
    time: a.startTime,
    endTime: a.endTime,
    stylist: a.stylist,
    status: a.status,
    price: a.price,
    duration: a.duration,
    color: a.stylistColor || "#8b5cf6",
  }));

  const weekDateStrs = daysInWeek.map(toDateStr);

  const displayStylists = stylists.length > 0 ? stylists : [
    { id: "1", name: "Emma Wilson", color: "#8b5cf6" },
    { id: "2", name: "James Brown", color: "#0ea5e9" },
    { id: "3", name: "Sophia Lee", color: "#ec4899" },
    { id: "4", name: "Mia Garcia", color: "#10b981" },
  ];

  const getWeekForDay = (day: Date) => {
    const dayWeekStart = new Date(day);
    dayWeekStart.setDate(day.getDate() - day.getDay());
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay());
    const diffMs = dayWeekStart.getTime() - todayWeekStart.getTime();
    return Math.round(diffMs / (7 * 86400000));
  };

  const getStylistColor = (stylistName: string) => {
    const s = displayStylists.find((st: any) => st.name === stylistName);
    return s?.color || "#8b5cf6";
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
      date: new Date().toISOString().split("T")[0],
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
      editDate: apt.date ? new Date(apt.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your salon appointments and schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                view === "calendar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={openCreateDialog} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl border-gray-200"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="rounded-xl border-gray-200 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2">
          {daysInWeek.map((day, i) => (
            <button
              key={i}
              onClick={() => setWeekOffset(getWeekForDay(day))}
              className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl transition-all cursor-pointer ${
                isToday(day)
                  ? "bg-violet-600 text-white shadow-sm"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-[11px] uppercase font-medium opacity-70">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold">{day.getDate()}</span>
              {isToday(day) && <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="rounded-xl border-gray-200 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr] gap-4">
          <div className="hidden lg:flex flex-col">
            {timeSlots.map((time) => (
              <div key={time} className="h-16 flex items-start text-[12px] text-gray-500 font-medium pt-0">
                {time}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStylists.map((stylist: any) => (
              <div key={stylist.id} className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stylist.color }} />
                  <span className="font-medium text-[13px] text-gray-900">{stylist.name}</span>
                </div>
                <div className="space-y-1 relative min-h-[400px]">
                  {timeSlots.map((time) => (
                    <div key={time} className="h-16 border-b border-dashed border-gray-100" />
                  ))}
                  {mappedAppointments
                    .filter((a: any) => a.stylist === stylist.name && weekDateStrs.includes(a.date))
                    .map((apt: any) => {
                      const startIdx = timeSlots.indexOf(apt.time);
                      const endIdx = timeSlots.indexOf(apt.endTime);
                      const duration = endIdx - startIdx + 1;
                      if (startIdx === -1) return null;
                      return (
                        <div
                          key={apt.id}
                          onClick={() => openDetailDialog(apt)}
                          className="absolute left-1 right-1 rounded-lg p-2 border-l-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                          style={{
                            top: `${startIdx * 64}px`,
                            height: `${Math.max(duration * 64 - 4, 30)}px`,
                            borderLeftColor: getStylistColor(apt.stylist),
                          }}
                        >
                          <p className="text-[12px] font-semibold text-gray-900 truncate">{apt.client}</p>
                          <p className="text-[11px] text-gray-500 truncate">{apt.service}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{apt.time}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mappedAppointments.map((apt: any) => (
            <Card key={apt.id} className="border-gray-100 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-xl text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: getStylistColor(apt.stylist) }}
                  >
                    <div className="text-center">
                      <p className="text-lg leading-none">{apt.time?.split(" ")[0]}</p>
                      <p className="text-[10px] opacity-80">{apt.time?.split(" ")[1]}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{apt.client}</h3>
                      <Badge className={`text-[11px] ${statusStyles[apt.status] || statusStyles.confirmed}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[13px] text-gray-500">
                      <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> {apt.service}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {apt.stylist}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.time} - {apt.endTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      {["pending", "confirmed", "in-progress", "completed"].map((s) =>
                        apt.status !== s ? (
                          <button
                            key={s}
                            onClick={() => updateStatus(apt.id, s)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer whitespace-nowrap"
                          >
                            {s}
                          </button>
                        ) : null
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(apt)}
                      className="hidden sm:flex rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      View Details
                    </Button>
                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {mappedAppointments.length === 0 && (
            <div className="text-center text-gray-400 py-12">No appointments found</div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Book a new appointment for a customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <select
                value={createForm.customerId}
                onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                <option value="">Select customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <select
                value={createForm.serviceId}
                onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                <option value="">Select service...</option>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.price}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Stylist</Label>
              <select
                value={createForm.stylistId}
                onChange={(e) => setCreateForm({ ...createForm, stylistId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                <option value="">Select stylist...</option>
                {displayStylists.map((st: any) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button
              onClick={createAppointment}
              disabled={formSubmitting || !createForm.customerId || !createForm.serviceId || !createForm.stylistId}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer"
            >
              {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>View and manage this appointment.</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Client</p>
                  <p className="font-semibold text-gray-900">{selectedApt.client}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Service</p>
                  <p className="font-semibold text-gray-900">{selectedApt.service}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Stylist</p>
                  <p className="font-semibold text-gray-900">{selectedApt.stylist}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Status</p>
                  <Badge className={`text-[11px] mt-1 ${statusStyles[selectedApt.status] || statusStyles.confirmed}`}>
                    {selectedApt.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Time</p>
                  <p className="font-semibold text-gray-900">{selectedApt.time} - {selectedApt.endTime}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900">${selectedApt.price || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-[13px] font-medium text-gray-700 mb-2">Change Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "confirmed", "in-progress", "completed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedApt.id, s)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${
                        selectedApt.status === s
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  onClick={() => deleteAppointment(selectedApt.id)}
                  className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button
                  onClick={() => setShowDetailDialog(false)}
                  className="rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
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
