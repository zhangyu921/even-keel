"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { balanceRecordSchema, type BalanceRecordInput } from "@/lib/validations";
import { updateBalance } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UpdateBalanceFormProps {
  accountId: string;
  currency: string;
  currentBalance: number | null;
}

export function UpdateBalanceForm({
  accountId,
  currency,
  currentBalance,
}: UpdateBalanceFormProps) {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BalanceRecordInput>({
    resolver: zodResolver(balanceRecordSchema),
    defaultValues: {
      amount: currentBalance?.toString() || "",
      note: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await updateBalance(accountId, data);
      if (result?.error) {
        setServerError(result.error);
      } else {
        reset({ amount: data.amount, note: "" });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="amount">Current balance ({currency})</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="Enter current balance"
          aria-invalid={!!errors.amount}
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="e.g. Monthly update"
          {...register("note")}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update balance"}
      </Button>
    </form>
  );
}
