import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Hanya lindungi rute /dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect berdasarkan role jika mengakses /dashboard tanpa spesifik path
    if (request.nextUrl.pathname === "/dashboard") {
      if (session.role === "OWNER") {
        return NextResponse.redirect(new URL("/dashboard/owner", request.url));
      } else if (session.role === "PENJUAL") {
        return NextResponse.redirect(new URL("/dashboard/penjual", request.url));
      } else if (session.role === "PENITIP") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    
    // Cegah Owner masuk ke dashboard penjual dan sebaliknya
    if (request.nextUrl.pathname.startsWith("/dashboard/owner") && session.role !== "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/penjual", request.url));
    }
    
    if (request.nextUrl.pathname.startsWith("/dashboard/penjual") && session.role !== "PENJUAL") {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
