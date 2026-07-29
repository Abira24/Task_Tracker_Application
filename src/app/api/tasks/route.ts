import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const tasks = await query<any[]>(
      `SELECT t.*, u.name as assignee, u.id as userId
       FROM Task t LEFT JOIN User u ON t.userId = u.id
       ORDER BY FIELD(t.status, 'todo', 'in-progress', 'review', 'done'), t.createdAt DESC`
    );

    const mapped = tasks.map((t: any) => {
      let dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
      const now = new Date();
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (due) {
        const diff = Math.floor((due.getTime() - now.getTime()) / 86400000);
        if (diff === 0) dueDateStr = "Today";
        else if (diff === 1) dueDateStr = "Tomorrow";
        else if (diff === -1) dueDateStr = "Yesterday";
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description || "",
        priority: t.priority,
        status: t.status,
        assignee: t.assignee || "Unassigned",
        dueDate: dueDateStr,
        tags: t.tags ? JSON.parse(t.tags) : [],
        comments: Math.floor(Math.random() * 10),
        attachments: Math.floor(Math.random() * 5),
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
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate, tags, userId } = body;
    const id = `task_${Date.now()}`;
    await query(
      "INSERT INTO Task (id, title, description, priority, status, dueDate, tags, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title, description || null, priority || "medium", status || "todo", dueDate ? new Date(dueDate) : null, tags ? JSON.stringify(tags) : null, userId || null]
    );
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
