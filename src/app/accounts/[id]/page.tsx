import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateBalanceForm } from "./update-balance-form";
import { DeleteAccountButton } from "./delete-account-button";

const TYPE_LABELS: Record<string, string> = {
  BANK: "Bank Account",
  CREDIT_CARD: "Credit Card",
  E_WALLET: "E-Wallet",
  INVESTMENT: "Investment",
  REAL_ESTATE: "Real Estate",
  LIABILITY: "Liability",
  OTHER: "Other",
};

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    CNY: "¥",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      owner: true,
      balanceRecords: {
        orderBy: { recordedAt: "desc" },
        take: 10,
        include: { recordedBy: true },
      },
    },
  });

  if (!account || !account.isActive) {
    notFound();
  }

  const isOwner = account.ownerId === session.user.id;
  const latestBalance = account.balanceRecords[0];
  const currentBalance = latestBalance ? Number(latestBalance.amount) : null;

  return (
    <div className="min-h-svh p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/accounts">← Back to accounts</Link>
          </Button>
          {isOwner && <DeleteAccountButton accountId={id} />}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{account.name}</CardTitle>
                <CardDescription>
                  {TYPE_LABELS[account.type] || account.type} • {account.currency}
                </CardDescription>
              </div>
              {currentBalance !== null && (
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(currentBalance, account.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(latestBalance.recordedAt)}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <UpdateBalanceForm
              accountId={id}
              currency={account.currency}
              currentBalance={currentBalance}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balance History</CardTitle>
            <CardDescription>
              Recent balance updates for this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {account.balanceRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No balance records yet. Add your first update above.
              </p>
            ) : (
              <div className="space-y-3">
                {account.balanceRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(Number(record.amount), account.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.recordedAt)}
                        {record.recordedBy && ` • by ${record.recordedBy.name}`}
                      </p>
                      {record.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.note}
                        </p>
                      )}
                    </div>
                    {index === 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
