import { NextRequest, NextResponse } from "next/server";
import { query, getSingle } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const stylist = await getSingle<any>("SELECT * FROM Stylist WHERE id = ?", [id]);
    if (!stylist) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(stylist);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stylist" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, email, phone, color, isActive } = body;
    await query(
      "UPDATE Stylist SET name=?, email=?, phone=?, color=?, isActive=? WHERE id=?",
      [name, email, phone, color, isActive ?? true, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stylist" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await query("DELETE FROM Stylist WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete stylist" }, { status: 500 });
  }
}
