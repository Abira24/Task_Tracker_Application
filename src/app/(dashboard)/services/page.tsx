"use client";

import { useState, useEffect } from "react";
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
  Color: "bg-violet-50 text-violet-600",
  Cut: "bg-sky-50 text-sky-600",
  Beauty: "bg-pink-50 text-pink-600",
  Nails: "bg-emerald-50 text-emerald-600",
  Treatment: "bg-amber-50 text-amber-600",
  Grooming: "bg-gray-100 text-gray-600",
  Special: "bg-rose-50 text-rose-600",
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services || []);
        setCategories(data.categories || ["All"]);
        setStats(data.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: String(stats.total || services.length), icon: Scissors, bg: "bg-violet-50", iconColor: "text-violet-600" },
          { label: "Most Popular", value: stats.mostPopular || "N/A", icon: Star, bg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Avg. Price", value: stats.avgPrice || "$0", icon: DollarSign, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className="group overflow-hidden border-gray-100 shadow-sm rounded-xl">
            <div className={`h-24 ${serviceColors[service.category]?.split(" ")[0] || "bg-gray-50"} flex items-center justify-center relative`}>
              <span className="text-4xl">{serviceIcons[service.name] || "✂️"}</span>
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
                <Button variant="ghost" size="icon-sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
