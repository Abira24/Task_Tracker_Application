import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const stylistId = request.nextUrl.searchParams.get("stylistId");

    const rows = await query<any[]>(
      stylistId
        ? "SELECT COALESCE(SUM(s.price), 0) as total FROM Appointment a JOIN Service s ON a.serviceId = s.id WHERE a.status != 'cancelled' AND a.stylistId = ?"
        : "SELECT COALESCE(SUM(s.price), 0) as total FROM Appointment a JOIN Service s ON a.serviceId = s.id WHERE a.status != 'cancelled'",
      stylistId ? [stylistId] : []
    );
    const totalRevenue = rows[0];

    const countRows = await query<any[]>(
      stylistId
        ? "SELECT COUNT(*) as count FROM Appointment WHERE stylistId = ?"
        : "SELECT COUNT(*) as count FROM Appointment",
      stylistId ? [stylistId] : []
    );
    const appointmentsCount = countRows[0];

    const custRows = await query<any[]>(
      stylistId
        ? "SELECT COUNT(DISTINCT c.id) as count FROM Customer c JOIN Appointment a ON c.id = a.customerId WHERE a.stylistId = ?"
        : "SELECT COUNT(*) as count FROM Customer",
      stylistId ? [stylistId] : []
    );
    const customersCount = custRows[0];

    const servicesData = await query<any[]>(
      stylistId
        ? `SELECT s.name, COUNT(a.id) as bookings, CONCAT('$', FORMAT(SUM(s.price), 0)) as revenue
           FROM Service s LEFT JOIN Appointment a ON s.id = a.serviceId AND a.stylistId = ?
           WHERE a.id IS NOT NULL
           GROUP BY s.id ORDER BY bookings DESC LIMIT 4`
        : `SELECT s.name, COUNT(a.id) as bookings, CONCAT('$', FORMAT(SUM(s.price), 0)) as revenue
           FROM Service s LEFT JOIN Appointment a ON s.id = a.serviceId
           GROUP BY s.id ORDER BY bookings DESC LIMIT 4`,
      stylistId ? [stylistId] : []
    );

    const recentCustomers = await query<any[]>(
      stylistId
        ? `SELECT c.name, COUNT(a.id) as visits, CONCAT('$', FORMAT(COALESCE(SUM(s.price), 0), 0)) as spent,
                CASE WHEN MAX(a.date) >= CURDATE() THEN 'Today'
                     WHEN MAX(a.date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Yesterday'
                     ELSE CONCAT(DATEDIFF(CURDATE(), MAX(a.date)), ' days ago')
                END as lastVisit
           FROM Customer c LEFT JOIN Appointment a ON c.id = a.customerId AND a.stylistId = ? LEFT JOIN Service s ON a.serviceId = s.id
           WHERE a.id IS NOT NULL
           GROUP BY c.id ORDER BY MAX(a.date) DESC LIMIT 4`
        : `SELECT c.name, COUNT(a.id) as visits, CONCAT('$', FORMAT(COALESCE(SUM(s.price), 0), 0)) as spent,
                CASE WHEN MAX(a.date) >= CURDATE() THEN 'Today'
                     WHEN MAX(a.date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Yesterday'
                     ELSE CONCAT(DATEDIFF(CURDATE(), MAX(a.date)), ' days ago')
                END as lastVisit
           FROM Customer c LEFT JOIN Appointment a ON c.id = a.customerId LEFT JOIN Service s ON a.serviceId = s.id
           GROUP BY c.id ORDER BY MAX(a.date) DESC LIMIT 4`,
      stylistId ? [stylistId] : []
    );

    const todayAppointments = await query<any[]>(
      stylistId
        ? `SELECT a.id, c.name as client, s.name as service, a.startTime as time, a.endTime, st.name as stylist, a.status,
                  TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p')) as durationMin,
                  CONCAT(FLOOR(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p'))/60), 'h ',
                         TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p'))%60, 'm') as durationStr
           FROM Appointment a JOIN Customer c ON a.customerId = c.id JOIN Service s ON a.serviceId = s.id JOIN Stylist st ON a.stylistId = st.id
           WHERE DATE(a.date) = CURDATE() AND a.stylistId = ? ORDER BY a.startTime LIMIT 5`
        : `SELECT a.id, c.name as client, s.name as service, a.startTime as time, a.endTime, st.name as stylist, a.status,
                  TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p')) as durationMin,
                  CONCAT(FLOOR(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p'))/60), 'h ',
                         TIMESTAMPDIFF(MINUTE, STR_TO_DATE(a.startTime, '%h:%i %p'), STR_TO_DATE(a.endTime, '%h:%i %p'))%60, 'm') as durationStr
           FROM Appointment a JOIN Customer c ON a.customerId = c.id JOIN Service s ON a.serviceId = s.id JOIN Stylist st ON a.stylistId = st.id
           WHERE DATE(a.date) = CURDATE() ORDER BY a.startTime LIMIT 5`,
      stylistId ? [stylistId] : []
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
        endTime: a.endTime,
        stylist: a.stylist,
        status: a.status,
        duration: a.durationStr,
      })),
      topServices: servicesData,
      recentCustomers,
      stylists,
      stylistEarnings: stylistId
        ? (await query<any[]>(
            `SELECT COALESCE(SUM(s.price), 0) as todayEarnings, COUNT(a.id) as todayCompleted
             FROM Appointment a JOIN Service s ON a.serviceId = s.id
             WHERE a.stylistId = ? AND DATE(a.date) = CURDATE() AND a.status = 'completed'`,
            [stylistId]
          ))[0]
        : null,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
