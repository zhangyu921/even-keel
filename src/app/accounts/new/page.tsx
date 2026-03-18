"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, type AccountInput } from "@/lib/validations";
import { createAccount } from "../actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank Account" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "LIABILITY", label: "Liability" },
  { value: "OTHER", label: "Other" },
] as const;

const CURRENCIES = [
  { value: "CNY", label: "CNY (¥)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
] as const;

export default function NewAccountPage() {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      currency: "CNY",
      type: "BANK",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createAccount(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Add new account</CardTitle>
          <CardDescription>
            Add a bank account, credit card, investment, or other asset to track
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="new-account-form" onSubmit={onSubmit} className="grid gap-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="name">Account name</Label>
              <Input
                id="name"
                placeholder="e.g. Chase Checking, Fidelity 401k"
                autoComplete="off"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="type">Account type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-invalid={!!errors.type}
                {...register("type")}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" size="lg" className="mt-2" disabled={isPending}>
              {isPending ? "Creating…" : "Add account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:underline"
          >
            Cancel
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
