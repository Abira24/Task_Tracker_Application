"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([statsData, userData]) => {
        setData(statsData);
        setUser(userData.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
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
        <Button className="bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 rounded-xl font-semibold text-sm px-4 h-10 hidden sm:flex">
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
                  {stat.title === "Active Customers" && <Users className="h-5 w-5 text-violet-600" />}
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
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 text-[13px] font-medium">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {todayAppointments.map((apt: any) => (
                <div
                  key={apt.id}
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
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 text-[13px] font-medium">
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
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-[11px]">
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
              {[
                { icon: Calendar, label: "Book Appointment", color: "bg-violet-50 text-violet-600" },
                { icon: Users, label: "Add Customer", color: "bg-blue-50 text-blue-600" },
                { icon: Scissors, label: "Add Service", color: "bg-pink-50 text-pink-600" },
                { icon: TrendingUp, label: "View Reports", color: "bg-emerald-50 text-emerald-600" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer"
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
