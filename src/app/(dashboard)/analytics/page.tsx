"use client";

import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Scissors,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
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

const revenueData = [
  { month: "Jan", revenue: 32000, appointments: 98 },
  { month: "Feb", revenue: 35000, appointments: 105 },
  { month: "Mar", revenue: 38000, appointments: 112 },
  { month: "Apr", revenue: 42000, appointments: 120 },
  { month: "May", revenue: 40000, appointments: 115 },
  { month: "Jun", revenue: 45000, appointments: 128 },
  { month: "Jul", revenue: 48295, appointments: 135 },
];

const topStylists = [
  { name: "Emma Wilson", revenue: "$12,450", appointments: 42, rating: 4.9 },
  { name: "Sophia Lee", revenue: "$10,890", appointments: 38, rating: 4.8 },
  { name: "James Brown", revenue: "$8,670", appointments: 32, rating: 4.7 },
  { name: "Mia Garcia", revenue: "$7,230", appointments: 28, rating: 4.9 },
];

const peakHours = [
  { hour: "9 AM", percentage: 45 },
  { hour: "10 AM", percentage: 72 },
  { hour: "11 AM", percentage: 88 },
  { hour: "12 PM", percentage: 65 },
  { hour: "1 PM", percentage: 78 },
  { hour: "2 PM", percentage: 82 },
  { hour: "3 PM", percentage: 70 },
  { hour: "4 PM", percentage: 60 },
  { hour: "5 PM", percentage: 35 },
];

const serviceBreakdown = [
  { name: "Hair Coloring", percentage: 35, revenue: "$16,903", color: "bg-violet-500" },
  { name: "Haircut & Styling", percentage: 25, revenue: "$12,074", color: "bg-sky-500" },
  { name: "Full Makeover", percentage: 20, revenue: "$9,659", color: "bg-pink-500" },
  { name: "Manicure & Pedicure", percentage: 12, revenue: "$5,795", color: "bg-emerald-500" },
  { name: "Other Services", percentage: 8, revenue: "$3,864", color: "bg-amber-500" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">This Month</Button>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Revenue",
            value: "$48,295",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            gradient: "gradient-primary",
          },
          {
            title: "Total Appointments",
            value: "135",
            change: "+8.2%",
            trend: "up",
            icon: Calendar,
            gradient: "gradient-cool",
          },
          {
            title: "New Customers",
            value: "42",
            change: "+15.3%",
            trend: "up",
            icon: Users,
            gradient: "gradient-accent",
          },
          {
            title: "Avg. Rating",
            value: "4.85",
            change: "+0.12",
            trend: "up",
            icon: Star,
            gradient: "gradient-warm",
          },
        ].map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        kpi.trend === "up" ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${kpi.gradient} shadow-lg`}
                >
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue for 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData.map((data) => (
                <div key={data.month} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground font-medium">
                    {data.month}
                  </span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(data.revenue / 50000) * 100}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <span className="w-16 text-xs text-muted-foreground text-right">
                    {data.appointments} appts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Donut chart placeholder */}
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {serviceBreakdown.reduce(
                    (acc, service, i) => {
                      const circumference = 2 * Math.PI * 45;
                      const offset = acc.offset;
                      const length = (service.percentage / 100) * circumference;

                      acc.elements.push(
                        <circle
                          key={i}
                          cx="60"
                          cy="60"
                          r="45"
                          fill="none"
                          stroke={
                            i === 0
                              ? "#8b5cf6"
                              : i === 1
                              ? "#0ea5e9"
                              : i === 2
                              ? "#ec4899"
                              : i === 3
                              ? "#10b981"
                              : "#f59e0b"
                          }
                          strokeWidth="12"
                          strokeDasharray={`${length} ${circumference - length}`}
                          strokeDashoffset={`${-offset}`}
                          strokeLinecap="round"
                        />
                      );

                      acc.offset += length;
                      return acc;
                    },
                    { elements: [] as React.ReactNode[], offset: 0 }
                  ).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold">$48.3k</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <div className="space-y-2">
                {serviceBreakdown.map((service) => (
                  <div key={service.name} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${service.color}`}
                    />
                    <span className="flex-1 text-sm">{service.name}</span>
                    <span className="text-sm font-medium">
                      {service.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Peak Hours
            </CardTitle>
            <CardDescription>Average busyness by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {peakHours.map((hour) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <span className="w-12 text-xs text-muted-foreground">
                    {hour.hour}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${hour.percentage}%`,
                        background:
                          hour.percentage > 80
                            ? "linear-gradient(90deg, #ec4899, #ef4444)"
                            : hour.percentage > 60
                            ? "linear-gradient(90deg, #8b5cf6, #ec4899)"
                            : "linear-gradient(90deg, #06b6d4, #3b82f6)",
                      }}
                    />
                  </div>
                  <span className="w-8 text-xs font-medium text-right">
                    {hour.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top stylists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Stylists
            </CardTitle>
            <CardDescription>Performance rankings this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStylists.map((stylist, i) => (
                <div
                  key={stylist.name}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white ${
                      i === 0
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : i === 1
                        ? "bg-gradient-to-br from-gray-300 to-gray-400"
                        : i === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-700"
                        : "bg-gradient-to-br from-violet-500 to-purple-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{stylist.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{stylist.appointments} appointments</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {stylist.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{stylist.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
