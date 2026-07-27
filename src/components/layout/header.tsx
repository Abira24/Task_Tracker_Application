"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex-1 flex items-center gap-4 pl-12 lg:pl-0">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-gray-50 border-gray-200 rounded-xl text-[13px] focus:bg-white focus:border-gray-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            3
          </span>
        </Button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 text-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-gray-500 text-xs font-medium">Online</span>
        </div>
      </div>
    </header>
  );
}
