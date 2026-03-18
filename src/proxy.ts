export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/analysis/:path*",
    "/settings/:path*",
  ],
};
