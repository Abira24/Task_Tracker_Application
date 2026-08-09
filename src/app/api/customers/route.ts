import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(request: NextRequest) {
  try {
    const stylistId = request.nextUrl.searchParams.get("stylistId");

    const customers = await query<any[]>(
      stylistId
        ? `SELECT c.*,
                  COUNT(a.id) as visits,
                  COALESCE(SUM(s.price), 0) as totalSpent,
                  MAX(a.date) as lastVisitDate,
                  (SELECT s2.name FROM Appointment a2 JOIN Service s2 ON a2.serviceId = s2.id WHERE a2.customerId = c.id AND a2.stylistId = ? GROUP BY s2.id ORDER BY COUNT(a2.id) DESC LIMIT 1) as favoriteService
           FROM Customer c
           INNER JOIN Appointment a ON c.id = a.customerId AND a.stylistId = ?
           LEFT JOIN Service s ON a.serviceId = s.id
           GROUP BY c.id
           ORDER BY MAX(a.date) DESC`
        : `SELECT c.*,
                  COUNT(a.id) as visits,
                  COALESCE(SUM(s.price), 0) as totalSpent,
                  MAX(a.date) as lastVisitDate,
                  (SELECT s2.name FROM Appointment a2 JOIN Service s2 ON a2.serviceId = s2.id WHERE a2.customerId = c.id GROUP BY s2.id ORDER BY COUNT(a2.id) DESC LIMIT 1) as favoriteService
           FROM Customer c
           LEFT JOIN Appointment a ON c.id = a.customerId
           LEFT JOIN Service s ON a.serviceId = s.id
           GROUP BY c.id
           ORDER BY c.createdAt DESC`,
      stylistId ? [stylistId, stylistId] : []
    );

    const mapped = customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      visits: c.visits || 0,
      totalSpent: `$${(c.totalSpent || 0).toLocaleString()}`,
      lastVisit: c.lastVisitDate
        ? (() => {
            const diff = Math.floor((Date.now() - new Date(c.lastVisitDate).getTime()) / 86400000);
            if (diff === 0) return "Today";
            if (diff === 1) return "Yesterday";
            return `${diff} days ago`;
          })()
        : "Never",
      status: c.visits > 20 ? "vip" : c.visits > 10 ? "regular" : c.visits > 0 ? "new" : "inactive",
      loyalty: Math.min(Math.floor(((c.visits || 0) / 30) * 100), 100),
      favorite: c.favoriteService || "N/A",
      initials: c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
    }));

    const stats = {
      total: mapped.length,
      vip: mapped.filter((c: any) => c.status === "vip").length,
      avgVisits: mapped.length > 0 ? (mapped.reduce((s: number, c: any) => s + c.visits, 0) / mapped.length).toFixed(1) : "0",
      avgSpend: mapped.length > 0 ? `$${(mapped.reduce((s: number, c: any) => s + parseFloat(c.totalSpent.replace(/[$,]/g, "")) * (c.visits > 0 ? 1 : 0), 0) / Math.max(mapped.filter((c: any) => c.visits > 0).length, 1)).toFixed(0)}` : "$0",
    };

    return NextResponse.json({ customers: mapped, stats });
  } catch (error) {
    console.error("Customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const { name, email, phone, notes } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const id = `cust_${Date.now()}`;
    await query("INSERT INTO Customer (id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)", [id, name.trim(), email.trim(), phone || null, notes || null]);
    return NextResponse.json({ id, success: true });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A customer with this email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
