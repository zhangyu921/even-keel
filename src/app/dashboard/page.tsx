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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      family: true,
      accounts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const hasAccounts = user?.accounts && user.accounts.length > 0;
  const hasFamily = !!user?.family;

  if (!hasAccounts) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Welcome to EvenKeel, {session.user.name}!
            </CardTitle>
            <CardDescription>
              Start tracking your assets to see your financial overview
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3">
            <Button asChild size="lg">
              <Link href="/accounts/new">Add your first account</Link>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button asChild variant="outline" size="lg">
              <Link href="/settings/family">
                {hasFamily ? "Manage family" : "Invite partner to collaborate"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {hasFamily && (
              <p className="text-sm text-muted-foreground">
                {user.family?.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/family">Family</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/accounts/new">Add Account</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>
              {user.accounts.length} account{user.accounts.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.type.replace("_", " ")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {account.currency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
