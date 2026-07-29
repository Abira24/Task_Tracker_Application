"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Star,
  Calendar,
  DollarSign,
  UserPlus,
  Download,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusStyles: Record<string, { badge: string; label: string }> = {
  vip: { badge: "bg-amber-50 text-amber-700", label: "VIP" },
  regular: { badge: "bg-violet-50 text-violet-700", label: "Regular" },
  new: { badge: "bg-sky-50 text-sky-700", label: "New" },
  inactive: { badge: "bg-gray-100 text-gray-600", label: "Inactive" },
};

const colorMap: Record<string, string> = {
  vip: "bg-amber-50 text-amber-600",
  regular: "bg-violet-50 text-violet-600",
  new: "bg-sky-50 text-sky-600",
  inactive: "bg-gray-100 text-gray-600",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
          <p className="text-gray-500">
            Manage your customer database and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: String(customers.length), change: "+12%", bg: "bg-violet-50" },
          { label: "VIP Customers", value: String(stats.vip || 0), change: "+5%", bg: "bg-amber-50" },
          { label: "Avg. Visit Frequency", value: `${stats.avgVisits || 0}x`, change: "+0.3", bg: "bg-sky-50" },
          { label: "Avg. Spend", value: stats.avgSpend || "$0", change: "+8%", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[13px] text-gray-500">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <span className="text-[12px] text-emerald-600 font-medium">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "vip", "regular", "new", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <Card key={customer.id} className="group border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className={`h-14 w-14 ${colorMap[customer.status] || colorMap.regular} border-0`}>
                  <AvatarFallback className={`${colorMap[customer.status] || colorMap.regular} font-bold text-[15px]`}>
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                    <Badge className={`text-[11px] ${statusStyles[customer.status]?.badge || statusStyles.regular.badge}`}>
                      {statusStyles[customer.status]?.label || statusStyles.regular.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <p className="text-[13px] text-gray-500 truncate">
                      {customer.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[12px] text-gray-500">Visits</p>
                  <p className="font-semibold text-gray-900">{customer.visits}</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Total Spent</p>
                  <p className="font-semibold text-gray-900">{customer.totalSpent}</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Last Visit</p>
                  <p className="font-semibold text-[13px] text-gray-900">{customer.lastVisit}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-gray-500">Loyalty</span>
                  <span className="text-[12px] font-medium text-gray-900">
                    {customer.loyalty}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${customer.loyalty}%`,
                      background:
                        customer.loyalty > 80
                          ? "#8b5cf6"
                          : customer.loyalty > 50
                          ? "#0ea5e9"
                          : "#d1d5db",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Phone className="h-3 w-3" /> Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Calendar className="h-3 w-3" /> Book
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
