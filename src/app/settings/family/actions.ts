"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createFamilySchema, joinFamilySchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export type FamilyActionResult = {
  error?: string;
};

export async function createFamily(data: {
  name: string;
}): Promise<FamilyActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const parsed = createFamilySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.familyId) {
    return { error: "You are already a member of a family" };
  }

  await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        name: parsed.data.name,
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: {
        familyId: family.id,
        role: "ADMIN",
      },
    });
  });

  redirect("/dashboard");
}

export async function joinFamily(data: {
  inviteCode: string;
}): Promise<FamilyActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const parsed = joinFamilySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.familyId) {
    return { error: "You are already a member of a family" };
  }

  const family = await prisma.family.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  });

  if (!family) {
    return { error: "Invalid invite code. Please check and try again." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      familyId: family.id,
      role: "MEMBER",
    },
  });

  redirect("/dashboard");
}
