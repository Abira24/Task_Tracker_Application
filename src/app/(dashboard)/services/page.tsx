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
    color: "from-violet-500 to-purple-600",
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
    color: "from-sky-500 to-blue-600",
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
    color: "from-pink-500 to-rose-600",
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
    color: "from-emerald-500 to-teal-600",
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
    color: "from-amber-500 to-orange-600",
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
    color: "from-slate-600 to-gray-700",
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
    color: "from-rose-400 to-pink-600",
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
    color: "from-teal-500 to-cyan-600",
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
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage your salon services and pricing
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: "8", icon: Scissors },
          { label: "Most Popular", value: "Hair Coloring", icon: Star },
          { label: "Avg. Price", value: "$128", icon: DollarSign },
          { label: "Avg. Duration", value: "1h 22m", icon: Clock },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold text-sm">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and categories */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
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
          <Card key={service.id} className="group overflow-hidden">
            {/* Color header */}
            <div
              className={`h-24 bg-gradient-to-br ${service.color} flex items-center justify-center relative`}
            >
              <span className="text-4xl">{service.icon}</span>
              {service.popular && (
                <Badge className="absolute top-3 right-3 bg-white/90 text-foreground text-[10px]">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                  Popular
                </Badge>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {service.category}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {service.price}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {service.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                  {service.rating}
                </span>
                <span>{service.bookings} bookings</span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3" /> View
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
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
