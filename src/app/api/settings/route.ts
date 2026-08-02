import { NextRequest, NextResponse } from "next/server";
import { query, getSingle } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getSingle<any>("SELECT * FROM SalonSettings LIMIT 1");
    return NextResponse.json({ settings: settings || getDefaultSettings() });
  } catch (error) {
    return NextResponse.json({ settings: getDefaultSettings() });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonName, phone, email, website, address, notifications } = body;

    try {
      await query(
        `INSERT INTO SalonSettings (id, salonName, phone, email, website, address, notifications) 
         VALUES ('settings_1', ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE salonName=?, phone=?, email=?, website=?, address=?, notifications=?`,
        [salonName, phone, email, website, address, JSON.stringify(notifications),
         salonName, phone, email, website, address, JSON.stringify(notifications)]
      );
    } catch {
      await query(
        `CREATE TABLE IF NOT EXISTS SalonSettings (
          id VARCHAR(255) NOT NULL PRIMARY KEY,
          salonName VARCHAR(255) DEFAULT 'Glamour Salon',
          phone VARCHAR(50) DEFAULT '+1 (555) 123-4567',
          email VARCHAR(255) DEFAULT 'hello@glamoursalon.com',
          website VARCHAR(255) DEFAULT 'www.glamoursalon.com',
          address TEXT,
          notifications JSON,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
      await query(
        `INSERT INTO SalonSettings (id, salonName, phone, email, website, address, notifications) 
         VALUES ('settings_1', ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE salonName=?, phone=?, email=?, website=?, address=?, notifications=?`,
        [salonName, phone, email, website, address, JSON.stringify(notifications),
         salonName, phone, email, website, address, JSON.stringify(notifications)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

function getDefaultSettings() {
  return {
    id: "settings_1",
    salonName: "Glamour Salon",
    phone: "+1 (555) 123-4567",
    email: "hello@glamoursalon.com",
    website: "www.glamoursalon.com",
    address: "123 Beauty Street, Suite 100, New York, NY 10001",
    notifications: {
      newAppointment: true,
      reminders: true,
      lowInventory: true,
      newCustomer: true,
      dailyRevenue: true,
    },
  };
}
