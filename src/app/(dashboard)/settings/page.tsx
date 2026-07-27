"use client";

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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500">
          Manage your salon preferences and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Settings sidebar */}
        <Card className="h-fit border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { icon: Store, label: "Salon Info", active: true },
                { icon: User, label: "My Account" },
                { icon: Bell, label: "Notifications" },
                { icon: CreditCard, label: "Billing" },
                { icon: Users, label: "Team Members" },
                { icon: Palette, label: "Appearance" },
                { icon: Globe, label: "Localization" },
                { icon: Shield, label: "Security" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                    item.active
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

        {/* Settings content */}
        <div className="space-y-6">
          {/* Salon Information */}
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
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-violet-50 text-violet-600 text-2xl font-bold">
                      GS
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Salon Logo</p>
                  <p className="text-[13px] text-gray-500">
                    JPG, PNG or SVG. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-name" className="text-[13px] text-gray-700">Salon Name</Label>
                  <Input id="salon-name" defaultValue="Glamour Salon" className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[13px] text-gray-700">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    defaultValue="hello@glamoursalon.com"
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-[13px] text-gray-700">Website</Label>
                  <Input
                    id="website"
                    defaultValue="www.glamoursalon.com"
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-[13px] text-gray-700">Address</Label>
                  <Input
                    id="address"
                    defaultValue="123 Beauty Street, Suite 100, New York, NY 10001"
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Business Hours */}
              <div>
                <h3 className="font-semibold text-[15px] text-gray-900 mb-3">Business Hours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                    >
                      <span className="text-[13px] font-medium text-gray-900">{day}</span>
                      <div className="flex items-center gap-2">
                        {day === "Sunday" ? (
                          <span className="text-[13px] text-gray-500">
                            Closed
                          </span>
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

              <div className="flex justify-end">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification settings */}
          <Card className="border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-[15px] font-semibold text-gray-900">Notification Preferences</CardTitle>
              <CardDescription className="text-[13px] text-gray-500">
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "New appointment booked",
                  description: "Get notified when a client books an appointment",
                },
                {
                  label: "Appointment reminders",
                  description:
                    "Receive reminders 24 hours before scheduled appointments",
                },
                {
                  label: "Low inventory alerts",
                  description:
                    "Alert when stock levels fall below minimum threshold",
                },
                {
                  label: "New customer registration",
                  description:
                    "Notify when a new customer creates an account",
                },
                {
                  label: "Daily revenue summary",
                  description:
                    "Receive end-of-day revenue and appointment summary",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[13px] text-gray-900">{item.label}</p>
                    <p className="text-[12px] text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <div className="w-10 h-6 bg-violet-600 rounded-full flex items-center px-0.5 cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm transform translate-x-4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
