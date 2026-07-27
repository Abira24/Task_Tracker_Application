"use client";

import { useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Scissors,
  MapPin,
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

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const stylists = [
  { id: 1, name: "Emma Wilson", color: "bg-violet-500" },
  { id: 2, name: "James Brown", color: "bg-sky-500" },
  { id: 3, name: "Sophia Lee", color: "bg-pink-500" },
  { id: 4, name: "Mia Garcia", color: "bg-emerald-500" },
];

const appointments = [
  {
    id: 1,
    client: "Sarah Johnson",
    service: "Hair Coloring",
    time: "9:00 AM",
    endTime: "11:30 AM",
    stylist: "Emma Wilson",
    status: "confirmed",
    color: "bg-violet-500",
  },
  {
    id: 2,
    client: "Mike Chen",
    service: "Beard Trim & Shave",
    time: "10:30 AM",
    endTime: "11:15 AM",
    stylist: "James Brown",
    status: "in-progress",
    color: "bg-sky-500",
  },
  {
    id: 3,
    client: "Lisa Anderson",
    service: "Full Makeover",
    time: "11:00 AM",
    endTime: "2:00 PM",
    stylist: "Sophia Lee",
    status: "confirmed",
    color: "bg-pink-500",
  },
  {
    id: 4,
    client: "Tom Williams",
    service: "Haircut",
    time: "1:00 PM",
    endTime: "1:30 PM",
    stylist: "Emma Wilson",
    status: "pending",
    color: "bg-violet-500",
  },
  {
    id: 5,
    client: "Anna Martinez",
    service: "Manicure & Pedicure",
    time: "2:30 PM",
    endTime: "3:45 PM",
    stylist: "Mia Garcia",
    status: "confirmed",
    color: "bg-emerald-500",
  },
  {
    id: 6,
    client: "Robert Kim",
    service: "Deep Conditioning",
    time: "3:00 PM",
    endTime: "3:45 PM",
    stylist: "James Brown",
    status: "confirmed",
    color: "bg-sky-500",
  },
  {
    id: 7,
    client: "Emma Davis",
    service: "Bridal Updo",
    time: "4:00 PM",
    endTime: "5:30 PM",
    stylist: "Sophia Lee",
    status: "confirmed",
    color: "bg-pink-500",
  },
];

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "in-progress": "bg-sky-100 text-sky-800 border-sky-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-violet-100 text-violet-800 border-violet-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AppointmentsPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your salon appointments and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === "calendar"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List
            </button>
          </div>
          <Button className="gradient-primary">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2">
          {daysInWeek.map((day, i) => (
            <button
              key={i}
              className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl transition-all cursor-pointer ${
                day.toDateString() === today.toDateString()
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-[10px] uppercase font-medium opacity-70">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold">{day.getDate()}</span>
              {day.toDateString() === today.toDateString() && (
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
              )}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "calendar" ? (
        /* Calendar view - Timeline */
        <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr] gap-4">
          {/* Time column */}
          <div className="hidden lg:flex flex-col">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-16 flex items-start text-xs text-muted-foreground font-medium pt-0"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Stylist columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                  <div
                    className={`w-3 h-3 rounded-full ${stylist.color}`}
                  />
                  <span className="font-medium text-sm">{stylist.name}</span>
                </div>
                <div className="space-y-1 relative min-h-[400px]">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-16 border-b border-dashed border-border/50"
                    />
                  ))}
                  {/* Appointment blocks */}
                  {appointments
                    .filter((a) => a.stylist === stylist.name)
                    .map((apt) => {
                      const startIdx = timeSlots.indexOf(apt.time);
                      const endIdx = timeSlots.indexOf(apt.endTime);
                      const duration = endIdx - startIdx + 1;

                      if (startIdx === -1) return null;

                      return (
                        <div
                          key={apt.id}
                          className={`absolute left-1 right-1 rounded-lg p-2 border-l-4 ${apt.color} bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                          style={{
                            top: `${startIdx * 64}px`,
                            height: `${Math.max(duration * 64 - 4, 30)}px`,
                          }}
                        >
                          <p className="text-xs font-semibold truncate">
                            {apt.client}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {apt.service}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {apt.time}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-xl ${apt.color} text-white font-bold text-sm shrink-0`}
                  >
                    <div className="text-center">
                      <p className="text-lg leading-none">
                        {apt.time.split(" ")[0]}
                      </p>
                      <p className="text-[10px] opacity-80">
                        {apt.time.split(" ")[1]}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apt.client}</h3>
                      <Badge className={`text-[10px] ${statusStyles[apt.status]}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Scissors className="h-3 w-3" /> {apt.service}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {apt.stylist}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {apt.time} - {apt.endTime}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
