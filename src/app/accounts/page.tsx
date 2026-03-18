import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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

const TYPE_LABELS: Record<string, string> = {
  BANK: "Bank Account",
  CREDIT_CARD: "Credit Card",
  E_WALLET: "E-Wallet",
  INVESTMENT: "Investment",
  REAL_ESTATE: "Real Estate",
  LIABILITY: "Liability",
  OTHER: "Other",
};

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: {
      ownerId: session.user.id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-svh p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your financial accounts
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/accounts/new">Add Account</Link>
            </Button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t added any accounts yet
              </p>
              <Button asChild>
                <Link href="/accounts/new">Add your first account</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Link key={account.id} href={`/accounts/${account.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {account.currency}
                      </span>
                    </div>
                    <CardDescription>
                      {TYPE_LABELS[account.type] || account.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click to view details and update balance
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
