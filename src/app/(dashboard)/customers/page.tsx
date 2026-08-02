"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  UserPlus,
  Download,
  Trash2,
  X,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const statusStyles: Record<string, { badge: string; label: string }> = {
  vip: { badge: "bg-amber-50 text-amber-700", label: "VIP" },
  regular: { badge: "bg-primary-50 text-primary-700", label: "Regular" },
  new: { badge: "bg-sky-50 text-sky-700", label: "New" },
  inactive: { badge: "bg-gray-100 text-gray-600", label: "Inactive" },
};

const colorMap: Record<string, string> = {
  vip: "bg-amber-50 text-amber-600",
  regular: "bg-primary-50 text-primary",
  new: "bg-sky-50 text-sky-600",
  inactive: "bg-gray-100 text-gray-600",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", notes: "" });

  const loadCustomers = () => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadCustomers, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const createCustomer = async () => {
    setFormSubmitting(true);
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      setShowCreateDialog(false);
      setCreateForm({ name: "", email: "", phone: "", notes: "" });
      loadCustomers();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const updateCustomer = async () => {
    setFormSubmitting(true);
    try {
      await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setShowDetailDialog(false);
      loadCustomers();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setShowDetailDialog(false);
    loadCustomers();
  };

  const openDetailDialog = async (c: any) => {
    setSelectedCustomer(c);
    setEditForm({ name: c.name, email: c.email, phone: c.phone || "", notes: "" });
    try {
      const res = await fetch(`/api/customers/${c.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditForm({ name: data.name, email: data.email, phone: data.phone || "", notes: data.notes || "" });
      }
    } catch (_) {}
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer database and relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => {
            const csv = ["Name,Email,Phone,Status,Visits,Total Spent,Last Visit"];
            customers.forEach((c) => csv.push(`${c.name},${c.email},${c.phone || ""},${c.status},${c.visits},${c.totalSpent},${c.lastVisit}`));
            const blob = new Blob([csv.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-export-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={() => { setCreateForm({ name: "", email: "", phone: "", notes: "" }); setShowCreateDialog(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
            <UserPlus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: String(customers.length), change: "+12%", bg: "bg-primary-50" },
          { label: "VIP Customers", value: String(stats.vip || 0), change: "+5%", bg: "bg-amber-50" },
          { label: "Avg. Visit Frequency", value: `${stats.avgVisits || 0}x`, change: "+0.3", bg: "bg-sky-50" },
          { label: "Avg. Spend", value: stats.avgSpend || "$0", change: "+8%", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[13px] text-gray-500">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <span className="text-[12px] text-emerald-600 font-medium">{stat.change}</span>
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
                  ? "bg-primary text-white"
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
                    <p className="text-[13px] text-gray-500 truncate">{customer.email}</p>
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
                  <span className="text-[12px] font-medium text-gray-900">{customer.loyalty}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${customer.loyalty}%`,
                      background: customer.loyalty > 80 ? "#8b5cf6" : customer.loyalty > 50 ? "#0ea5e9" : "#d1d5db",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => openDetailDialog(customer)} className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Edit
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => deleteCustomer(customer.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Add a new customer to your database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Customer name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button onClick={createCustomer} disabled={formSubmitting || !createForm.name} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
                />
              </div>
              <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
                <Button variant="outline" onClick={() => deleteCustomer(selectedCustomer.id)} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button onClick={updateCustomer} disabled={formSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
                  {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
