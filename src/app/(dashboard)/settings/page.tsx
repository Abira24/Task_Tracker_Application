"use client";

import { useState, useEffect } from "react";
import {
  Store,
  Palette,
  Users,
  Bell,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Scissors,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type SettingsTab = "salon" | "appearance" | "stylists" | "notifications";

const colorPalettes = [
  { name: "Purple", value: "#be2ed6", light: "#f5e6f8", ring: "ring-purple-500" },
  { name: "Violet", value: "#8b5cf6", light: "#ede9fe", ring: "ring-violet-500" },
  { name: "Blue", value: "#3b82f6", light: "#dbeafe", ring: "ring-blue-500" },
  { name: "Sky", value: "#0ea5e9", light: "#e0f2fe", ring: "ring-sky-500" },
  { name: "Emerald", value: "#10b981", light: "#d1fae5", ring: "ring-emerald-500" },
  { name: "Rose", value: "#f43f5e", light: "#ffe4e6", ring: "ring-rose-500" },
  { name: "Amber", value: "#f59e0b", light: "#fef3c7", ring: "ring-amber-500" },
  { name: "Orange", value: "#f97316", light: "#ffedd5", ring: "ring-orange-500" },
];

const stylistColors = [
  "#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b",
  "#f43f5e", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("salon");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Salon info
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<string | null>(null);

  // Theme
  const [primaryColor, setPrimaryColor] = useState("#be2ed6");
  const [mode, setMode] = useState<"light" | "dark">("light");

  // Stylists
  const [stylists, setStylists] = useState<any[]>([]);
  const [showAddStylist, setShowAddStylist] = useState(false);
  const [newStylist, setNewStylist] = useState({ name: "", email: "", phone: "", color: "#8b5cf6" });

  // Notifications
  const [notifications, setNotifications] = useState({
    newAppointment: true,
    reminders: true,
    lowInventory: true,
    newCustomer: true,
    dailyRevenue: true,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/stylists").then((r) => r.json()),
    ])
      .then(([settingsData, stylistData]) => {
        const s = settingsData.settings || {};
        setSalonName(s.salonName || "Muvi Salon");
        setPhone(s.phone || "");
        setEmail(s.email || "");
        setWebsite(s.website || "");
        setAddress(s.address || "");
        setLogo(s.logo || null);
        if (s.notifications) {
          const n = typeof s.notifications === "string" ? JSON.parse(s.notifications) : s.notifications;
          setNotifications(n);
        }
        if (s.theme) {
          const t = typeof s.theme === "string" ? JSON.parse(s.theme) : s.theme;
          setPrimaryColor(t.primaryColor || "#be2ed6");
          setMode(t.mode || "light");
        }
        setStylists(stylistData.stylists || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const applyTheme = (color: string, m: string) => {
    if (m === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Update --primary so all Tailwind primary-* utilities pick it up
    document.documentElement.style.setProperty("--primary", color);
    // Generate shades dynamically
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const shade = (pct: number) => {
      const nr = Math.round(r + (255 - r) * pct);
      const ng = Math.round(g + (255 - g) * pct);
      const nb = Math.round(b + (255 - b) * pct);
      return `rgb(${nr}, ${ng}, ${nb})`;
    };
    const darkShade = (pct: number) => {
      const nr = Math.round(r * (1 - pct));
      const ng = Math.round(g * (1 - pct));
      const nb = Math.round(b * (1 - pct));
      return `rgb(${nr}, ${ng}, ${nb})`;
    };
    document.documentElement.style.setProperty("--color-primary-50", shade(0.95));
    document.documentElement.style.setProperty("--color-primary-100", shade(0.9));
    document.documentElement.style.setProperty("--color-primary-200", shade(0.8));
    document.documentElement.style.setProperty("--color-primary-300", shade(0.6));
    document.documentElement.style.setProperty("--color-primary-400", shade(0.3));
    document.documentElement.style.setProperty("--color-primary-500", color);
    document.documentElement.style.setProperty("--color-primary-600", darkShade(0.15));
    document.documentElement.style.setProperty("--color-primary-700", darkShade(0.3));
    document.documentElement.style.setProperty("--color-primary-800", darkShade(0.45));
    // Notify other components (sidebar, header) to re-read settings
    window.dispatchEvent(new Event("settings-updated"));
  };

  const saveSettings = async (extra?: Record<string, any>) => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonName, phone, email, website, address, logo,
          notifications,
          theme: { primaryColor, mode },
          ...extra,
        }),
      });
      applyTheme(primaryColor, mode);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addStylist = async () => {
    if (!newStylist.name || !newStylist.email) return;
    try {
      const res = await fetch("/api/stylists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStylist),
      });
      const data = await res.json();
      if (data.success) {
        setStylists((prev) => [...prev, { id: data.id, ...newStylist, isActive: 1 }]);
        setNewStylist({ name: "", email: "", phone: "", color: "#8b5cf6" });
        setShowAddStylist(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteStylist = async (id: string) => {
    if (!confirm("Remove this stylist?")) return;
    try {
      await fetch(`/api/stylists/${id}`, { method: "DELETE" });
      setStylists((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { icon: Store, label: "Salon Info", id: "salon" as const },
    { icon: Palette, label: "Appearance", id: "appearance" as const },
    { icon: Scissors, label: "Stylists", id: "stylists" as const },
    { icon: Bell, label: "Notifications", id: "notifications" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 text-[13px]">Manage your salon preferences and team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="h-fit border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-primary-50 text-primary"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Salon Info */}
          {activeTab === "salon" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Salon Information</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">
                  Update your salon details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                      <Camera className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-[14px]">Salon Logo</p>
                    <p className="text-[12px] text-gray-500">JPG, PNG. Max 2MB. Click to change.</p>
                    {logo && (
                      <button
                        onClick={() => setLogo(null)}
                        className="text-[12px] text-red-500 hover:text-red-700 mt-1 cursor-pointer"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Contact info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] text-gray-700">Salon Name</Label>
                    <Input value={salonName} onChange={(e) => setSalonName(e.target.value)} className="rounded-xl text-[13px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-gray-700">Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="rounded-xl text-[13px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-gray-700">Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@salon.com" className="rounded-xl text-[13px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-gray-700">Website</Label>
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.salon.com" className="rounded-xl text-[13px]" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[13px] text-gray-700">Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Beauty Street, City" className="rounded-xl text-[13px]" />
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Business hours */}
                <div>
                  <h3 className="font-semibold text-[14px] text-gray-900 mb-3">Business Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="text-[13px] font-medium text-gray-900">{day}</span>
                        {day === "Sunday" ? (
                          <span className="text-[12px] text-gray-400 italic">Closed</span>
                        ) : (
                          <span className="text-[12px] text-gray-600">9:00 AM – 6:00 PM</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {saved && (
                    <span className="flex items-center gap-1 text-[13px] text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </span>
                  )}
                  <Button onClick={() => saveSettings()} disabled={saving} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Appearance</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme mode */}
                <div>
                  <Label className="text-[13px] text-gray-700 font-medium mb-3 block">Theme Mode</Label>
                  <div className="flex gap-3">
                    {(["light", "dark"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m);
                          applyTheme(primaryColor, m);
                        }}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          mode === m
                            ? "border-primary bg-primary-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                          m === "light" ? "bg-white border border-gray-200" : "bg-gray-800"
                        }`}>
                          {m === "light" ? (
                            <div className="w-4 h-4 rounded-full bg-yellow-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-600" />
                          )}
                        </div>
                        <p className={`text-[13px] font-medium ${mode === m ? "text-primary" : "text-gray-700"}`}>
                          {m === "light" ? "Light" : "Dark"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Color palette */}
                <div>
                  <Label className="text-[13px] text-gray-700 font-medium mb-3 block">Primary Color</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPalettes.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setPrimaryColor(c.value);
                          applyTheme(c.value, mode);
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          primaryColor === c.value
                            ? "border-primary shadow-sm bg-primary-50"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: c.value }} />
                        <span className="text-[11px] font-medium text-gray-700">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label className="text-[13px] text-gray-700 font-medium mb-3 block">Preview</Label>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                      <span className="font-semibold text-[14px] text-gray-900">{salonName || "Muvi Salon"}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-white" style={{ backgroundColor: primaryColor }}>
                        Primary Button
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-gray-300 text-gray-700 bg-white">
                        Secondary
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {saved && (
                    <span className="flex items-center gap-1 text-[13px] text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </span>
                  )}
                  <Button onClick={() => saveSettings()} disabled={saving} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stylists */}
          {activeTab === "stylists" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[15px] font-semibold text-gray-900">Stylists</CardTitle>
                    <CardDescription className="text-[13px] text-gray-500">
                      Manage your salon stylists
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddStylist(true)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Stylist
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stylists.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-[13px] font-medium">No stylists yet</p>
                    <p className="text-[12px] text-gray-400 mt-1">Add your first stylist to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stylists.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-gray-900">{s.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            {s.email && <span>{s.email}</span>}
                            {s.phone && <span>• {s.phone}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: s.color }} />
                          <button
                            onClick={() => deleteStylist(s.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Notifications</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { key: "newAppointment" as const, label: "New appointment booked", desc: "When a client books an appointment" },
                  { key: "reminders" as const, label: "Appointment reminders", desc: "24 hours before scheduled appointments" },
                  { key: "lowInventory" as const, label: "Low inventory alerts", desc: "When stock falls below minimum threshold" },
                  { key: "newCustomer" as const, label: "New customer", desc: "When a new customer is added" },
                  { key: "dailyRevenue" as const, label: "Daily revenue summary", desc: "End-of-day revenue and appointment summary" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-[13px] text-gray-900">{item.label}</p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${
                        notifications[item.key] ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                        notifications[item.key] ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  {saved && (
                    <span className="flex items-center gap-1 text-[13px] text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </span>
                  )}
                  <Button onClick={() => saveSettings()} disabled={saving} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Stylist Dialog */}
      <Dialog open={showAddStylist} onOpenChange={setShowAddStylist}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Add Stylist</DialogTitle>
            <DialogDescription>Add a new stylist to your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Full Name</Label>
              <Input
                value={newStylist.name}
                onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
                placeholder="e.g. Emma Wilson"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Email</Label>
              <Input
                type="email"
                value={newStylist.email}
                onChange={(e) => setNewStylist({ ...newStylist, email: e.target.value })}
                placeholder="e.g. emma@salon.com"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Phone (optional)</Label>
              <Input
                value={newStylist.phone}
                onChange={(e) => setNewStylist({ ...newStylist, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {stylistColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewStylist({ ...newStylist, color: c })}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                      newStylist.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddStylist(false)} className="rounded-xl cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={addStylist}
              disabled={!newStylist.name || !newStylist.email}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer"
            >
              Add Stylist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
