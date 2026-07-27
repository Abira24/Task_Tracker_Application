"use client";

import { useState } from "react";
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
  MoreHorizontal,
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

const services = [
  {
    id: 1,
    name: "Hair Coloring",
    category: "Color",
    duration: "2h 30m",
    price: "$180",
    popular: true,
    rating: 4.9,
    bookings: 45,
    description: "Full hair coloring with premium products",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    icon: "🎨",
  },
  {
    id: 2,
    name: "Haircut & Styling",
    category: "Cut",
    duration: "30m",
    price: "$45",
    popular: true,
    rating: 4.8,
    bookings: 38,
    description: "Professional haircut and style",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    icon: "✂️",
  },
  {
    id: 3,
    name: "Full Makeover",
    category: "Beauty",
    duration: "3h",
    price: "$300",
    popular: true,
    rating: 5.0,
    bookings: 22,
    description: "Complete beauty transformation",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
    icon: "💄",
  },
  {
    id: 4,
    name: "Manicure & Pedicure",
    category: "Nails",
    duration: "1h 15m",
    price: "$90",
    popular: false,
    rating: 4.7,
    bookings: 30,
    description: "Deluxe manicure and pedicure treatment",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: "💅",
  },
  {
    id: 5,
    name: "Deep Conditioning",
    category: "Treatment",
    duration: "45m",
    price: "$65",
    popular: false,
    rating: 4.6,
    bookings: 18,
    description: "Intensive hair conditioning treatment",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: "🧴",
  },
  {
    id: 6,
    name: "Beard Trim & Shave",
    category: "Grooming",
    duration: "45m",
    price: "$55",
    popular: false,
    rating: 4.8,
    bookings: 25,
    description: "Professional beard grooming and shave",
    bg: "bg-gray-100",
    iconColor: "text-gray-600",
    icon: "🪒",
  },
  {
    id: 7,
    name: "Bridal Updo",
    category: "Special",
    duration: "1h 30m",
    price: "$250",
    popular: true,
    rating: 4.9,
    bookings: 12,
    description: "Elegant bridal hair styling",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    icon: "👰",
  },
  {
    id: 8,
    name: "Scalp Treatment",
    category: "Treatment",
    duration: "30m",
    price: "$40",
    popular: false,
    rating: 4.5,
    bookings: 15,
    description: "Therapeutic scalp massage and treatment",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
    icon: "💆",
  },
];

const categories = [
  "All",
  "Cut",
  "Color",
  "Beauty",
  "Nails",
  "Treatment",
  "Grooming",
  "Special",
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = services.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Services</h1>
          <p className="text-gray-500">
            Manage your salon services and pricing
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: "8", icon: Scissors, bg: "bg-violet-50", iconColor: "text-violet-600" },
          { label: "Most Popular", value: "Hair Coloring", icon: Star, bg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Avg. Price", value: "$128", icon: DollarSign, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Avg. Duration", value: "1h 22m", icon: Clock, bg: "bg-sky-50", iconColor: "text-sky-600" },
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

      {/* Search and categories */}
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
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className="group overflow-hidden border-gray-100 shadow-sm rounded-xl">
            {/* Color header */}
            <div className={`h-24 ${service.bg} flex items-center justify-center relative`}>
              <span className="text-4xl">{service.icon}</span>
              {service.popular && (
                <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 text-[11px] rounded-xl">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                  Popular
                </Badge>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[15px] text-gray-900">{service.name}</h3>
                  <Badge variant="secondary" className="text-[11px] mt-1 bg-gray-100 text-gray-600">
                    {service.category}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-violet-600">
                  {service.price}
                </p>
              </div>
              <p className="text-[13px] text-gray-500 mb-4">
                {service.description}
              </p>

              <div className="flex items-center gap-4 text-[13px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {service.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                  {service.rating}
                </span>
                <span>{service.bookings} bookings</span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Edit className="h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Eye className="h-3 w-3" /> View
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
