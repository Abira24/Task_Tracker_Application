"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { z } from "zod/v3";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Demo users
const USERS = [
  {
    id: "1",
    email: "admin@glamour.com",
    name: "Jane Doe",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    email: "stylist@glamour.com",
    name: "Emma Wilson",
    password: "stylist123",
    role: "stylist",
  },
];

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

  const user = USERS.find(
    (u) => u.email === email && u.password === password
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
