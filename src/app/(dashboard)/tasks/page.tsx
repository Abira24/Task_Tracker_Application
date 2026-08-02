"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ListTodo,
  TrendingUp,
  Flame,
  Loader2,
  Trash2,
  GripVertical,
  LayoutGrid,
  LayoutList,
  Filter,
  Scissors,
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
  stylistId: string | null;
  stylistName: string | null;
  stylistColor: string | null;
  dueDate: string;
  tags: string[];
  comments: number;
  attachments: number;
  completed: boolean;
}

interface Stylist {
  id: string;
  name: string;
  color: string;
}

const columns: { id: Status; title: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  { id: "todo", title: "To Do", icon: Circle, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
  { id: "in-progress", title: "In Progress", icon: Clock, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  { id: "review", title: "Review", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "done", title: "Done", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
];

const priorityConfig: Record<Priority, { label: string; color: string; badge: string; border: string }> = {
  low: { label: "Low", color: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-400" },
  medium: { label: "Medium", color: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200", border: "border-l-amber-400" },
  high: { label: "High", color: "text-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", border: "border-l-orange-400" },
  urgent: { label: "Urgent", color: "text-red-600", badge: "bg-red-50 text-red-700 border-red-200", border: "border-l-red-500" },
};

function TasksContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStylist, setFilterStylist] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const emptyForm = { title: "", description: "", priority: "medium" as Priority, status: "todo" as Status, dueDate: "", tags: "", stylistId: "" };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadData = () => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/stylists").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([taskData, stylistData, userData]) => {
        setTasks(taskData.tasks || []);
        setStylists(stylistData.stylists || []);
        setUserRole(userData.user?.role || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => { setSearchTerm(urlSearch); }, [urlSearch]);

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.completed ? "todo" : "done";
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed, status: newStatus as Status } : t));
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const moveTask = async (id: string, newStatus: Status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus, completed: newStatus === "done" } : t));
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const createTask = async () => {
    setFormSubmitting(true);
    try {
      const tags = createForm.tags ? createForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
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
          stylistId: createForm.stylistId || null,
        }),
      });
      setShowCreateDialog(false);
      loadData();
    } catch (e) { console.error(e); }
    finally { setFormSubmitting(false); }
  };

  const updateTask = async () => {
    if (!selectedTask) return;
    setFormSubmitting(true);
    try {
      const tags = editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
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
          stylistId: editForm.stylistId || null,
        }),
      });
      setShowEditDialog(false);
      loadData();
    } catch (e) { console.error(e); }
    finally { setFormSubmitting(false); }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setShowEditDialog(false);
    loadData();
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: (task as any).dueDateRaw || "",
      tags: task.tags?.join(", ") || "",
      stylistId: task.stylistId || "",
    });
    setShowEditDialog(true);
  };

  const filtered = tasks.filter((t) => {
    const matchesSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesStylist = filterStylist === "all" || t.stylistId === filterStylist;
    return matchesSearch && matchesPriority && matchesStylist;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  const isAdmin = userRole === "admin";

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      moveTask(taskId, columnId as Status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            Task Board
          </h1>
          <p className="text-gray-500 text-[13px] mt-1 ml-[42px]">Manage salon operations and team tasks</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-gray-100/80 rounded-xl p-1 border border-gray-200/50">
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                view === "board" ? "bg-white shadow-sm text-gray-900 shadow-gray-200/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                view === "list" ? "bg-white shadow-sm text-gray-900 shadow-gray-200/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer shadow-sm shadow-primary/20 h-9 px-4 text-[13px] font-medium">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, bg: "bg-primary/5", text: "text-primary-700", ring: "ring-primary/10" },
          { label: "To Do", value: stats.todo, bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-200" },
          { label: "In Progress", value: stats.inProgress, bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200" },
          { label: "Done", value: stats.done, bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
          { label: "Urgent", value: stats.urgent, bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-center gap-3 p-3.5 rounded-xl ${stat.bg} ring-1 ${stat.ring}`}>
            <p className={`text-xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className={`text-[12px] font-medium ${stat.text}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 rounded-xl border-gray-200/80 text-[13px] bg-white/80 focus:bg-white transition-colors h-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "low", "medium", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border ${
                filterPriority === p
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "bg-white text-gray-500 border-gray-200/80 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p === "all" ? "All" : priorityConfig[p].label}
            </button>
          ))}
        </div>
        {isAdmin && stylists.length > 0 && (
          <select
            value={filterStylist}
            onChange={(e) => setFilterStylist(e.target.value)}
            className="rounded-xl border border-gray-200/80 px-3 py-1.5 text-[12px] font-medium bg-white text-gray-700 cursor-pointer h-9"
          >
            <option value="all">All Stylists</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Board View */}
      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const columnTasks = filtered.filter((t) => t.status === col.id);
            const Icon = col.icon;
            const isOver = dragOverColumn === col.id;
            return (
              <div
                key={col.id}
                className={`space-y-2.5 min-h-[300px] rounded-xl p-2.5 transition-all duration-200 ${
                  isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-offset-1" : "bg-gray-50/60"
                }`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${col.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${col.color}`} />
                    </div>
                    <h3 className="font-semibold text-[13px] text-gray-800">{col.title}</h3>
                  </div>
                  <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-gray-200/80 text-[11px] font-bold text-gray-600 px-1.5">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-2">
                  {columnTasks.map((task) => {
                    const prio = priorityConfig[task.priority] || priorityConfig.medium;
                    const isDragging = draggedTask === task.id;
                    return (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openEditDialog(task)}
                        className={`group cursor-grab active:cursor-grabbing border-l-[3px] ${prio.border} shadow-sm rounded-xl hover:shadow-md hover:shadow-gray-200/50 transition-all duration-200 border border-gray-100 ${
                          isDragging ? "opacity-40 scale-95 rotate-1" : ""
                        }`}
                      >
                        <CardContent className="p-3.5">
                          {/* Title + Priority */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <p className={`font-medium text-[13px] text-gray-900 leading-snug ${task.completed ? "line-through text-gray-400" : ""}`}>
                                {task.title}
                              </p>
                            </div>
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleComplete(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 mt-0.5"
                            />
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2 mb-2.5 ml-5.5 leading-relaxed">{task.description}</p>
                          )}

                          {/* Tags */}
                          {task.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2.5 ml-5.5">
                              {task.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 bg-gray-100/80 text-gray-600 border-0 rounded-md">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="text-[9px] text-gray-400">+{task.tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 ml-5.5">
                            <div className="flex items-center gap-2">
                              {task.stylistName ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm" style={{ backgroundColor: task.stylistColor || "#8b5cf6" }}>
                                    {task.stylistName.split(" ").map((n: string) => n[0]).join("")}
                                  </div>
                                  <span className="text-[11px] text-gray-600 font-medium">{task.stylistName.split(" ")[0]}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.dueDate && (
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                  <Calendar className="h-3 w-3" /> {task.dueDate}
                                </span>
                              )}
                              <Badge className={`text-[9px] px-1.5 py-0 border ${prio.badge}`}>
                                {prio.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Quick Status Buttons */}
                          <div className="flex items-center gap-1 mt-2.5 ml-5.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {columns.filter((c) => c.id !== task.status).slice(0, 3).map((c) => (
                              <button
                                key={c.id}
                                onClick={(e) => { e.stopPropagation(); moveTask(task.id, c.id); }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${c.bg} ${c.color} hover:opacity-80`}
                              >
                                {c.title}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                      <Icon className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-[12px] font-medium">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="border-gray-100 shadow-sm rounded-xl">
              <CardContent className="py-16 text-center">
                <ListTodo className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-[13px] font-medium">No tasks found</p>
                <Button onClick={() => { setCreateForm(emptyForm); setShowCreateDialog(true); }} variant="ghost" size="sm" className="mt-2 text-primary hover:text-primary/80 cursor-pointer">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Create one
                </Button>
              </CardContent>
            </Card>
          ) : (
            filtered.map((task) => {
              const prio = priorityConfig[task.priority] || priorityConfig.medium;
              const colDef = columns.find((c) => c.id === task.status);
              return (
                <Card
                  key={task.id}
                  onClick={() => openEditDialog(task)}
                  className={`border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group border-l-[3px] ${prio.border}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleComplete(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-[14px] text-gray-900 ${task.completed ? "line-through text-gray-400" : ""}`}>
                            {task.title}
                          </h3>
                          <Badge className={`text-[10px] px-1.5 py-0 border ${prio.badge}`}>
                            {prio.label}
                          </Badge>
                          {colDef && (
                            <Badge className={`text-[10px] px-1.5 py-0 border ${colDef.bg} ${colDef.color} border-transparent`}>
                              {colDef.title}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-[12px] text-gray-500 line-clamp-1 mb-1.5">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                          {task.stylistName && (
                            <span className="flex items-center gap-1">
                              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: task.stylistColor || "#8b5cf6" }}>
                                {task.stylistName.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              {task.stylistName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.dueDate}</span>
                          )}
                          {task.tags?.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 bg-gray-100 text-gray-500 border-0">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {columns.filter((c) => c.id !== task.status).slice(0, 3).map((c) => (
                          <button
                            key={c.id}
                            onClick={(e) => { e.stopPropagation(); moveTask(task.id, c.id); }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${c.bg} ${c.color} hover:opacity-80`}
                          >
                            {c.title}
                          </button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">New Task</DialogTitle>
            <DialogDescription>Create a task and assign it to a team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Title</Label>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="Task title"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Description</Label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Task description..."
              />
            </div>
            {isAdmin && stylists.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[13px] flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-primary" /> Assign to Stylist
                </Label>
                <select
                  value={createForm.stylistId}
                  onChange={(e) => setCreateForm({ ...createForm, stylistId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Unassigned</option>
                  {stylists.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[13px]">Priority</Label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as Priority })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Status</Label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as Status })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Due Date</Label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Tags (comma separated)</Label>
              <Input
                value={createForm.tags}
                onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                placeholder="e.g. cleaning, inventory"
                className="rounded-xl text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-xl cursor-pointer">Cancel</Button>
            <Button
              onClick={createTask}
              disabled={formSubmitting || !createForm.title}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer shadow-sm shadow-primary/20"
            >
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Edit Task</DialogTitle>
            <DialogDescription>Update task details and assignment.</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Title</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Description</Label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {isAdmin && stylists.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[13px] flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-primary" /> Assign to Stylist
                  </Label>
                  <select
                    value={editForm.stylistId}
                    onChange={(e) => setEditForm({ ...editForm, stylistId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    {stylists.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[13px]">Priority</Label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px]">Status</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Status })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Due Date</Label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px]">Tags (comma separated)</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="rounded-xl text-[13px]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => deleteTask(selectedTask?.id || "")}
              className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button
              onClick={updateTask}
              disabled={formSubmitting}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer shadow-sm shadow-primary/20"
            >
              {formSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <TasksContent />
    </Suspense>
  );
}
