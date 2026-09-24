import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    const { pathname } = request.nextUrl;

    // ============================================================
    // АДМИНКА — отдельная логика
    // ============================================================
    if (pathname.startsWith("/admin")) {
        // Не авторизован → на логин
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Не админ → 404 (не палим существование)
        if (session.role !== "admin") {
            return NextResponse.rewrite(new URL("/404", request.url));
        }

        // Админ — пропускаем
        return NextResponse.next();
    }

    // ============================================================
    // ДАШБОРД И ОНБОРДИНГ — прежняя логика
    // ============================================================
    const protectedPaths = ["/dashboard", "/onboarding"];
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    // Не авторизован
    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session) {
        // /login → на /onboarding/role или /dashboard
        if (pathname === "/login") {
            if (!session.role) {
                return NextResponse.redirect(
                    new URL("/onboarding/role", request.url),
                );
            }
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // /onboarding/role — только если роль ещё НЕ выбрана
        if (pathname === "/onboarding/role" && session.role) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // /onboarding/student — только для ученика
        if (
            pathname.startsWith("/onboarding/student") &&
            session.role !== "student"
        ) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/login",
        "/onboarding/:path*",
    ],
};
