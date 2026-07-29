import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT COALESCE(SUM(s.price), 0) as total FROM Appointment a JOIN Service s ON a.serviceId = s.id WHERE a.status != 'cancelled'"
    );
    const totalRevenue = rows[0];

    const countRows = await query<any[]>("SELECT COUNT(*) as count FROM Appointment");
    const appointmentsCount = countRows[0];

    const custRows = await query<any[]>("SELECT COUNT(*) as count FROM Customer");
    const customersCount = custRows[0];

    const servicesData = await query<any[]>(
      `SELECT s.name, COUNT(a.id) as bookings, CONCAT('$', FORMAT(SUM(s.price), 0)) as revenue
       FROM Service s LEFT JOIN Appointment a ON s.id = a.serviceId
       GROUP BY s.id ORDER BY bookings DESC LIMIT 4`
    );

    const recentCustomers = await query<any[]>(
      `SELECT c.name, COUNT(a.id) as visits, CONCAT('$', FORMAT(COALESCE(SUM(s.price), 0), 0)) as spent,
              CASE WHEN MAX(a.date) >= CURDATE() THEN 'Today'
                   WHEN MAX(a.date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Yesterday'
                   ELSE CONCAT(DATEDIFF(CURDATE(), MAX(a.date)), ' days ago')
              END as lastVisit
       FROM Customer c LEFT JOIN Appointment a ON c.id = a.customerId LEFT JOIN Service s ON a.serviceId = s.id
       GROUP BY c.id ORDER BY MAX(a.date) DESC LIMIT 4`
    );

    const todayAppointments = await query<any[]>(
      `SELECT a.id, c.name as client, s.name as service, a.startTime as time, a.endTime, st.name as stylist, a.status,
              s.duration, CONCAT(FLOOR(s.duration/60), 'h ', s.duration%60, 'm') as durationStr
       FROM Appointment a JOIN Customer c ON a.customerId = c.id JOIN Service s ON a.serviceId = s.id JOIN Stylist st ON a.stylistId = st.id
       WHERE DATE(a.date) = CURDATE() ORDER BY a.startTime LIMIT 5`
    );

    const stylists = await query<any[]>(
      "SELECT id, name, color FROM Stylist WHERE isActive = 1"
    );

    return NextResponse.json({
      stats: [
        {
          title: "Total Revenue",
          value: `$${(totalRevenue?.total || 0).toLocaleString()}`,
          change: "+12.5%",
          trend: "up",
        },
        {
          title: "Appointments",
          value: String(appointmentsCount?.count || 0),
          change: "+8.2%",
          trend: "up",
        },
        {
          title: "Active Customers",
          value: String(customersCount?.count || 0),
          change: "+15.3%",
          trend: "up",
        },
        {
          title: "Avg. Rating",
          value: "4.9",
          change: "+0.3",
          trend: "up",
        },
      ],
      todayAppointments: todayAppointments.map((a: any) => ({
        id: a.id,
        client: a.client,
        service: a.service,
        time: a.time,
        stylist: a.stylist,
        status: a.status,
        duration: a.durationStr,
      })),
      topServices: servicesData,
      recentCustomers,
      stylists,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
