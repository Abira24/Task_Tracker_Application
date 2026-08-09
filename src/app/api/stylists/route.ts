import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET() {
  try {
    const stylists = await query<any[]>(
      "SELECT id, name, email, phone, color, isActive FROM Stylist WHERE isActive = 1 ORDER BY name"
    );
    return NextResponse.json({ stylists });
  } catch (error) {
    console.error("Stylists error:", error);
    return NextResponse.json({ error: "Failed to fetch stylists" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const { name, email, phone, color } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    const id = `stylist_${Date.now()}`;
    await query(
      "INSERT INTO Stylist (id, name, email, phone, color, isActive) VALUES (?, ?, ?, ?, ?, 1)",
      [id, name, email, phone || null, color || "#8b5cf6"]
    );
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error("Create stylist error:", error);
    return NextResponse.json({ error: "Failed to create stylist" }, { status: 500 });
  }
}
