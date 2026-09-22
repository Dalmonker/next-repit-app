import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email ?? "")
            .toLowerCase()
            .trim();
        const code = String(body.code ?? "").trim();

        if (!email || !code || !/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "Недостаточно данных" },
                { status: 400 },
            );
        }

        // Проверка блокировки
        const [blocked]: any = await pool.execute(
            `SELECT blocked_until FROM otp_codes 
             WHERE email = ? AND blocked_until > NOW() LIMIT 1`,
            [email],
        );
        if (blocked.length > 0) {
            return NextResponse.json(
                { error: "Слишком много попыток. Попробуйте позже." },
                { status: 429 },
            );
        }

        // Поиск активного кода
        const [rows]: any = await pool.execute(
            `SELECT id, code, expires_at, attempts FROM otp_codes 
             WHERE email = ? AND used = FALSE 
             ORDER BY id DESC LIMIT 1`,
            [email],
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Код не найден или уже использован" },
                { status: 401 },
            );
        }

        const record = rows[0];

        if (new Date(record.expires_at) < new Date()) {
            return NextResponse.json({ error: "Код истёк" }, { status: 401 });
        }

        if (record.code !== code) {
            const newAttempts = record.attempts + 1;
            if (newAttempts >= 5) {
                await pool.execute(
                    `UPDATE otp_codes 
                     SET attempts = ?, blocked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) 
                     WHERE id = ?`,
                    [newAttempts, record.id],
                );
                return NextResponse.json(
                    {
                        error: "Слишком много попыток. Попробуйте через 15 минут.",
                    },
                    { status: 429 },
                );
            }
            await pool.execute(
                `UPDATE otp_codes SET attempts = ? WHERE id = ?`,
                [newAttempts, record.id],
            );
            return NextResponse.json(
                { error: `Неверный код. Осталось попыток: ${5 - newAttempts}` },
                { status: 401 },
            );
        }

        // Код верный
        await pool.execute(`UPDATE otp_codes SET used = TRUE WHERE id = ?`, [
            record.id,
        ]);

        // Получаем пользователя
        const [users]: any = await pool.execute(
            `SELECT id, email, role FROM users WHERE email = ?`,
            [email],
        );
        const user = users[0];

        // Создаём сессию
        const token = await createSession({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await setSessionCookie(token);

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("verify-otp error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
