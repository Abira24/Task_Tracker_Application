import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tables = ["Appointment", "Task", "InventoryItem", "Customer", "Service", "Stylist", "User"];
    for (const table of tables) {
      await query(`DELETE FROM \`${table}\``);
    }

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
