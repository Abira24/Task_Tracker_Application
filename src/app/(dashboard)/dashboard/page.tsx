"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Scissors,
  Star,
  ChevronRight,
  Loader2,
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

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [apptForm, setApptForm] = useState(() => { const d = new Date(); return { customerId: "", serviceId: "", stylistId: "", date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, startTime: "09:00", endTime: "10:00" }; });
  const [custForm, setCustForm] = useState({ name: "", email: "", phone: "" });
  const [svcForm, setSvcForm] = useState({ name: "", category: "Cut", duration: "30", price: "" });

  const loadData = () => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([statsData, userData]) => {
        setData(statsData);
        setUser(userData.user);
      })
      .catch((e) => {
        console.error(e);
        showToast("Failed to load dashboard data", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const openAppointmentDialog = async () => {
    const [c, st, sv] = await Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/stylists").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]);
    setCustomers(c.customers || []);
    setStylists(st.stylists || []);
    setServices(sv.services || []);
    setShowAppointmentDialog(true);
  };

  const openCustomerDialog = () => {
    setCustForm({ name: "", email: "", phone: "" });
    setShowCustomerDialog(true);
  };

  const openServiceDialog = () => {
    setSvcForm({ name: "", category: "Cut", duration: "30", price: "" });
    setShowServiceDialog(true);
  };

  const createAppointment = async () => {
    setFormSubmitting(true);
    try {
      const start = apptForm.startTime;
      const startHour = parseInt(start.split(":")[0]);
      const startMin = start.split(":")[1];
      const start12 = `${startHour > 12 ? startHour - 12 : startHour}:${startMin} ${startHour >= 12 ? "PM" : "AM"}`;

      const endHour = parseInt(apptForm.endTime.split(":")[0]);
      const endMin = apptForm.endTime.split(":")[1];
      const end12 = `${endHour > 12 ? endHour - 12 : endHour}:${endMin} ${endHour >= 12 ? "PM" : "AM"}`;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: apptForm.date,
          startTime: start12,
          endTime: end12,
          customerId: apptForm.customerId,
          serviceId: apptForm.serviceId,
          stylistId: apptForm.stylistId,
        }),
      });
      if (res.ok) {
        showToast("Appointment booked successfully");
        setShowAppointmentDialog(false);
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to book appointment", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to book appointment", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const createCustomer = async () => {
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(custForm),
      });
      if (res.ok) {
        showToast("Customer added successfully");
        setShowCustomerDialog(false);
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add customer", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to add customer", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const createService = async () => {
    setFormSubmitting(true);
    try {
      const durationTotal = svcForm.duration.includes("h") ? parseInt(svcForm.duration) * 60 : parseInt(svcForm.duration);
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svcForm.name,
          category: svcForm.category,
          duration: durationTotal,
          price: parseFloat(svcForm.price),
        }),
      });
      if (res.ok) {
        showToast("Service added successfully");
        setShowServiceDialog(false);
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add service", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to add service", "error");
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

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const stats = data?.stats || [];
  const todayAppointments = data?.todayAppointments || [];
  const topServices = data?.topServices || [];
  const recentCustomers = data?.recentCustomers || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {greeting}, {user?.name || "Jane"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening at your salon today
          </p>
        </div>
        <Button
          onClick={openAppointmentDialog}
          className="bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 rounded-xl font-semibold text-sm px-4 h-10 hidden sm:flex cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any) => (
          <Card key={stat.title} className="border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className="text-[12px] font-semibold text-emerald-600">{stat.change}</span>
                    <span className="text-[11px] text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg || "bg-gray-50"}`}>
                  {stat.title === "Total Revenue" && <DollarSign className="h-5 w-5 text-emerald-600" />}
                  {stat.title === "Appointments" && <Calendar className="h-5 w-5 text-blue-600" />}
                  {stat.title === "Active Customers" && <Users className="h-5 w-5 text-primary" />}
                  {stat.title === "Avg. Rating" && <Star className="h-5 w-5 text-amber-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[15px] font-bold text-gray-900">
              Today&apos;s Appointments
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/appointments")}
              className="text-gray-500 hover:text-gray-700 text-[13px] font-medium cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {todayAppointments.map((apt: any) => (
                <div
                  key={apt.id}
                  onClick={() => router.push("/appointments")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs">
                    {apt.time?.split(" ")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900 truncate">{apt.client}</p>
                    <p className="text-[12px] text-gray-500">
                      {apt.service} · {apt.stylist}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-medium text-gray-600">{apt.duration}</p>
                    <Badge className={`text-[10px] font-medium border ${statusColors[apt.status] || statusColors.confirmed}`}>
                      {apt.status}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No appointments today</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-bold text-gray-900">Top Services</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topServices.map((service: any) => (
                <div key={service.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-xl">{service.icon || "✂️"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900 truncate">{service.name}</p>
                    <p className="text-[11px] text-gray-500">{service.bookings} bookings</p>
                  </div>
                  <p className="font-bold text-[13px] text-gray-900">{service.revenue}</p>
                </div>
              ))}
              {topServices.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[15px] font-bold text-gray-900">Recent Customers</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/customers")}
              className="text-gray-500 hover:text-gray-700 text-[13px] font-medium cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {recentCustomers.map((customer: any) => (
                <div
                  key={customer.name}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white font-bold text-[11px]">
                    {customer.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900">{customer.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {customer.visits} visits · {customer.lastVisit}
                    </p>
                  </div>
                  <p className="font-bold text-[13px] text-gray-900">{customer.spent}</p>
                </div>
              ))}
              {recentCustomers.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No customers yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-bold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={openAppointmentDialog}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:bg-primary-50 hover:border-primary-200 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">Book Appointment</span>
              </button>
              <button
                onClick={openCustomerDialog}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md hover:shadow-blue/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">Add Customer</span>
              </button>
              <button
                onClick={openServiceDialog}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md hover:shadow-purple/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-sm">
                  <Scissors className="h-5 w-5" />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">Add Service</span>
              </button>
              <button
                onClick={() => router.push("/analytics")}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">View Reports</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Book a new appointment for a customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <select
                value={apptForm.customerId}
                onChange={(e) => setApptForm({ ...apptForm, customerId: e.target.value })}
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
                value={apptForm.serviceId}
                onChange={(e) => setApptForm({ ...apptForm, serviceId: e.target.value })}
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
                value={apptForm.stylistId}
                onChange={(e) => setApptForm({ ...apptForm, stylistId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                <option value="">Select stylist...</option>
                {stylists.map((st: any) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={apptForm.date}
                onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={apptForm.startTime}
                  onChange={(e) => setApptForm({ ...apptForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={apptForm.endTime}
                  onChange={(e) => setApptForm({ ...apptForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={createAppointment}
              disabled={formSubmitting || !apptForm.customerId || !apptForm.serviceId || !apptForm.stylistId}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Add a new customer to your database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={custForm.name}
                onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={custForm.email}
                onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={custForm.phone}
                onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={createCustomer}
              disabled={formSubmitting || !custForm.name || !custForm.email}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>Add a new service to your menu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={svcForm.name}
                onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
                placeholder="e.g. Hair Treatment"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={svcForm.category}
                onChange={(e) => setSvcForm({ ...svcForm, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                {["Cut", "Color", "Beauty", "Nails", "Treatment", "Grooming", "Special"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={svcForm.duration}
                onChange={(e) => setSvcForm({ ...svcForm, duration: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={svcForm.price}
                onChange={(e) => setSvcForm({ ...svcForm, price: e.target.value })}
                placeholder="49.99"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowServiceDialog(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={createService}
              disabled={formSubmitting || !svcForm.name || !svcForm.price}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
