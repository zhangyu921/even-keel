export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/accounts/:path*", "/analysis/:path*", "/settings/:path*"],
};
