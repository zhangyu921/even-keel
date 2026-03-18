"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AccountActionResult = {
  error?: string;
};

export async function createAccount(data: {
  name: string;
  type: string;
  currency?: string;
  icon?: string;
}): Promise<AccountActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.account.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      currency: parsed.data.currency || "CNY",
      icon: parsed.data.icon,
      ownerId: session.user.id,
    },
  });

  redirect("/dashboard");
}

export async function updateAccount(
  id: string,
  data: {
    name: string;
    type: string;
    currency?: string;
    icon?: string;
  }
): Promise<AccountActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const account = await prisma.account.findUnique({
    where: { id },
  });

  if (!account) {
    return { error: "Account not found" };
  }

  if (account.ownerId !== session.user.id) {
    return { error: "You can only edit your own accounts" };
  }

  await prisma.account.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      currency: parsed.data.currency || "CNY",
      icon: parsed.data.icon,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);

  return {};
}

export async function deleteAccount(id: string): Promise<AccountActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const account = await prisma.account.findUnique({
    where: { id },
  });

  if (!account) {
    return { error: "Account not found" };
  }

  if (account.ownerId !== session.user.id) {
    return { error: "You can only delete your own accounts" };
  }

  await prisma.account.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  redirect("/accounts");
}
