import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const appointments = await query<any[]>(
      `SELECT a.*, c.name as client, c.email as clientEmail, c.phone as clientPhone,
              s.name as service, s.duration, s.price,
              st.name as stylist, st.color as stylistColor
       FROM Appointment a
       JOIN Customer c ON a.customerId = c.id
       JOIN Service s ON a.serviceId = s.id
       JOIN Stylist st ON a.stylistId = st.id
       ORDER BY a.date DESC, a.startTime`
    );

    const stylists = await query<any[]>(
      "SELECT id, name, color FROM Stylist WHERE isActive = 1"
    );

    return NextResponse.json({ appointments, stylists });
  } catch (error) {
    console.error("Appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, status, notes, customerId, serviceId, stylistId } = body;

    const id = `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await query(
      "INSERT INTO Appointment (id, date, startTime, endTime, status, notes, customerId, serviceId, stylistId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, new Date(date), startTime, endTime, status || "confirmed", notes || null, customerId, serviceId, stylistId]
    );

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
