import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export type SessionPayload = {
    userId: number;
    email: string;
    role: "tutor" | "parent" | "student" | null;
};

export const SESSION_COOKIE = "ripit_session";

// JWT
export async function createSession(payload: SessionPayload): Promise<string> {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

// Проверка JWT
export async function verifySession(
    token: string,
): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

// Положить cookie
export async function setSessionCookie(token: string) {
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 дней
    });
}

// Удалить cookie
export async function clearSessionCookie() {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
}

// Прочитать текущую сессию
export async function getSession(): Promise<SessionPayload | null> {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifySession(token);
}
