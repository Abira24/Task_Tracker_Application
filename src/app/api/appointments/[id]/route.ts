import { NextRequest, NextResponse } from "next/server";
import { query, getSingle } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const appointment = await getSingle<any>(
      `SELECT a.*, c.name as client, c.email as clientEmail, c.phone as clientPhone,
              s.name as service, s.duration, s.price,
              st.name as stylist, st.color as stylistColor
       FROM Appointment a
       JOIN Customer c ON a.customerId = c.id
       JOIN Service s ON a.serviceId = s.id
       JOIN Stylist st ON a.stylistId = st.id
       WHERE a.id = ?`,
      [id]
    );
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { date, startTime, endTime, status, notes, customerId, serviceId, stylistId } = body;

    await query(
      "UPDATE Appointment SET date=?, startTime=?, endTime=?, status=?, notes=?, customerId=?, serviceId=?, stylistId=? WHERE id=?",
      [date ? new Date(date) : undefined, startTime, endTime, status, notes, customerId, serviceId, stylistId, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await query("DELETE FROM Appointment WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
