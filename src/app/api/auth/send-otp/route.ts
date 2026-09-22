import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateOtp, getExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

// Версия политики — меняй при обновлении документа
const CONSENT_VERSION = "1.0";

export async function POST(request: Request) {
    try {
        // 1. Rate limiting по IP
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            request.headers.get("x-real-ip") ??
            "unknown";

        const limit = rateLimit(ip, 5, 60_000); // 5 запросов в минуту
        if (!limit.ok) {
            return NextResponse.json(
                {
                    error: `Слишком много попыток. Подождите ${limit.retryAfter} сек.`,
                },
                { status: 429 },
            );
        }

        // 2. Парсим тело запроса
        const body = await request.json();
        const rawEmail = body.email;
        const consent = body.consent;

        // 3. Нормализация email
        const email = String(rawEmail ?? "")
            .toLowerCase()
            .trim();

        // 4. Валидация
        if (
            !email ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return NextResponse.json(
                { error: "Некорректный email" },
                { status: 400 },
            );
        }

        if (!consent) {
            return NextResponse.json(
                { error: "Необходимо согласие на обработку данных" },
                { status: 400 },
            );
        }

        // 5. Сохраняем / обновляем пользователя с согласием
        await pool.execute(
            `INSERT INTO users (email, consent, consent_at, consent_ip, consent_version) 
             VALUES (?, TRUE, NOW(), ?, ?) 
             ON DUPLICATE KEY UPDATE 
                consent = TRUE, 
                consent_at = NOW(), 
                consent_ip = VALUES(consent_ip),
                consent_version = VALUES(consent_version)`,
            [email, ip, CONSENT_VERSION],
        );

        // 6. Генерируем код и срок действия
        const code = generateOtp();
        const expiresAt = getExpiryDate(10);

        // 7. Удаляем старые коды для этого email
        await pool.execute(`DELETE FROM otp_codes WHERE email = ?`, [email]);

        // 8. Сохраняем новый код
        await pool.execute(
            `INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)`,
            [email, code, expiresAt],
        );

        // 9. Отправляем письмо
        await sendOtpEmail(email, code);

        // 10. Успех
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("send-otp error:", error);
        return NextResponse.json(
            { error: "Ошибка сервера. Попробуйте позже." },
            { status: 500 },
        );
    }
}
