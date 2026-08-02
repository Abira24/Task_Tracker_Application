"use client";

import { Suspense, useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/actions/auth";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemo = (type: "admin" | "stylist") => {
    if (type === "admin") {
      setEmail("admin@glamour.com");
      setPassword("admin123");
    } else {
      setEmail("stylist@glamour.com");
      setPassword("stylist123");
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => fillDemo("admin")}
          className="flex-1 px-3 py-2 rounded-xl border border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm cursor-pointer"
        >
          <span className="text-gray-400 text-xs font-medium">Demo: Admin</span>
        </button>
        <button
          type="button"
          onClick={() => fillDemo("stylist")}
          className="flex-1 px-3 py-2 rounded-xl border border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm cursor-pointer"
        >
          <span className="text-gray-400 text-xs font-medium">Demo: Stylist</span>
        </button>
      </div>

      <form action={action} className="space-y-5">
        {state?.message && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {state.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-normal text-gray-500 tracking-normal">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white border-[1.5px] border-border-subtle rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-foreground-1 outline-none transition-all hover:border-gray-300 focus:border-gray-300 focus:bg-surface-1 placeholder:text-gray-400"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-500 mt-0.5">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-normal text-gray-500 tracking-normal">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border-[1.5px] border-border-subtle rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-foreground-1 outline-none transition-all hover:border-gray-300 focus:border-gray-300 focus:bg-surface-1 placeholder:text-gray-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {state?.errors?.password && (
            <p className="text-xs text-red-500 mt-0.5">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full mt-4 py-3 text-base font-bold tracking-wide rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            <span className="inline-flex items-center gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#f8fafc] py-12">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/25 via-purple-400/20 to-fuchsia-400/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-primary/20 via-violet-500/15 to-blue-400/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-purple-400/10 to-primary/10 blur-[80px]" />
      </div>

      {/* Logo & brand */}
      <div className="relative z-10 flex flex-col items-center mb-8 gap-4 transition-all duration-700 ease-out translate-y-0 opacity-100">
        <div className="gradient-primary p-[3px] rounded-3xl shadow-lg shadow-primary/20">
          <div className="bg-white rounded-[21px] p-1">
            <Image
              src="/logo.jpeg"
              alt="Muvi Salon Logo"
              className="h-16 w-16 rounded-[18px] object-cover"
              width={64}
              height={64}
              priority
            />
          </div>
        </div>
        <span className="text-3xl font-black text-primary tracking-tight">
          Muvi Salon
        </span>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-md px-4">
          <div
            className="flex flex-col relative overflow-hidden border-none w-full p-8 rounded-[24px] bg-white/80 backdrop-blur-xl border border-white/60 ring-1 ring-primary/10"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(190, 46, 214, 0.1), 0 8px 10px -6px rgba(190, 46, 214, 0.05)",
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Please sign in to your account
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
