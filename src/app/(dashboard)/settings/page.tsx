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
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your salon preferences and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Settings sidebar */}
        <Card className="h-fit">
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
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          <Card>
            <CardHeader>
              <CardTitle>Salon Information</CardTitle>
              <CardDescription>
                Update your salon details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                      GS
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold">Salon Logo</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or SVG. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-name">Salon Name</Label>
                  <Input id="salon-name" defaultValue="Glamour Salon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    defaultValue="hello@glamoursalon.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    defaultValue="www.glamoursalon.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue="123 Beauty Street, Suite 100, New York, NY 10001"
                  />
                </div>
              </div>

              <Separator />

              {/* Business Hours */}
              <div>
                <h3 className="font-semibold mb-3">Business Hours</h3>
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
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{day}</span>
                      <div className="flex items-center gap-2">
                        {day === "Sunday" ? (
                          <span className="text-sm text-muted-foreground">
                            Closed
                          </span>
                        ) : (
                          <>
                            <span className="text-sm">9:00 AM</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-sm">6:00 PM</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="w-10 h-6 bg-primary rounded-full flex items-center px-0.5 cursor-pointer">
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
