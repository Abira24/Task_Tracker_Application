"use client";

import { useState } from "react";
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

const customers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    visits: 24,
    totalSpent: "$3,200",
    lastVisit: "2 days ago",
    status: "vip",
    loyalty: 95,
    favorite: "Hair Coloring",
    initials: "SJ",
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@example.com",
    phone: "+1 (555) 234-5678",
    visits: 18,
    totalSpent: "$1,890",
    lastVisit: "1 week ago",
    status: "regular",
    loyalty: 78,
    favorite: "Beard Trim",
    initials: "MC",
    color: "bg-sky-50 text-sky-600",
  },
  {
    id: 3,
    name: "Lisa Anderson",
    email: "lisa@example.com",
    phone: "+1 (555) 345-6789",
    visits: 32,
    totalSpent: "$5,100",
    lastVisit: "3 days ago",
    status: "vip",
    loyalty: 98,
    favorite: "Full Makeover",
    initials: "LA",
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: 4,
    name: "Tom Williams",
    email: "tom@example.com",
    phone: "+1 (555) 456-7890",
    visits: 8,
    totalSpent: "$640",
    lastVisit: "2 weeks ago",
    status: "new",
    loyalty: 42,
    favorite: "Haircut",
    initials: "TW",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 5,
    name: "Anna Martinez",
    email: "anna@example.com",
    phone: "+1 (555) 567-8901",
    visits: 15,
    totalSpent: "$2,340",
    lastVisit: "5 days ago",
    status: "regular",
    loyalty: 65,
    favorite: "Manicure",
    initials: "AM",
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: 6,
    name: "Robert Kim",
    email: "robert@example.com",
    phone: "+1 (555) 678-9012",
    visits: 5,
    totalSpent: "$450",
    lastVisit: "1 month ago",
    status: "inactive",
    loyalty: 28,
    favorite: "Haircut",
    initials: "RK",
    color: "bg-gray-100 text-gray-600",
  },
  {
    id: 7,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 789-0123",
    visits: 28,
    totalSpent: "$4,200",
    lastVisit: "1 day ago",
    status: "vip",
    loyalty: 92,
    favorite: "Hair Coloring",
    initials: "ED",
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: 8,
    name: "David Lee",
    email: "david@example.com",
    phone: "+1 (555) 890-1234",
    visits: 12,
    totalSpent: "$1,560",
    lastVisit: "4 days ago",
    status: "regular",
    loyalty: 70,
    favorite: "Beard Trim",
    initials: "DL",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const statusStyles: Record<string, { badge: string; label: string }> = {
  vip: { badge: "bg-amber-50 text-amber-700", label: "VIP" },
  regular: { badge: "bg-violet-50 text-violet-700", label: "Regular" },
  new: { badge: "bg-sky-50 text-sky-700", label: "New" },
  inactive: { badge: "bg-gray-100 text-gray-600", label: "Inactive" },
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "856", change: "+12%", bg: "bg-violet-50" },
          { label: "VIP Customers", value: "42", change: "+5%", bg: "bg-amber-50" },
          { label: "Avg. Visit Frequency", value: "2.4x", change: "+0.3", bg: "bg-sky-50" },
          { label: "Avg. Spend", value: "$186", change: "+8%", bg: "bg-emerald-50" },
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

      {/* Search and filters */}
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

      {/* Customer grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <Card key={customer.id} className="group border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar
                  className={`h-14 w-14 ${customer.color} border-0`}
                >
                  <AvatarFallback className={`${customer.color} font-bold text-[15px]`}>
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                    <Badge
                      className={`text-[11px] ${statusStyles[customer.status].badge}`}
                    >
                      {statusStyles[customer.status].label}
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

              {/* Loyalty bar */}
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
