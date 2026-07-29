import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    const tables = ["Appointment", "Task", "InventoryItem", "Customer", "Service", "Stylist", "User"];
    for (const table of tables) {
      await query(`DELETE FROM \`${table}\``);
    }

    const { execSync } = await import("child_process");
    const { exec } = await import("child_process");
    const util = await import("util");
    const execPromise = util.promisify(exec);
    await execPromise("node scripts/init-db.mjs");

    return NextResponse.json({ success: true, message: "Database reset and seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
