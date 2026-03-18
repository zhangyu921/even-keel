"use server";

import { hash } from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

export type AuthActionResult = {
  error?: string;
};

export async function register(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: { name, email, hashedPassword },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Account created but auto-login failed. Please log in." };
    }
    throw error;
  }

  return {};
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  return {};
}
