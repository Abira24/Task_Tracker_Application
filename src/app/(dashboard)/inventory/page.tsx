"use client";

import { useState } from "react";
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

const inventory = [
  {
    id: 1,
    name: "Premium Hair Color Kit",
    category: "Color",
    stock: 24,
    minStock: 10,
    price: "$45.00",
    status: "in-stock",
    supplier: "ColorPro Inc.",
    lastOrdered: "Jul 20, 2026",
  },
  {
    id: 2,
    name: "Professional Shampoo",
    category: "Hair Care",
    stock: 8,
    minStock: 15,
    price: "$12.50",
    status: "low-stock",
    supplier: "HairCare Supply",
    lastOrdered: "Jul 15, 2026",
  },
  {
    id: 3,
    name: "Styling Gel",
    category: "Styling",
    stock: 42,
    minStock: 20,
    price: "$8.99",
    status: "in-stock",
    supplier: "StyleMax",
    lastOrdered: "Jul 18, 2026",
  },
  {
    id: 4,
    name: "Disposable Gloves (Box)",
    category: "Supplies",
    stock: 3,
    minStock: 10,
    price: "$15.00",
    status: "critical",
    supplier: "SafeHands Co.",
    lastOrdered: "Jul 10, 2026",
  },
  {
    id: 5,
    name: "Hair Treatment Mask",
    category: "Hair Care",
    stock: 18,
    minStock: 10,
    price: "$22.00",
    status: "in-stock",
    supplier: "HairCare Supply",
    lastOrdered: "Jul 22, 2026",
  },
  {
    id: 6,
    name: "Nail Polish Set",
    category: "Nails",
    stock: 15,
    minStock: 8,
    price: "$35.00",
    status: "in-stock",
    supplier: "NailArt Pro",
    lastOrdered: "Jul 19, 2026",
  },
  {
    id: 7,
    name: "Facial Cleanser",
    category: "Skin Care",
    stock: 6,
    minStock: 12,
    price: "$18.50",
    status: "low-stock",
    supplier: "GlowSkin Inc.",
    lastOrdered: "Jul 12, 2026",
  },
  {
    id: 8,
    name: "Towels (Pack of 10)",
    category: "Supplies",
    stock: 5,
    minStock: 5,
    price: "$28.00",
    status: "low-stock",
    supplier: "LinenCo",
    lastOrdered: "Jul 8, 2026",
  },
  {
    id: 9,
    name: "Hair Dryer Nozzle",
    category: "Equipment",
    stock: 12,
    minStock: 4,
    price: "$15.99",
    status: "in-stock",
    supplier: "ProTools Ltd.",
    lastOrdered: "Jul 14, 2026",
  },
  {
    id: 10,
    name: "Developer Cream 30 Vol",
    category: "Color",
    stock: 0,
    minStock: 8,
    price: "$9.99",
    status: "out-of-stock",
    supplier: "ColorPro Inc.",
    lastOrdered: "Jul 5, 2026",
  },
];

const statusConfig: Record<string, { badge: string; label: string }> = {
  "in-stock": { badge: "bg-emerald-100 text-emerald-800", label: "In Stock" },
  "low-stock": { badge: "bg-amber-100 text-amber-800", label: "Low Stock" },
  critical: { badge: "bg-red-100 text-red-800", label: "Critical" },
  "out-of-stock": { badge: "bg-gray-100 text-gray-600", label: "Out of Stock" },
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inventory.length,
    inStock: inventory.filter((i) => i.status === "in-stock").length,
    lowStock: inventory.filter((i) => i.status === "low-stock").length,
    critical: inventory.filter(
      (i) => i.status === "critical" || i.status === "out-of-stock"
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage salon supplies and products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4" />
            Reports
          </Button>
          <Button className="gradient-primary">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Items",
            value: stats.total,
            icon: Package,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "In Stock",
            value: stats.inStock,
            icon: TrendingUp,
            color: "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Low Stock",
            value: stats.lowStock,
            icon: TrendingDown,
            color: "bg-amber-100 text-amber-700",
          },
          {
            label: "Critical",
            value: stats.critical,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-700",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Product <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last ordered: {item.lastOrdered}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {item.stock}
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                (item.stock / (item.minStock * 2)) * 100,
                                100
                              )}%`,
                              background:
                                item.stock === 0
                                  ? "#ef4444"
                                  : item.stock < item.minStock
                                  ? "#f59e0b"
                                  : "#10b981",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          min: {item.minStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-sm">
                      {item.price}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] ${statusConfig[item.status].badge}`}
                      >
                        {statusConfig[item.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.supplier}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                        >
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
