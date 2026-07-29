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
  Loader2,
} from "lucide-react";
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

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-500">Track and manage salon supplies and products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
            <BarChart3 className="h-4 w-4" /> Reports
          </Button>
          <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
            <Plus className="h-4 w-4" /> Add Item
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
                    <span className="flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
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
                      <Badge variant="secondary" className="text-[12px] bg-gray-100 text-gray-600">{item.category}</Badge>
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
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(item)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new product to inventory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="Hair Care">Hair Care</option>
                  <option value="Nail Care">Nail Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Tools">Tools</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input value={createForm.supplier} onChange={(e) => setCreateForm({ ...createForm, supplier: e.target.value })} placeholder="Supplier name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min={0} value={createForm.stock} onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" min={1} value={createForm.minStock} onChange={(e) => setCreateForm({ ...createForm, minStock: parseInt(e.target.value) || 5 })} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button onClick={createItem} disabled={formSubmitting || !createForm.name} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update inventory item details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="Hair Care">Hair Care</option>
                  <option value="Nail Care">Nail Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Tools">Tools</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min={0} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" min={1} value={editForm.minStock} onChange={(e) => setEditForm({ ...editForm, minStock: parseInt(e.target.value) || 5 })} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => deleteItem(selectedItem?.id)} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={updateItem} disabled={formSubmitting} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
