"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
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

const statusConfig: Record<string, { badge: string; label: string }> = {
  "in-stock": { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "In Stock" },
  "low-stock": { badge: "bg-amber-50 text-amber-700 border border-amber-200/60", label: "Low Stock" },
  critical: { badge: "bg-red-50 text-red-700 border border-red-200/60", label: "Critical" },
  "out-of-stock": { badge: "bg-gray-100 text-gray-600 border border-gray-200/60", label: "Out of Stock" },
};

function InventoryContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [loading, setLoading] = useState(true);
  const [dismissedCritical, setDismissedCritical] = useState<Set<string>>(new Set());

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const emptyForm = { name: "", category: "Hair Care", stock: 10, minStock: 5, price: 0, supplier: "" };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadItems = () => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalItems = items.filter((item) => item.stock <= item.minStock && !dismissedCritical.has(item.id));
  const hasCritical = criticalItems.length > 0;

  const createItem = async () => {
    setFormSubmitting(true);
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          stock: Number(createForm.stock),
          minStock: Number(createForm.minStock),
          price: Number(createForm.price),
        }),
      });
      setShowCreateDialog(false);
      loadItems();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const updateItem = async () => {
    if (!selectedItem) return;
    setFormSubmitting(true);
    try {
      await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          stock: Number(editForm.stock),
          minStock: Number(editForm.minStock),
          price: Number(editForm.price),
        }),
      });
      setShowEditDialog(false);
      loadItems();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    setShowEditDialog(false);
    loadItems();
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      price: parseFloat(item.price?.replace("$", "") || "0"),
      supplier: item.supplier || "",
    });
    setShowEditDialog(true);
  };

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
          <p className="text-[13px] text-gray-500 mt-0.5">Track and manage salon supplies and products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer text-[13px] h-9" onClick={() => {
            const data = items.map((item) => ({
              "Product Name": item.name,
              Category: item.category,
              Stock: item.stock,
              "Min Stock": item.minStock,
              Price: item.price,
              Supplier: item.supplier || "",
              Status: item.status === "in-stock" ? "In Stock" : item.status === "low-stock" ? "Low Stock" : item.status === "critical" ? "Critical" : "Out of Stock",
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            ws["!cols"] = [
              { wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 12 },
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Inventory");
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            XLSX.writeFile(wb, `inventory-report-${dateStr}.xlsx`);
          }}>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer text-[13px] h-9">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats.total || 0, icon: Package, bg: "bg-gray-100", iconColor: "text-gray-600" },
          { label: "In Stock", value: stats.inStock || 0, icon: TrendingUp, bg: "bg-emerald-100", iconColor: "text-emerald-600" },
          { label: "Low Stock", value: stats.lowStock || 0, icon: TrendingDown, bg: "bg-amber-100", iconColor: "text-amber-600" },
          { label: "Critical", value: stats.critical || 0, icon: AlertTriangle, bg: "bg-red-100", iconColor: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-200/60 shadow-xs rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasCritical && (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[13px] text-red-800">
                  Low Stock Alert — {criticalItems.length} {criticalItems.length === 1 ? "item" : "items"} need attention
                </h3>
                <button
                  onClick={() => setDismissedCritical(new Set(criticalItems.map((i) => i.id)))}
                  className="text-[11px] text-red-500 hover:text-red-700 font-medium cursor-pointer shrink-0 ml-4"
                >
                  Dismiss all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-red-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <Package className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[12px] text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-semibold ${item.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                          {item.stock} left
                        </span>
                        <span className="text-[10px] text-gray-400">min: {item.minStock}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissedCritical((prev) => new Set([...prev, item.id]))}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer shrink-0"
                    >
                      <span className="sr-only">Dismiss</span>
                      <span className="text-[16px] leading-none">&times;</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg border-gray-200 text-[13px] h-9 bg-gray-50/50 focus:bg-white transition-colors"
        />
      </div>

      <Card className="border-gray-200/60 shadow-xs rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/80 bg-muted/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">Product <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-[13px] text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Last ordered: {item.lastOrdered}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-[11px] bg-gray-100 text-gray-600 border-0 rounded-md">{item.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
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
                        <span className="text-[11px] text-gray-400">min: {item.minStock}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[13px] text-gray-900">{item.price}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={`text-[11px] font-medium rounded-md ${statusConfig[item.status]?.badge || statusConfig["in-stock"].badge}`}>
                        {statusConfig[item.status]?.label || statusConfig["in-stock"].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">{item.supplier}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(item)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-lg">
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Add Inventory Item</DialogTitle>
            <DialogDescription className="text-[13px]">Add a new product to inventory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Product name" className="text-[13px] rounded-lg h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Category</Label>
                <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] bg-white">
                  <option value="Hair Care">Hair Care</option>
                  <option value="Nail Care">Nail Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Tools">Tools</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Supplier</Label>
                <Input value={createForm.supplier} onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })} placeholder="Supplier name" className="text-[13px] rounded-lg h-9" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Stock</Label>
                <Input type="number" min={0} value={createForm.stock} onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value) || 0 })} className="text-[13px] rounded-lg h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Min Stock</Label>
                <Input type="number" min={1} value={createForm.minStock} onChange={(e) => setCreateForm({ ...createForm, minStock: parseInt(e.target.value) || 5 })} className="text-[13px] rounded-lg h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })} className="text-[13px] rounded-lg h-9" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-lg text-[13px] h-9 cursor-pointer">Cancel</Button>
            <Button onClick={createItem} disabled={formSubmitting || !createForm.name} className="bg-primary hover:bg-primary/90 text-white rounded-lg text-[13px] h-9 cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Edit Inventory Item</DialogTitle>
            <DialogDescription className="text-[13px]">Update inventory item details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="text-[13px] rounded-lg h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Category</Label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] bg-white">
                  <option value="Hair Care">Hair Care</option>
                  <option value="Nail Care">Nail Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Tools">Tools</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Supplier</Label>
                <Input value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} className="text-[13px] rounded-lg h-9" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Stock</Label>
                <Input type="number" min={0} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })} className="text-[13px] rounded-lg h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Min Stock</Label>
                <Input type="number" min={1} value={editForm.minStock} onChange={(e) => setEditForm({ ...editForm, minStock: parseInt(e.target.value) || 5 })} className="text-[13px] rounded-lg h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} className="text-[13px] rounded-lg h-9" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => deleteItem(selectedItem?.id)} className="rounded-lg text-[13px] h-9 text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={updateItem} disabled={formSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-lg text-[13px] h-9 cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <InventoryContent />
    </Suspense>
  );
}
