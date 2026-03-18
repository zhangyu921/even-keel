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
  BANK: "Bank",
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

type AccountWithBalance = {
  id: string;
  name: string;
  type: string;
  currency: string;
  visibility: string;
  ownerId: string;
  ownerName: string;
  currentBalance: number | null;
  lastUpdated: Date | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      family: {
        include: {
          members: {
            include: {
              accounts: {
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                include: {
                  balanceRecords: {
                    orderBy: { recordedAt: "desc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      accounts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          balanceRecords: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const hasFamily = !!user?.family;
  const currentView = view === "personal" ? "personal" : hasFamily ? "family" : "personal";

  let accountsWithBalance: AccountWithBalance[] = [];

  if (currentView === "family" && user?.family) {
    accountsWithBalance = user.family.members.flatMap((member) =>
      member.accounts
        .filter((account) => account.visibility === "FAMILY" || account.ownerId === session.user.id)
        .map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          currency: account.currency,
          visibility: account.visibility,
          ownerId: account.ownerId,
          ownerName: member.name,
          currentBalance: account.balanceRecords[0]
            ? Number(account.balanceRecords[0].amount)
            : null,
          lastUpdated: account.balanceRecords[0]?.recordedAt || null,
        }))
    );
  } else {
    accountsWithBalance = (user?.accounts || []).map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      visibility: account.visibility,
      ownerId: account.ownerId,
      ownerName: user?.name || "",
      currentBalance: account.balanceRecords[0]
        ? Number(account.balanceRecords[0].amount)
        : null,
      lastUpdated: account.balanceRecords[0]?.recordedAt || null,
    }));
  }

  const hasAccounts = accountsWithBalance.length > 0;

  const netWorth = accountsWithBalance.reduce((sum, account) => {
    if (account.currentBalance === null) return sum;
    const isLiability = account.type === "LIABILITY" || account.type === "CREDIT_CARD";
    return isLiability ? sum - account.currentBalance : sum + account.currentBalance;
  }, 0);

  const accountsByOwner = accountsWithBalance.reduce((groups, account) => {
    const key = account.ownerName;
    if (!groups[key]) groups[key] = [];
    groups[key].push(account);
    return groups;
  }, {} as Record<string, AccountWithBalance[]>);

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

  const ownerNames = Object.keys(accountsByOwner);
  const showGrouped = currentView === "family" && ownerNames.length > 1;

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

        {hasFamily && (
          <div className="mb-6 flex gap-2">
            <Button
              asChild
              variant={currentView === "family" ? "default" : "outline"}
              size="sm"
            >
              <Link href="/dashboard?view=family">Family</Link>
            </Button>
            <Button
              asChild
              variant={currentView === "personal" ? "default" : "outline"}
              size="sm"
            >
              <Link href="/dashboard?view=personal">Personal</Link>
            </Button>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardDescription>
              {currentView === "family" ? "Family Net Worth" : "Personal Net Worth"}
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(netWorth, "CNY")}
            </CardTitle>
          </CardHeader>
        </Card>

        {showGrouped ? (
          <div className="space-y-6">
            {ownerNames.map((ownerName) => (
              <Card key={ownerName}>
                <CardHeader>
                  <CardTitle className="text-base">{ownerName}</CardTitle>
                  <CardDescription>
                    {accountsByOwner[ownerName].length} account
                    {accountsByOwner[ownerName].length > 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {accountsByOwner[ownerName].map((account) => (
                      <Link
                        key={account.id}
                        href={`/accounts/${account.id}`}
                        className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {TYPE_LABELS[account.type] || account.type}
                          </p>
                        </div>
                        <div className="text-right">
                          {account.currentBalance !== null ? (
                            <p
                              className={`font-medium ${
                                account.type === "LIABILITY" ||
                                account.type === "CREDIT_CARD"
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {formatCurrency(account.currentBalance, account.currency)}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">No balance</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {currentView === "family" ? "Family Accounts" : "Your Accounts"}
              </CardTitle>
              <CardDescription>
                {accountsWithBalance.length} account
                {accountsWithBalance.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accountsWithBalance.map((account) => (
                  <Link
                    key={account.id}
                    href={`/accounts/${account.id}`}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[account.type] || account.type}
                        {currentView === "family" &&
                          account.ownerId !== session.user.id && (
                            <span className="ml-2">• {account.ownerName}</span>
                          )}
                      </p>
                    </div>
                    <div className="text-right">
                      {account.currentBalance !== null ? (
                        <p
                          className={`font-medium ${
                            account.type === "LIABILITY" ||
                            account.type === "CREDIT_CARD"
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {formatCurrency(account.currentBalance, account.currency)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No balance</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
