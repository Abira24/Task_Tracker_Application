import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const today = todayStr();
    const selectedMonth = request.nextUrl.searchParams.get("month");

    const [totalRevenue] = await query<any[]>(
      "SELECT COALESCE(SUM(s.price), 0) as total FROM Appointment a JOIN Service s ON a.serviceId = s.id WHERE a.status != 'cancelled'"
    );

    const [appointmentsCount] = await query<any[]>(
      "SELECT COUNT(*) as count FROM Appointment"
    );

    const [customersCount] = await query<any[]>(
      "SELECT COUNT(*) as count FROM Customer"
    );

    let revenueData;
    let monthlyRevenueData;

    if (selectedMonth) {
      // Daily revenue for selected month (format: YYYY-MM)
      revenueData = await query<any[]>(
        `SELECT DAY(a.date) as day,
                COALESCE(SUM(s.price), 0) as revenue,
                COUNT(a.id) as appointments
         FROM Appointment a JOIN Service s ON a.serviceId = s.id
         WHERE DATE_FORMAT(a.date, '%Y-%m') = ? AND a.status != 'cancelled'
         GROUP BY DAY(a.date)
         ORDER BY day`,
        [selectedMonth]
      );
      // Also get the monthly totals for the selector display
      monthlyRevenueData = await query<any[]>(
        `SELECT DATE_FORMAT(a.date, '%b') as month,
                COALESCE(SUM(s.price), 0) as revenue,
                COUNT(a.id) as appointments
         FROM Appointment a JOIN Service s ON a.serviceId = s.id
         WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(a.date, '%Y-%m'), DATE_FORMAT(a.date, '%b')
         ORDER BY MIN(a.date)`
      );
    } else {
      // Monthly revenue for last 6 months (default)
      revenueData = await query<any[]>(
        `SELECT DATE_FORMAT(a.date, '%b') as month,
                COALESCE(SUM(s.price), 0) as revenue,
                COUNT(a.id) as appointments
         FROM Appointment a JOIN Service s ON a.serviceId = s.id
         WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(a.date, '%Y-%m'), DATE_FORMAT(a.date, '%b')
         ORDER BY MIN(a.date)`
      );
      monthlyRevenueData = revenueData;
    }

    const serviceBreakdown = await query<any[]>(
      `SELECT s.name, COUNT(a.id) as count, COALESCE(SUM(s.price), 0) as revenue
       FROM Service s LEFT JOIN Appointment a ON s.id = a.serviceId AND (a.status IS NULL OR a.status != 'cancelled')
       GROUP BY s.id ORDER BY revenue DESC LIMIT 5`
    );

    const total = serviceBreakdown.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0);
    const breakdownMapped = serviceBreakdown.map((s: any, i: number) => ({
      name: s.name,
      percentage: total > 0 ? Math.round((s.revenue / total) * 100) : 0,
      revenue: `$${(s.revenue || 0).toLocaleString()}`,
      color: ["bg-violet-500", "bg-sky-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500"][i] || "bg-gray-500",
    }));

    const peakHoursData = await query<any[]>(
      `SELECT HOUR(STR_TO_DATE(startTime, '%h:%i %p')) as hour, COUNT(*) as count
       FROM Appointment
       WHERE status != 'cancelled' AND startTime IS NOT NULL AND startTime != ''
       GROUP BY HOUR(STR_TO_DATE(startTime, '%h:%i %p'))
       ORDER BY hour`
    );

    const maxCount = Math.max(...peakHoursData.map((h: any) => h.count || 1), 1);
    const peakHours = peakHoursData.map((h: any) => {
      const hourNum = h.hour;
      let label = "";
      if (hourNum === 0) label = "12 AM";
      else if (hourNum < 12) label = `${hourNum} AM`;
      else if (hourNum === 12) label = "12 PM";
      else label = `${hourNum - 12} PM`;
      return { hour: label, percentage: Math.round((h.count / maxCount) * 100) };
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const fullRevenueData = months.slice(0, currentMonth + 1).map((month) => {
      const found = (monthlyRevenueData || revenueData).find((r: any) => r.month === month);
      return {
        month,
        revenue: found ? Number(found.revenue) : 0,
        appointments: found ? Number(found.appointments) : 0,
      };
    });

    // Build daily revenue data for selected month
    const dailyRevenueData = selectedMonth
      ? (() => {
          const [, yearStr, monthNumStr] = selectedMonth.match(/^(\d{4})-(\d{2})$/) || [];
          if (!yearStr || !monthNumStr) return [];
          const year = Number(yearStr);
          const monthNum = Number(monthNumStr);
          const daysInMonth = new Date(year, monthNum, 0).getDate();
          return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const found = revenueData.find((r: any) => r.day === day);
            return {
              day,
              label: `${monthNumStr}-${String(day).padStart(2, "0")}`,
              revenue: found ? Number(found.revenue) : 0,
              appointments: found ? Number(found.appointments) : 0,
            };
          });
        })()
      : [];

    const topStylists = await query<any[]>(
      `SELECT st.name, st.color, COALESCE(SUM(s.price), 0) as revenue, COUNT(a.id) as appointments
       FROM Stylist st
       INNER JOIN Appointment a ON st.id = a.stylistId AND a.status != 'cancelled'
       INNER JOIN Service s ON a.serviceId = s.id
       GROUP BY st.id
       HAVING appointments > 0
       ORDER BY revenue DESC LIMIT 5`
    );

    const stylistMapped = topStylists.map((s: any) => ({
      name: s.name,
      color: s.color,
      revenue: `$${(s.revenue || 0).toLocaleString()}`,
      appointments: s.appointments || 0,
    }));

    // Daily summary
    const [todayRevenue] = await query<any[]>(
      `SELECT COALESCE(SUM(s.price), 0) as total
       FROM Appointment a JOIN Service s ON a.serviceId = s.id
       WHERE DATE(a.date) = ? AND a.status != 'cancelled'`,
      [today]
    );

    const [todayApptsCount] = await query<any[]>(
      "SELECT COUNT(*) as count FROM Appointment WHERE DATE(date) = ?",
      [today]
    );

    const todayAppts = await query<any[]>(
      `SELECT a.id, a.date, a.startTime, a.endTime, a.status,
              c.name as client, s.name as service, s.price,
              st.name as stylist, st.color as stylistColor
       FROM Appointment a
       JOIN Customer c ON a.customerId = c.id
       JOIN Service s ON a.serviceId = s.id
       JOIN Stylist st ON a.stylistId = st.id
       WHERE DATE(a.date) = ?
       ORDER BY a.startTime`,
      [today]
    );

    const todayStatusCounts = todayAppts.reduce((acc: Record<string, number>, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const todayStylistPerf = await query<any[]>(
      `SELECT st.name, st.color,
              COUNT(CASE WHEN a.status != 'cancelled' THEN a.id END) as appointments,
              COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) as todayEarnings,
              COALESCE(SUM(CASE WHEN a.status != 'cancelled' THEN s.price ELSE 0 END), 0) as revenue
       FROM Stylist st
       LEFT JOIN Appointment a ON st.id = a.stylistId AND DATE(a.date) = ?
       LEFT JOIN Service s ON a.serviceId = s.id
       WHERE st.isActive = 1
       GROUP BY st.id ORDER BY todayEarnings DESC`,
      [today]
    );

    const todayServiceBreakdown = await query<any[]>(
      `SELECT s.name, COUNT(a.id) as count, COALESCE(SUM(s.price), 0) as revenue
       FROM Appointment a JOIN Service s ON a.serviceId = s.id
       WHERE DATE(a.date) = ? AND a.status != 'cancelled'
       GROUP BY s.id ORDER BY count DESC`,
      [today]
    );

    return NextResponse.json({
      totals: {
        revenue: totalRevenue?.total || 0,
        appointments: appointmentsCount?.count || 0,
        customers: customersCount?.count || 0,
      },
      revenueData: fullRevenueData,
      dailyRevenueData,
      selectedMonth,
      serviceBreakdown: breakdownMapped,
      peakHours,
      topStylists: stylistMapped,
      daily: {
        date: today,
        revenue: todayRevenue?.total || 0,
        appointmentsCount: todayApptsCount?.count || 0,
        appointments: todayAppts.map((a: any) => ({
          id: a.id,
          client: a.client,
          service: a.service,
          stylist: a.stylist,
          stylistColor: a.stylistColor,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          price: a.price,
        })),
        statusCounts: todayStatusCounts,
        stylistPerformance: todayStylistPerf.map((s: any) => ({
          name: s.name,
          color: s.color,
          appointments: s.appointments,
          revenue: s.revenue || 0,
          todayEarnings: s.todayEarnings || 0,
        })),
        serviceBreakdown: todayServiceBreakdown.map((s: any) => ({
          name: s.name,
          count: s.count,
          revenue: s.revenue || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
