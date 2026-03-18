export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">EvenKeel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your family finances on an even keel
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
