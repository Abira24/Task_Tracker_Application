"use client";

import { useState } from "react";
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

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Restock hair coloring supplies",
    description:
      "Order new batch of premium hair coloring kits from supplier",
    priority: "high",
    status: "todo",
    assignee: "Emma Wilson",
    dueDate: "Today",
    tags: ["inventory", "urgent"],
    comments: 3,
    attachments: 1,
    completed: false,
  },
  {
    id: 2,
    title: "Update service menu pricing",
    description: "Review and update all service prices for the new quarter",
    priority: "medium",
    status: "todo",
    assignee: "Jane Doe",
    dueDate: "Tomorrow",
    tags: ["admin"],
    comments: 1,
    attachments: 0,
    completed: false,
  },
  {
    id: 3,
    title: "Schedule team training session",
    description: "Organize training for new coloring techniques",
    priority: "medium",
    status: "todo",
    assignee: "Sophia Lee",
    dueDate: "Jul 30",
    tags: ["training"],
    comments: 5,
    attachments: 2,
    completed: false,
  },
  {
    id: 4,
    title: "Deep clean treatment rooms",
    description:
      "Schedule deep cleaning for all treatment rooms this weekend",
    priority: "low",
    status: "todo",
    assignee: "James Brown",
    dueDate: "Aug 1",
    tags: ["maintenance"],
    comments: 0,
    attachments: 0,
    completed: false,
  },
  {
    id: 5,
    title: "Prepare monthly revenue report",
    description: "Compile all financial data and create presentation",
    priority: "high",
    status: "in-progress",
    assignee: "Jane Doe",
    dueDate: "Today",
    tags: ["finance", "report"],
    comments: 8,
    attachments: 3,
    completed: false,
  },
  {
    id: 6,
    title: "Renew salon insurance policy",
    description: "Contact insurance provider to renew annual policy",
    priority: "urgent",
    status: "in-progress",
    assignee: "Jane Doe",
    dueDate: "Today",
    tags: ["admin", "legal"],
    comments: 2,
    attachments: 1,
    completed: false,
  },
  {
    id: 7,
    title: "Update Instagram content calendar",
    description: "Plan social media posts for next month",
    priority: "medium",
    status: "in-progress",
    assignee: "Mia Garcia",
    dueDate: "Jul 29",
    tags: ["marketing"],
    comments: 4,
    attachments: 0,
    completed: false,
  },
  {
    id: 8,
    title: "Fix reception area lighting",
    description: "Replace broken fluorescent lights in the reception area",
    priority: "low",
    status: "review",
    assignee: "James Brown",
    dueDate: "Jul 28",
    tags: ["maintenance"],
    comments: 1,
    attachments: 0,
    completed: false,
  },
  {
    id: 9,
    title: "Finalize new employee onboarding docs",
    description: "Complete all paperwork for the new stylist starting next week",
    priority: "high",
    status: "review",
    assignee: "Jane Doe",
    dueDate: "Jul 30",
    tags: ["hr"],
    comments: 6,
    attachments: 4,
    completed: false,
  },
  {
    id: 10,
    title: "Order new towel sets",
    description: "Purchase 50 new premium towel sets for the salon",
    priority: "medium",
    status: "done",
    assignee: "Emma Wilson",
    dueDate: "Jul 25",
    tags: ["inventory"],
    comments: 2,
    attachments: 0,
    completed: true,
  },
  {
    id: 11,
    title: "Set up online booking system",
    description: "Configure the new online appointment booking platform",
    priority: "high",
    status: "done",
    assignee: "Sophia Lee",
    dueDate: "Jul 24",
    tags: ["tech"],
    comments: 12,
    attachments: 5,
    completed: true,
  },
  {
    id: 12,
    title: "Clean and sanitize tools",
    description: "Monthly deep clean of all salon tools and equipment",
    priority: "medium",
    status: "done",
    assignee: "Mia Garcia",
    dueDate: "Jul 23",
    tags: ["maintenance"],
    comments: 0,
    attachments: 0,
    completed: true,
  },
];

const columns: { id: Status; title: string; icon: React.ElementType; color: string }[] = [
  { id: "todo", title: "To Do", icon: Circle, color: "text-muted-foreground" },
  { id: "in-progress", title: "In Progress", icon: Clock, color: "text-sky-500" },
  { id: "review", title: "Review", icon: AlertCircle, color: "text-amber-500" },
  { id: "done", title: "Done", icon: CheckCircle2, color: "text-emerald-500" },
];

const priorityConfig: Record<Priority, { color: string; badge: string; icon: React.ElementType }> = {
  low: { color: "text-blue-400", badge: "bg-blue-100 text-blue-700", icon: Circle },
  medium: { color: "text-amber-500", badge: "bg-amber-100 text-amber-700", icon: TrendingUp },
  high: { color: "text-orange-500", badge: "bg-orange-100 text-orange-700", icon: Flame },
  urgent: { color: "text-red-500", badge: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  const toggleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? "done" : "todo",
            }
          : t
      )
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Task Tracker
          </h1>
          <p className="text-muted-foreground">
            Manage salon operations and team tasks
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "To Do",
            value: stats.todo,
            color: "bg-muted text-muted-foreground",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            color: "bg-sky-100 text-sky-700",
          },
          {
            label: "Done",
            value: stats.done,
            color: "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Urgent",
            value: stats.urgent,
            color: "bg-red-100 text-red-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3 p-3 rounded-xl ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "low", "medium", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filterPriority === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const columnTasks = filtered.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div key={col.id} className="space-y-3">
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${col.color}`} />
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-bold">
                    {columnTasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Task cards */}
              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task) => {
                  const prio = priorityConfig[task.priority];

                  return (
                    <Card
                      key={task.id}
                      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
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
                              className={`font-medium text-sm ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {task.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-muted-foreground">
                              {task.assignee.split(" ")[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {task.comments > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px]">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments}
                              </span>
                            )}
                            {task.attachments > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px]">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[10px]">
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
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Icon className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No tasks</p>
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
