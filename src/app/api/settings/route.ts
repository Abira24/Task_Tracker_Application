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
    const { salonName, phone, email, website, address, notifications, theme, logo } = body;

    try {
      await query(
        `INSERT INTO SalonSettings (id, salonName, phone, email, website, address, notifications, theme, logo)
         VALUES ('settings_1', ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE salonName=?, phone=?, email=?, website=?, address=?, notifications=?, theme=?, logo=?`,
        [
          salonName, phone, email, website, address, JSON.stringify(notifications), JSON.stringify(theme), logo || null,
          salonName, phone, email, website, address, JSON.stringify(notifications), JSON.stringify(theme), logo || null,
        ]
      );
    } catch {
      await query(
        `CREATE TABLE IF NOT EXISTS SalonSettings (
          id VARCHAR(255) NOT NULL PRIMARY KEY,
          salonName VARCHAR(255) DEFAULT 'Muvi Salon',
          phone VARCHAR(50) DEFAULT '',
          email VARCHAR(255) DEFAULT '',
          website VARCHAR(255) DEFAULT '',
          address TEXT,
          notifications JSON,
          theme JSON,
          logo MEDIUMTEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
      await query(`ALTER TABLE SalonSettings MODIFY COLUMN logo MEDIUMTEXT`).catch(() => {});
      await query(
        `INSERT INTO SalonSettings (id, salonName, phone, email, website, address, notifications, theme, logo)
         VALUES ('settings_1', ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE salonName=?, phone=?, email=?, website=?, address=?, notifications=?, theme=?, logo=?`,
        [
          salonName, phone, email, website, address, JSON.stringify(notifications), JSON.stringify(theme), logo || null,
          salonName, phone, email, website, address, JSON.stringify(notifications), JSON.stringify(theme), logo || null,
        ]
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
    salonName: "Muvi Salon",
    phone: "",
    email: "",
    website: "",
    address: "",
    logo: null,
    notifications: {
      newAppointment: true,
      reminders: true,
      lowInventory: true,
      newCustomer: true,
      dailyRevenue: true,
    },
    theme: {
      primaryColor: "#be2ed6",
      mode: "light",
    },
  };
}
