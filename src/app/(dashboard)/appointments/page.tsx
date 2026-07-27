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
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  completed: "bg-violet-50 text-violet-700 border-violet-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-gray-500">
            Manage your salon appointments and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                view === "calendar"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List
            </button>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-xl border-gray-200">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2">
          {daysInWeek.map((day, i) => (
            <button
              key={i}
              className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl transition-all cursor-pointer ${
                day.toDateString() === today.toDateString()
                  ? "bg-violet-600 text-white shadow-sm"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-[11px] uppercase font-medium opacity-70">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold">{day.getDate()}</span>
              {day.toDateString() === today.toDateString() && (
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
              )}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" className="rounded-xl border-gray-200">
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
                className="h-16 flex items-start text-[12px] text-gray-500 font-medium pt-0"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Stylist columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                  <div
                    className={`w-3 h-3 rounded-full ${stylist.color}`}
                  />
                  <span className="font-medium text-[13px] text-gray-900">{stylist.name}</span>
                </div>
                <div className="space-y-1 relative min-h-[400px]">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-16 border-b border-dashed border-gray-100"
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
                          className={`absolute left-1 right-1 rounded-lg p-2 border-l-4 ${apt.color} bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                          style={{
                            top: `${startIdx * 64}px`,
                            height: `${Math.max(duration * 64 - 4, 30)}px`,
                          }}
                        >
                          <p className="text-[12px] font-semibold text-gray-900 truncate">
                            {apt.client}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {apt.service}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">
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
            <Card key={apt.id} className="border-gray-100 shadow-sm rounded-xl">
              <CardContent className="p-5">
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
                      <h3 className="font-semibold text-gray-900">{apt.client}</h3>
                      <Badge className={`text-[11px] ${statusStyles[apt.status]}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[13px] text-gray-500">
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
                  <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
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
