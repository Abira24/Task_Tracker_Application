"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { getSingle } from "@/lib/db";
import { z } from "zod/v3";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
} | undefined;

export async function login(state: LoginState, formData: FormData) {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await getSingle<any>(
      "SELECT * FROM User WHERE email = ? AND password = ?",
      [email, password]
    );

    if (!user) {
      return {
        message: "Invalid email or password",
      };
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    console.error("Login error:", e);
    return {
      message: "Login failed. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}
