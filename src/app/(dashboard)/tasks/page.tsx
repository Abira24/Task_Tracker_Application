"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  ListTodo,
  TrendingUp,
  Flame,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in-progress" | "review" | "done";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  dueDate: string;
  tags: string[];
  comments: number;
  attachments: number;
  completed: boolean;
}

const columns: { id: Status; title: string; icon: React.ElementType; color: string }[] = [
  { id: "todo", title: "To Do", icon: Circle, color: "text-gray-500" },
  { id: "in-progress", title: "In Progress", icon: Clock, color: "text-sky-600" },
  { id: "review", title: "Review", icon: AlertCircle, color: "text-amber-600" },
  { id: "done", title: "Done", icon: CheckCircle2, color: "text-emerald-600" },
];

const priorityConfig: Record<Priority, { color: string; badge: string; icon: React.ElementType }> = {
  low: { color: "text-blue-500", badge: "bg-blue-50 text-blue-700", icon: Circle },
  medium: { color: "text-amber-600", badge: "bg-amber-50 text-amber-700", icon: TrendingUp },
  high: { color: "text-orange-600", badge: "bg-orange-50 text-orange-700", icon: Flame },
  urgent: { color: "text-red-600", badge: "bg-red-50 text-red-700", icon: AlertCircle },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [loading, setLoading] = useState(true);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const emptyForm = { title: "", description: "", priority: "medium" as Priority, status: "todo" as Status, dueDate: "", tags: "" };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadTasks = () => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadTasks, []);

  const toggleComplete = async (id: any) => {
    const task = tasks.find((t: any) => t.id === id);
    if (!task) return;
    const newStatus = task.completed ? "todo" : "done";
    setTasks((prev) =>
      prev.map((t: any) =>
        t.id === id ? { ...t, completed: !t.completed, status: newStatus } : t
      )
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const createTask = async () => {
    setFormSubmitting(true);
    try {
      const tags = createForm.tags ? createForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description || null,
          priority: createForm.priority,
          status: createForm.status,
          dueDate: createForm.dueDate || null,
          tags,
        }),
      });
      setShowCreateDialog(false);
      loadTasks();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const updateTask = async () => {
    if (!selectedTask) return;
    setFormSubmitting(true);
    try {
      const tags = editForm.tags ? editForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          priority: editForm.priority,
          status: editForm.status,
          dueDate: editForm.dueDate || null,
          tags,
        }),
      });
      setShowEditDialog(false);
      loadTasks();
    } catch (e) { console.error(e) }
    finally { setFormSubmitting(false) }
  };

  const deleteTask = async (id: any) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setShowEditDialog(false);
    loadTasks();
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: "",
      tags: task.tags?.join(", ") || "",
    });
    setShowEditDialog(true);
  };

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-violet-600" /> Task Tracker
          </h1>
          <p className="text-gray-500">Manage salon operations and team tasks</p>
        </div>
        <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Tasks", value: stats.total, bg: "bg-violet-50", textColor: "text-violet-700" },
          { label: "To Do", value: stats.todo, bg: "bg-gray-100", textColor: "text-gray-700" },
          { label: "In Progress", value: stats.inProgress, bg: "bg-sky-50", textColor: "text-sky-700" },
          { label: "Done", value: stats.done, bg: "bg-emerald-50", textColor: "text-emerald-700" },
          { label: "Urgent", value: stats.urgent, bg: "bg-red-50", textColor: "text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-center gap-3 p-3 rounded-xl ${stat.bg}`}>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className={`text-[12px] font-medium ${stat.textColor}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "low", "medium", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                filterPriority === p
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const columnTasks = filtered.filter((t) => t.status === col.id);
          const Icon = col.icon;
          return (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${col.color}`} />
                  <h3 className="font-semibold text-[13px] text-gray-900">{col.title}</h3>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">{columnTasks.length}</span>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task: any) => {
                  const prio = priorityConfig[task.priority as Priority] || priorityConfig.medium;
                  return (
                    <Card
                      key={task.id}
                      onClick={() => openEditDialog(task)}
                      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-gray-100 shadow-sm rounded-xl"
                      style={{
                        borderLeftColor: task.priority === "urgent" ? "#ef4444" : task.priority === "high" ? "#f97316" : task.priority === "medium" ? "#f59e0b" : "#3b82f6",
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleComplete(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-[13px] text-gray-900 ${task.completed ? "line-through text-gray-400" : ""}`}>
                              {task.title}
                            </p>
                            <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-violet-50 text-violet-600">
                                {task.assignee.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-gray-500">{task.assignee.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            {task.comments > 0 && (
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                                <MessageSquare className="h-3 w-3" /> {task.comments}
                              </span>
                            )}
                            {task.attachments > 0 && (
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                                <Paperclip className="h-3 w-3" /> {task.attachments}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                              <Calendar className="h-3 w-3" /> {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Icon className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-[13px]">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Create a new task for the team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Task title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
                placeholder="Task description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as Priority })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as Status })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} placeholder="e.g. cleaning, inventory" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button onClick={createTask} disabled={formSubmitting || !createForm.title} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Status })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => deleteTask(selectedTask?.id)} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={updateTask} disabled={formSubmitting} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer">
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
