"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Store,
  Users,
  Palette,
  Globe,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type SettingsTab = "salon" | "account" | "notifications" | "billing" | "team" | "appearance" | "localization" | "security";

interface NotificationSettings {
  newAppointment: boolean;
  reminders: boolean;
  lowInventory: boolean;
  newCustomer: boolean;
  dailyRevenue: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("salon");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newAppointment: true,
    reminders: true,
    lowInventory: true,
    newCustomer: true,
    dailyRevenue: true,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        setSalonName(s.salonName || "Glamour Salon");
        setPhone(s.phone || "+1 (555) 123-4567");
        setEmail(s.email || "hello@glamoursalon.com");
        setWebsite(s.website || "www.glamoursalon.com");
        setAddress(s.address || "123 Beauty Street, Suite 100, New York, NY 10001");
        if (s.notifications) {
          const n = typeof s.notifications === "string" ? JSON.parse(s.notifications) : s.notifications;
          setNotifications(n);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonName,
          phone,
          email,
          website,
          address,
          notifications,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { icon: Store, label: "Salon Info", id: "salon" as const },
    { icon: User, label: "My Account", id: "account" as const },
    { icon: Bell, label: "Notifications", id: "notifications" as const },
    { icon: CreditCard, label: "Billing", id: "billing" as const },
    { icon: Users, label: "Team Members", id: "team" as const },
    { icon: Palette, label: "Appearance", id: "appearance" as const },
    { icon: Globe, label: "Localization", id: "localization" as const },
    { icon: Shield, label: "Security", id: "security" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500">
          Manage your salon preferences and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card className="h-fit border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? "bg-violet-50 text-violet-600"
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
          {activeTab === "salon" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Salon Information</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">
                  Update your salon details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-violet-50 text-violet-600 text-2xl font-bold">
                        {salonName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GS"}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-violet-700">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Salon Logo</p>
                    <p className="text-[13px] text-gray-500">JPG, PNG or SVG. Max size 2MB.</p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salon-name" className="text-[13px] text-gray-700">Salon Name</Label>
                    <Input id="salon-name" value={salonName} onChange={(e) => setSalonName(e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[13px] text-gray-700">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] text-gray-700">Email Address</Label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-[13px] text-gray-700">Website</Label>
                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-[13px] text-gray-700">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div>
                  <h3 className="font-semibold text-[15px] text-gray-900 mb-3">Business Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="text-[13px] font-medium text-gray-900">{day}</span>
                        <div className="flex items-center gap-2">
                          {day === "Sunday" ? (
                            <span className="text-[13px] text-gray-500">Closed</span>
                          ) : (
                            <>
                              <span className="text-[13px] text-gray-900">9:00 AM</span>
                              <span className="text-gray-400">-</span>
                              <span className="text-[13px] text-gray-900">6:00 PM</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {saved && (
                    <span className="flex items-center gap-1 text-[13px] text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Saved successfully
                    </span>
                  )}
                  <Button onClick={saveSettings} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Notification Preferences</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "newAppointment" as const, label: "New appointment booked", description: "Get notified when a client books an appointment" },
                  { key: "reminders" as const, label: "Appointment reminders", description: "Receive reminders 24 hours before scheduled appointments" },
                  { key: "lowInventory" as const, label: "Low inventory alerts", description: "Alert when stock levels fall below minimum threshold" },
                  { key: "newCustomer" as const, label: "New customer registration", description: "Notify when a new customer creates an account" },
                  { key: "dailyRevenue" as const, label: "Daily revenue summary", description: "Receive end-of-day revenue and appointment summary" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-[13px] text-gray-900">{item.label}</p>
                      <p className="text-[12px] text-gray-500">{item.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${
                        notifications[item.key] ? "bg-violet-600" : "bg-gray-300"
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
                      <CheckCircle2 className="h-4 w-4" /> Saved successfully
                    </span>
                  )}
                  <Button onClick={saveSettings} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">My Account</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Manage your personal account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Account settings will be available in a future update.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Billing</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Manage your billing and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Billing settings will be available in a future update.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "team" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Team Members</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Manage your team and stylists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Team management will be available in a future update.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Appearance</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Appearance settings will be available in a future update.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "localization" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Localization</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Language and region settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Localization settings will be available in a future update.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold text-gray-900">Security</CardTitle>
                <CardDescription className="text-[13px] text-gray-500">Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-gray-500">Security settings will be available in a future update.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
