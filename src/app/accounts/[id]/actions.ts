"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { balanceRecordSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type BalanceActionResult = {
  error?: string;
};

export async function updateBalance(
  accountId: string,
  data: { amount: string; note?: string }
): Promise<BalanceActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const parsed = balanceRecordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { owner: true },
  });

  if (!account || !account.isActive) {
    return { error: "Account not found" };
  }

  await prisma.balanceRecord.create({
    data: {
      amount: parseFloat(parsed.data.amount),
      note: parsed.data.note || null,
      accountId: accountId,
      recordedById: session.user.id,
    },
  });

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return {};
}
