"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFamilySchema, type CreateFamilyInput } from "@/lib/validations";
import { createFamily } from "../actions";
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

export default function CreateFamilyPage() {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFamilyInput>({
    resolver: zodResolver(createFamilySchema),
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createFamily(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create a family</CardTitle>
        <CardDescription>
          Start tracking your household finances together. You can invite your
          partner later.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="create-family-form" onSubmit={onSubmit} className="grid gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="name">Family name</Label>
            <Input
              id="name"
              placeholder="e.g. The Smiths, Our Home"
              autoComplete="off"
              autoFocus
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="mt-1" disabled={isPending}>
            {isPending ? "Creating…" : "Create family"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Have an invite code?{" "}
          <Link
            href="/family/join"
            className="font-medium text-primary hover:underline"
          >
            Join an existing family
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
