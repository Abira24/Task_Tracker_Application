import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(request: NextRequest) {
  try {
    const stylistId = request.nextUrl.searchParams.get("stylistId");

    const tasks = await query<any[]>(
      stylistId
        ? `SELECT t.*, u.name as assignee, u.id as userId, st.name as stylistName, st.id as stylistId, st.color as stylistColor
           FROM Task t LEFT JOIN User u ON t.userId = u.id LEFT JOIN Stylist st ON t.stylistId = st.id
           WHERE t.stylistId = ?
           ORDER BY FIELD(t.status, 'todo', 'in-progress', 'review', 'done'), t.createdAt DESC`
        : `SELECT t.*, u.name as assignee, u.id as userId, st.name as stylistName, st.id as stylistId, st.color as stylistColor
           FROM Task t LEFT JOIN User u ON t.userId = u.id LEFT JOIN Stylist st ON t.stylistId = st.id
           ORDER BY FIELD(t.status, 'todo', 'in-progress', 'review', 'done'), t.createdAt DESC`,
      stylistId ? [stylistId] : []
    );

    const mapped = tasks.map((t: any) => {
      const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

      const dueDateRaw = t.dueDate ? (() => { const d = new Date(t.dueDate); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })() : "";

      return {
        id: t.id,
        title: t.title,
        description: t.description || "",
        priority: t.priority,
        status: t.status,
        assignee: t.assignee || "Unassigned",
        stylistId: t.stylistId || null,
        stylistName: t.stylistName || null,
        stylistColor: t.stylistColor || null,
        dueDate: dueDateStr,
        dueDateRaw,
        tags: t.tags ? JSON.parse(t.tags) : [],
        comments: 0,
        attachments: 0,
        completed: t.status === "done",
      };
    });

    const stats = {
      total: mapped.length,
      todo: mapped.filter((t: any) => t.status === "todo").length,
      inProgress: mapped.filter((t: any) => t.status === "in-progress").length,
      done: mapped.filter((t: any) => t.status === "done").length,
      urgent: mapped.filter((t: any) => t.priority === "urgent").length,
    };

    return NextResponse.json({ tasks: mapped, stats });
  } catch (error) {
    console.error("Tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate, tags, userId, stylistId } = body;
    const id = `task_${Date.now()}`;
    await query(
      "INSERT INTO Task (id, title, description, priority, status, dueDate, tags, userId, stylistId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title, description || null, priority || "medium", status || "todo", dueDate ? new Date(dueDate) : null, tags ? JSON.stringify(tags) : null, userId || null, stylistId || null]
    );
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
