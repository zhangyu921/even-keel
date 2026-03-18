"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "../actions";
import { Button } from "@/components/ui/button";

interface DeleteAccountButtonProps {
  accountId: string;
}

export function DeleteAccountButton({ accountId }: DeleteAccountButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAccount(accountId);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Deleting…" : "Confirm"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={() => setShowConfirm(true)}
    >
      Delete
    </Button>
  );
}
