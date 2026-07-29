"use client";

import { useState, useEffect } from "react";
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

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
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

  const kpis = data?.kpis || [];
  const revenueData = data?.revenueData || [];
  const serviceBreakdown = data?.serviceBreakdown || [];
  const peakHours = data?.peakHours || [];
  const topStylists = data?.topStylists || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-gray-500">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">This Month</Button>
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any) => (
          <Card key={kpi.title} className="border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-gray-500">{kpi.title}</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-[13px] font-medium ${kpi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                      {kpi.change}
                    </span>
                    <span className="text-[12px] text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50">
                  {kpi.title?.includes("Revenue") && <DollarSign className="h-6 w-6 text-violet-600" />}
                  {kpi.title?.includes("Appointments") && <Calendar className="h-6 w-6 text-sky-600" />}
                  {kpi.title?.includes("Customers") && <Users className="h-6 w-6 text-emerald-600" />}
                  {kpi.title?.includes("Rating") && <Star className="h-6 w-6 text-amber-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-[13px] text-gray-500">Monthly revenue for 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData.map((data: any) => (
                <div key={data.month} className="flex items-center gap-3">
                  <span className="w-8 text-[12px] text-gray-500 font-medium">{data.month}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.min((data.revenue / 50000) * 100, 100)}%` }}
                    >
                      <span className="text-[11px] font-bold text-white">
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <span className="w-16 text-[12px] text-gray-500 text-right">{data.appointments} appts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold text-gray-900">Service Breakdown</CardTitle>
            <CardDescription className="text-[13px] text-gray-500">Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {serviceBreakdown.reduce(
                    (acc: any, service: any, i: number) => {
                      const circumference = 2 * Math.PI * 45;
                      const offset = acc.offset;
                      const length = (service.percentage / 100) * circumference;
                      const colors = ["#8b5cf6", "#0ea5e9", "#ec4899", "#10b981", "#f59e0b"];

                      acc.elements.push(
                        <circle
                          key={i}
                          cx="60"
                          cy="60"
                          r="45"
                          fill="none"
                          stroke={colors[i] || colors[colors.length - 1]}
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
                  <p className="text-2xl font-bold text-gray-900">
                    ${(revenueData.reduce((s: number, r: any) => s + r.revenue, 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="text-[12px] text-gray-500">Total</p>
                </div>
              </div>

              <div className="space-y-2">
                {serviceBreakdown.map((service: any) => (
                  <div key={service.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${service.color || "bg-gray-500"}`} />
                    <span className="flex-1 text-[13px] text-gray-900">{service.name}</span>
                    <span className="text-[13px] font-medium text-gray-900">{service.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <Clock className="h-5 w-5 text-violet-600" />
              Peak Hours
            </CardTitle>
            <CardDescription className="text-[13px] text-gray-500">Average busyness by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {peakHours.map((hour: any) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <span className="w-12 text-[12px] text-gray-500">{hour.hour}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${hour.percentage}%`,
                        background: hour.percentage > 80 ? "#ec4899" : hour.percentage > 60 ? "#8b5cf6" : "#0ea5e9",
                      }}
                    />
                  </div>
                  <span className="w-8 text-[12px] font-medium text-gray-900 text-right">{hour.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              Top Stylists
            </CardTitle>
            <CardDescription className="text-[13px] text-gray-500">Performance rankings this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStylists.map((stylist: any, i: number) => (
                <div key={stylist.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white ${
                    i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-300" : i === 2 ? "bg-amber-600" : "bg-violet-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{stylist.name}</p>
                    <div className="flex items-center gap-3 text-[13px] text-gray-500">
                      <span>{stylist.appointments} appointments</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {stylist.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stylist.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
