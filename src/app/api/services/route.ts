import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET() {
  try {
    const services = await query<any[]>(
      `SELECT s.*, COUNT(a.id) as bookings,
              COALESCE(AVG(CASE WHEN a.status != 'cancelled' THEN 5 ELSE NULL END), 4.5) as rating
       FROM Service s LEFT JOIN Appointment a ON s.id = a.serviceId
       GROUP BY s.id ORDER BY s.name`
    );

    const mapped = services.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description || "",
      duration: `${Math.floor(s.duration / 60)}h ${s.duration % 60 > 0 ? `${s.duration % 60}m` : ""}`.trim(),
      price: `$${s.price}`,
      priceValue: s.price,
      category: s.category,
      popular: s.bookings > 20,
      rating: Math.round((s.rating || 4.5) * 10) / 10,
      bookings: s.bookings || 0,
      isActive: !!s.isActive,
    }));

    const categories = ["All", ...new Set(services.map((s: any) => s.category))];

    const stats = {
      total: mapped.length,
      mostPopular: mapped.length > 0 ? mapped.reduce((best: any, s: any) => s.bookings > best.bookings ? s : best, mapped[0]).name : "N/A",
      avgPrice: mapped.length > 0 ? `$${(mapped.reduce((sum: number, s: any) => sum + s.priceValue, 0) / mapped.length).toFixed(0)}` : "$0",
      avgDuration: (() => {
        const totalMin = services.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
        const avg = services.length > 0 ? totalMin / services.length : 0;
        const h = Math.floor(avg / 60);
        const m = Math.round(avg % 60);
        return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
      })(),
    };

    return NextResponse.json({ services: mapped, categories, stats });
  } catch (error) {
    console.error("Services error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const { name, description, duration, price, category } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      return NextResponse.json({ error: "Valid duration is required" }, { status: 400 });
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const id = `svc_${Date.now()}`;
    await query(
      "INSERT INTO Service (id, name, description, duration, price, category) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name.trim(), description || null, Number(duration), Number(price), category]
    );
    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
