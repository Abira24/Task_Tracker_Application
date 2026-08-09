import { NextRequest, NextResponse } from "next/server";
import { query, getSingle } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const task = await getSingle<any>("SELECT * FROM Task WHERE id = ?", [id]);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await (await import("@/lib/session")).getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (session.role !== "admin") {
      const task = await getSingle<any>("SELECT stylistId FROM Task WHERE id = ?", [id]);
      if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (task.stylistId !== session.stylistId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const allowedFields: Record<string, any> = {};
      if (body.status) allowedFields.status = body.status;
      if (body.description !== undefined) allowedFields.description = body.description;

      const fields: string[] = [];
      const values: any[] = [];
      for (const [key, value] of Object.entries(allowedFields)) {
        fields.push(`${key}=?`);
        values.push(value);
      }
      if (fields.length > 0) {
        values.push(id);
        await query(`UPDATE Task SET ${fields.join(", ")} WHERE id=?`, values);
      }
      return NextResponse.json({ success: true });
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (["title", "description", "priority", "status", "dueDate", "tags", "userId", "stylistId"].includes(key)) {
        fields.push(`${key}=?`);
        values.push(key === "dueDate" && value ? new Date(value as string) : value);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE Task SET ${fields.join(", ")} WHERE id=?`, values);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await query("DELETE FROM Task WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
