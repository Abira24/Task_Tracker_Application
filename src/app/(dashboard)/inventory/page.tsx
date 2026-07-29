"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
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

const statusConfig: Record<string, { badge: string; label: string }> = {
  "in-stock": { badge: "bg-emerald-50 text-emerald-700", label: "In Stock" },
  "low-stock": { badge: "bg-amber-50 text-amber-700", label: "Low Stock" },
  critical: { badge: "bg-red-50 text-red-700", label: "Critical" },
  "out-of-stock": { badge: "bg-gray-100 text-gray-600", label: "Out of Stock" },
};

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="text-gray-500">
            Track and manage salon supplies and products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
            <BarChart3 className="h-4 w-4" />
            Reports
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats.total || 0, icon: Package, bg: "bg-violet-50", iconColor: "text-violet-600" },
          { label: "In Stock", value: stats.inStock || 0, icon: TrendingUp, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Low Stock", value: stats.lowStock || 0, icon: TrendingDown, bg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Critical", value: stats.critical || 0, icon: AlertTriangle, bg: "bg-red-50", iconColor: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl border-gray-200"
        />
      </div>

      <Card className="border-gray-100 shadow-sm rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      Product <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="text-right px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[13px] text-gray-900">{item.name}</p>
                          <p className="text-[12px] text-gray-500">Last ordered: {item.lastOrdered}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[12px] bg-gray-100 text-gray-600">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-gray-900">{item.stock}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                              background: item.stock === 0 ? "#ef4444" : item.stock < item.minStock ? "#f59e0b" : "#10b981",
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">min: {item.minStock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[13px] text-gray-900">{item.price}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-[11px] ${statusConfig[item.status]?.badge || statusConfig["in-stock"].badge}`}>
                        {statusConfig[item.status]?.label || statusConfig["in-stock"].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">{item.supplier}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
