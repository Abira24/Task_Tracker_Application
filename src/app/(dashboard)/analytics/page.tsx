"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin-guard";
import {
  DollarSign,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Scissors,
  User,
  Loader2,
  BarChart3,
  Package,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmed", color: "text-emerald-600", bg: "bg-emerald-50" },
  "in-progress": { label: "In Progress", color: "text-sky-600", bg: "bg-sky-50" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
  completed: { label: "Completed", color: "text-primary", bg: "bg-primary-50" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50" },
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportDailySummary = () => {
    if (!data?.daily) return;
    setExporting(true);
    try {
      const d = data.daily;
      const wb = XLSX.utils.book_new();

      const summaryData = [
        { Metric: "Date", Value: d.date },
        { Metric: "Revenue", Value: `$${d.revenue.toLocaleString()}` },
        { Metric: "Total Appointments", Value: d.appointmentsCount },
        { Metric: "Confirmed", Value: d.statusCounts?.confirmed || 0 },
        { Metric: "In Progress", Value: d.statusCounts?.["in-progress"] || 0 },
        { Metric: "Pending", Value: d.statusCounts?.pending || 0 },
        { Metric: "Completed", Value: d.statusCounts?.completed || 0 },
        { Metric: "Cancelled", Value: d.statusCounts?.cancelled || 0 },
      ];
      const ws1 = XLSX.utils.json_to_sheet(summaryData);
      ws1["!cols"] = [{ wch: 22 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Summary");

      if (d.appointments?.length) {
        const ws2 = XLSX.utils.json_to_sheet(d.appointments.map((a: any) => ({
          Client: a.client,
          Service: a.service,
          Stylist: a.stylist,
          Start: a.startTime,
          End: a.endTime,
          Status: statusConfig[a.status]?.label || a.status,
          Price: `$${a.price || 0}`,
        })));
        ws2["!cols"] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Appointments");
      }

      if (d.stylistPerformance?.length) {
        const ws3 = XLSX.utils.json_to_sheet(d.stylistPerformance.map((s: any) => ({
          Stylist: s.name,
          Appointments: s.appointments,
          Revenue: `$${s.revenue.toLocaleString()}`,
        })));
        ws3["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws3, "Stylists");
      }

      if (d.serviceBreakdown?.length) {
        const ws4 = XLSX.utils.json_to_sheet(d.serviceBreakdown.map((s: any) => ({
          Service: s.name,
          Count: s.count,
          Revenue: `$${s.revenue.toLocaleString()}`,
        })));
        ws4["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws4, "Services");
      }

      XLSX.writeFile(wb, `daily-summary-${d.date}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const daily = data?.daily;
  const totals = data?.totals;
  const revenueData = data?.revenueData || [];
  const serviceBreakdown = data?.serviceBreakdown || [];
  const peakHours = data?.peakHours || [];
  const topStylists = data?.topStylists || [];

  return (
    <AdminGuard>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
          <p className="text-gray-500 text-[13px]">Business insights and daily operations</p>
        </div>
        <Button
          onClick={exportDailySummary}
          disabled={exporting || !daily}
          className="bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer shadow-sm shadow-primary/20"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <FileSpreadsheet className="h-4 w-4 mr-1.5" />}
          Export Daily Summary
        </Button>
      </div>

      {/* Daily Summary */}
      {daily && (
        <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-[16px]">Today&apos;s Summary</h2>
                <p className="text-white/70 text-[13px]">
                  {new Date(daily.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                <DollarSign className="h-5 w-5 text-white" />
                <span className="text-white font-bold text-xl">${daily.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            {/* Status cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total", value: daily.appointmentsCount, bg: "bg-gray-100", text: "text-gray-700" },
                { label: "Confirmed", value: daily.statusCounts?.confirmed || 0, bg: "bg-emerald-50", text: "text-emerald-700" },
                { label: "In Progress", value: daily.statusCounts?.["in-progress"] || 0, bg: "bg-sky-50", text: "text-sky-700" },
                { label: "Completed", value: daily.statusCounts?.completed || 0, bg: "bg-primary-50", text: "text-primary-700" },
                { label: "Pending", value: daily.statusCounts?.pending || 0, bg: "bg-amber-50", text: "text-amber-700" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                  <p className={`text-[11px] font-medium ${s.text}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Today's appointments */}
            {daily.appointments?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[14px] text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Appointments
                </h3>
                <div className="space-y-2">
                  {daily.appointments.map((apt: any) => {
                    const st = statusConfig[apt.status] || statusConfig.pending;
                    return (
                      <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                          style={{ backgroundColor: apt.stylistColor || "#8b5cf6" }}
                        >
                          {apt.startTime?.split(" ")[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[13px] text-gray-900">{apt.client}</p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${st.bg} ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> {apt.service}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {apt.stylist}</span>
                            <span>{apt.startTime} – {apt.endTime}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-[13px] text-gray-900 shrink-0">${apt.price || 0}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {daily.appointments?.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No appointments scheduled for today</p>
              </div>
            )}

            {/* Stylist & Service breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {daily.stylistPerformance?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[14px] text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Stylists Today
                  </h3>
                  <div className="space-y-2">
                    {daily.stylistPerformance.map((s: any) => (
                      <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: s.color }}>
                          {s.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="flex-1 font-medium text-[13px] text-gray-900">{s.name}</span>
                        <div className="text-right">
                          <p className="font-semibold text-[13px] text-gray-900">${s.revenue.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500">{s.appointments} appts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {daily.serviceBreakdown?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[14px] text-gray-900 mb-3 flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-primary" /> Services Today
                  </h3>
                  <div className="space-y-2">
                    {daily.serviceBreakdown.map((s: any) => (
                      <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <Scissors className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[13px] text-gray-900">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.count} bookings</p>
                        </div>
                        <span className="font-semibold text-[13px] text-gray-900">${s.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500">All-Time Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(totals?.revenue || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{totals?.appointments || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totals?.customers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend + Service Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData.map((rd: any) => (
                <div key={rd.month} className="flex items-center gap-3">
                  <span className="w-8 text-[12px] text-gray-500 font-medium">{rd.month}</span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.min((rd.revenue / Math.max(...revenueData.map((r: any) => r.revenue || 1))) * 100, 100)}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">
                        ${rd.revenue >= 1000 ? `${(rd.revenue / 1000).toFixed(1)}k` : rd.revenue}
                      </span>
                    </div>
                  </div>
                  <span className="w-16 text-[11px] text-gray-500 text-right">{rd.appointments} appts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold text-gray-900">Service Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceBreakdown.map((s: any) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-700 font-medium">{s.name}</span>
                    <span className="text-[12px] font-bold text-gray-900">{s.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${s.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours + Top Stylists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <Clock className="h-5 w-5 text-primary" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {peakHours.map((hour: any) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <span className="w-12 text-[11px] text-gray-500">{hour.hour}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${hour.percentage}%`,
                        backgroundColor: hour.percentage > 80 ? "var(--primary)" : hour.percentage > 60 ? "color-mix(in srgb, var(--primary) 70%, transparent)" : "color-mix(in srgb, var(--primary) 40%, transparent)",
                      }}
                    />
                  </div>
                  <span className="w-8 text-[11px] font-medium text-gray-900 text-right">{hour.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Stylists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStylists.map((stylist: any, i: number) => (
                <div key={stylist.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-600 text-[12px] shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px] text-gray-900">{stylist.name}</p>
                    <p className="text-[11px] text-gray-500">{stylist.appointments} appointments</p>
                  </div>
                  <p className="font-bold text-[14px] text-gray-900">{stylist.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  );
}
