"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Star,
  Scissors,
  Eye,
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

const serviceIcons: Record<string, string> = {
  "Hair Coloring": "🎨",
  "Haircut & Styling": "✂️",
  "Full Makeover": "💄",
  "Manicure & Pedicure": "💅",
  "Deep Conditioning": "🧴",
  "Beard Trim & Shave": "🪒",
  "Bridal Updo": "👰",
  "Scalp Treatment": "💆",
};

const serviceColors: Record<string, string> = {
  Color: "bg-primary-50 text-primary",
  Cut: "bg-sky-50 text-sky-600",
  Beauty: "bg-pink-50 text-pink-600",
  Nails: "bg-emerald-50 text-emerald-600",
  Treatment: "bg-amber-50 text-amber-600",
  Grooming: "bg-gray-100 text-gray-600",
  Special: "bg-rose-50 text-rose-600",
};

function ServicesContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const emptyForm = { name: "", description: "", duration: 60, price: 0, category: "Cut" };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadServices = () => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services || []);
        setCategories(data.categories || ["All"]);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadServices, []);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createService = async () => {
    setFormSubmitting(true);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, price: Number(createForm.price), duration: Number(createForm.duration) }),
      });
      setShowCreateDialog(false);
      loadServices();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const updateService = async () => {
    if (!selectedService) return;
    setFormSubmitting(true);
    try {
      await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, price: Number(editForm.price), duration: Number(editForm.duration) }),
      });
      setShowEditDialog(false);
      loadServices();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    loadServices();
  };

  const openEditDialog = (svc: any) => {
    const durationParts = svc.duration?.match(/(\d+)/g);
    const totalMinutes = durationParts ? parseInt(durationParts[0]) * 60 + (parseInt(durationParts[1]) || 0) : 60;
    setSelectedService(svc);
    setEditForm({
      name: svc.name,
      description: svc.description || "",
      duration: totalMinutes,
      price: parseFloat(svc.price?.replace("$", "") || "0"),
      category: svc.category,
    });
    setShowEditDialog(true);
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Services</h1>
          <p className="text-gray-500">Manage your salon services and pricing</p>
        </div>
        <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: String(stats.total || services.length), icon: Scissors, bg: "bg-primary-50", iconColor: "text-primary" },
          { label: "Most Popular", value: stats.mostPopular || "N/A", icon: Star, bg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Avg. Price", value: stats.avgPrice || "$0", icon: DollarSign, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Avg. Duration", value: stats.avgDuration || "0m", icon: Clock, bg: "bg-sky-50", iconColor: "text-sky-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500">{stat.label}</p>
                <p className="font-semibold text-[15px] text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className="group overflow-hidden border-gray-100 shadow-sm rounded-xl">
            <div className={`h-24 ${serviceColors[service.category]?.split(" ")[0] || "bg-gray-50"} flex items-center justify-center relative`}>
              <span className="text-4xl">{serviceIcons[service.name] || "✂️"}</span>
              {service.popular && (
                <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 text-[11px] rounded-xl">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" /> Popular
                </Badge>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[15px] text-gray-900">{service.name}</h3>
                  <Badge variant="secondary" className="text-[11px] mt-1 bg-gray-100 text-gray-600">{service.category}</Badge>
                </div>
                <p className="text-2xl font-bold text-primary">{service.price}</p>
              </div>
              <p className="text-[13px] text-gray-500 mb-4">{service.description}</p>
              <div className="flex items-center gap-4 text-[13px] text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {service.duration}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {service.rating}</span>
                <span>{service.bookings} bookings</span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(service)} className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Edit className="h-3 w-3" /> Edit
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
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
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>Add a new service to your salon menu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Service name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
                placeholder="Brief description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" min={15} step={15} value={createForm.duration} onChange={(e) => setCreateForm({ ...createForm, duration: parseInt(e.target.value) || 60 })} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                {categories.filter(c => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button onClick={createService} disabled={formSubmitting || !createForm.name} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" min={15} step={15} value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 60 })} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min={0} step={0.01} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white"
              >
                {categories.filter(c => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => deleteService(selectedService?.id)} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={updateService} disabled={formSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <ServicesContent />
    </Suspense>
  );
}
