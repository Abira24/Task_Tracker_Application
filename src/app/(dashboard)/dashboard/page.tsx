"use client";

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: "$48,295",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    gradient: "gradient-primary",
  },
  {
    title: "Appointments",
    value: "128",
    change: "+8.2%",
    trend: "up",
    icon: Calendar,
    gradient: "gradient-cool",
  },
  {
    title: "Active Customers",
    value: "856",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    gradient: "gradient-accent",
  },
  {
    title: "Avg. Rating",
    value: "4.9",
    change: "+0.3",
    trend: "up",
    icon: Star,
    gradient: "gradient-warm",
  },
];

const todayAppointments = [
  {
    id: 1,
    client: "Sarah Johnson",
    service: "Hair Coloring",
    time: "9:00 AM",
    stylist: "Emma Wilson",
    status: "confirmed",
    duration: "2h 30m",
  },
  {
    id: 2,
    client: "Mike Chen",
    service: "Beard Trim & Shave",
    time: "10:30 AM",
    stylist: "James Brown",
    status: "in-progress",
    duration: "45m",
  },
  {
    id: 3,
    client: "Lisa Anderson",
    service: "Full Makeover",
    time: "11:00 AM",
    stylist: "Sophia Lee",
    status: "confirmed",
    duration: "3h",
  },
  {
    id: 4,
    client: "Tom Williams",
    service: "Haircut",
    time: "1:00 PM",
    stylist: "Emma Wilson",
    status: "pending",
    duration: "30m",
  },
  {
    id: 5,
    client: "Anna Martinez",
    service: "Manicure & Pedicure",
    time: "2:30 PM",
    stylist: "Mia Garcia",
    status: "confirmed",
    duration: "1h 15m",
  },
];

const recentCustomers = [
  { name: "Emily Davis", visits: 12, spent: "$1,240", lastVisit: "2 days ago" },
  { name: "Robert Kim", visits: 8, spent: "$890", lastVisit: "1 week ago" },
  { name: "Maria Santos", visits: 15, spent: "$2,100", lastVisit: "3 days ago" },
  { name: "David Lee", visits: 5, spent: "$450", lastVisit: "Today" },
];

const topServices = [
  { name: "Hair Coloring", bookings: 45, revenue: "$8,550", icon: "🎨" },
  { name: "Haircut & Styling", bookings: 38, revenue: "$3,420", icon: "✂️" },
  { name: "Full Makeover", bookings: 22, revenue: "$6,600", icon: "💄" },
  { name: "Manicure & Pedicure", bookings: 30, revenue: "$2,700", icon: "💅" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  "in-progress": "bg-sky-100 text-sky-800",
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-violet-100 text-violet-800",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good Morning, Jane
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at your salon today
          </p>
        </div>
        <Button className="gradient-primary hidden sm:flex">
          <Calendar className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription>5 appointments scheduled</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    {apt.time.split(" ")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{apt.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.service} · {apt.stylist}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{apt.duration}</p>
                    <Badge
                      className={`text-[10px] ${statusColors[apt.status]}`}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Services</CardTitle>
              <CardDescription>This month</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, i) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.bookings} bookings
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{service.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>Top spending customers</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCustomers.map((customer, i) => (
                <div
                  key={customer.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white font-bold text-sm">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.visits} visits · Last: {customer.lastVisit}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{customer.spent}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions & performance */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Calendar,
                  label: "Book Appointment",
                  color: "bg-violet-100 text-violet-700",
                },
                {
                  icon: Users,
                  label: "Add Customer",
                  color: "bg-sky-100 text-sky-700",
                },
                {
                  icon: Scissors,
                  label: "Add Service",
                  color: "bg-pink-100 text-pink-700",
                },
                {
                  icon: TrendingUp,
                  label: "View Reports",
                  color: "bg-emerald-100 text-emerald-700",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:bg-muted/50 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${action.color}`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
