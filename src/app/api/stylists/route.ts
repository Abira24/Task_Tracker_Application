import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
