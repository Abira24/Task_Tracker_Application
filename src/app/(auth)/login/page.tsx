"use client";

import { Suspense, useState, useEffect } from "react";
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
          className="flex-1 px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-[13px] cursor-pointer"
        >
          <span className="text-gray-400 text-[11px] font-medium">Demo: Admin</span>
        </button>
        <button
          type="button"
          onClick={() => fillDemo("stylist")}
          className="flex-1 px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-[13px] cursor-pointer"
        >
          <span className="text-gray-400 text-[11px] font-medium">Demo: Stylist</span>
        </button>
      </div>

      <form action={action} className="space-y-4">
        {state?.message && (
          <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
            {state.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 tracking-wide">
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
            className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400"
          />
          {state?.errors?.email && (
            <p className="text-[12px] text-red-500 mt-0.5">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 tracking-wide">
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
              className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400 pr-10"
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
            <p className="text-[12px] text-red-500 mt-0.5">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full mt-2 py-2.5 text-[13px] font-semibold tracking-wide rounded-lg bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            <span className="inline-flex items-center gap-2">
              Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  const [salonName, setSalonName] = useState("Muvi Salon");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s?.salonName) setSalonName(s.salonName);
        if (s?.logo) setLogo(s.logo);
      })
      .catch(() => {});
  }, []);

  const nameParts = salonName.split(" ");
  const displayName = nameParts.length > 1 ? nameParts[0] : salonName;
  const subDisplay = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Salon";

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12">
      {/* Subtle background wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02]" />

      {/* Logo & brand */}
      <div className="relative z-10 flex flex-col items-center mb-8 gap-3">
        <div className="gradient-primary p-[2px] rounded-2xl">
          <div className="bg-white rounded-[14px] p-0.5">
            {logo ? (
              <img
                src={logo}
                alt={`${salonName} Logo`}
                className="h-14 w-14 rounded-[12px] object-cover"
              />
            ) : (
              <Image
                src="/logo.jpeg"
                alt={`${salonName} Logo`}
                className="h-14 w-14 rounded-[12px] object-cover"
                width={56}
                height={56}
                priority
              />
            )}
          </div>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-primary tracking-tight">
            {displayName}
          </span>
          {nameParts.length > 1 && (
            <span className="block text-sm font-medium text-primary/50 tracking-wide">
              {subDisplay}
            </span>
          )}
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-sm px-4">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Welcome Back
              </h1>
              <p className="text-[13px] text-gray-500">
                Please sign in to your account
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
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
