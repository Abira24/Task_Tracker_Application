"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  GripVertical,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ListTodo,
  TrendingUp,
  Flame,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in-progress" | "review" | "done";

interface Task {
  id: number;
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

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleComplete = async (id: number) => {
    const task = tasks.find((t: any) => t.id === id);
    if (!task) return;

    const newStatus = task.completed ? "todo" : "done";
    setTasks((prev) =>
      prev.map((t: any) =>
        t.id === id
          ? { ...t, completed: !t.completed, status: newStatus }
          : t
      )
    );

    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || t.priority === filterPriority;
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
            <ListTodo className="h-6 w-6 text-violet-600" />
            Task Tracker
          </h1>
          <p className="text-gray-500">
            Manage salon operations and team tasks
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
          <Plus className="h-4 w-4" />
          New Task
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
          <div
            key={stat.label}
            className={`flex items-center gap-3 p-3 rounded-xl ${stat.bg}`}
          >
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
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                    {columnTasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task: any) => {
                  const prio = priorityConfig[task.priority as Priority] || priorityConfig.medium;

                  return (
                    <Card
                      key={task.id}
                      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-gray-100 shadow-sm rounded-xl"
                      style={{
                        borderLeftColor:
                          task.priority === "urgent"
                            ? "#ef4444"
                            : task.priority === "high"
                            ? "#f97316"
                            : task.priority === "medium"
                            ? "#f59e0b"
                            : "#3b82f6",
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleComplete(task.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-[13px] text-gray-900 ${
                                task.completed
                                  ? "line-through text-gray-400"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags?.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-violet-50 text-violet-600">
                                {task.assignee
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-gray-500">
                              {task.assignee.split(" ")[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            {task.comments > 0 && (
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments}
                              </span>
                            )}
                            {task.attachments > 0 && (
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate}
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
    </div>
  );
}
