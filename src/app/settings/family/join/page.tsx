"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinFamilySchema, type JoinFamilyInput } from "@/lib/validations";
import { joinFamily } from "../actions";
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

export default function JoinFamilyPage() {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFamilyInput>({
    resolver: zodResolver(joinFamilySchema),
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await joinFamily(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Join a family</CardTitle>
        <CardDescription>
          Enter the invite code shared by your family member
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="join-family-form" onSubmit={onSubmit} className="grid gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="inviteCode">Invite code</Label>
            <Input
              id="inviteCode"
              placeholder="Paste your invite code here"
              autoComplete="off"
              autoFocus
              aria-invalid={!!errors.inviteCode}
              {...register("inviteCode")}
            />
            {errors.inviteCode && (
              <p className="text-xs text-destructive">
                {errors.inviteCode.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="mt-1" disabled={isPending}>
            {isPending ? "Joining…" : "Join family"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Want to start fresh?{" "}
          <Link
            href="/settings/family/create"
            className="font-medium text-primary hover:underline"
          >
            Create a new family
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
