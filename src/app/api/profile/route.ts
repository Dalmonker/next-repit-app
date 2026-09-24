import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

// Поля, которые РАЗРЕШЕНО менять через этот API.
// email, role, consent, id — НЕЛЬЗЯ.
type ProfileUpdate = {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    bio?: string;
};

// Валидация и нормализация
function validateProfile(
    body: any,
): { ok: true; data: ProfileUpdate } | { ok: false; error: string } {
    const data: ProfileUpdate = {};

    // ---- Имя ----
    if (body.first_name !== undefined) {
        const v = String(body.first_name).trim();
        if (v.length > 50) return { ok: false, error: "Имя слишком длинное" };
        if (v && !/^[А-Яа-яЁёA-Za-z\- ]+$/.test(v)) {
            return { ok: false, error: "Имя содержит недопустимые символы" };
        }
        data.first_name = v;
    }

    // ---- Фамилия ----
    if (body.last_name !== undefined) {
        const v = String(body.last_name).trim();
        if (v.length > 50)
            return { ok: false, error: "Фамилия слишком длинная" };
        if (v && !/^[А-Яа-яЁёA-Za-z\- ]+$/.test(v)) {
            return {
                ok: false,
                error: "Фамилия содержит недопустимые символы",
            };
        }
        data.last_name = v;
    }

    // ---- Отчество ----
    if (body.middle_name !== undefined) {
        const v = String(body.middle_name).trim();
        if (v.length > 50)
            return { ok: false, error: "Отчество слишком длинное" };
        if (v && !/^[А-Яа-яЁёA-Za-z\- ]+$/.test(v)) {
            return {
                ok: false,
                error: "Отчество содержит недопустимые символы",
            };
        }
        data.middle_name = v;
    }

    // ---- Телефон ----
    if (body.phone !== undefined) {
        // Убираем всё, кроме цифр и +
        let v = String(body.phone).replace(/[^\d+]/g, "");
        if (v.length > 20)
            return { ok: false, error: "Телефон слишком длинный" };
        if (v && !/^\+?\d{7,15}$/.test(v)) {
            return { ok: false, error: "Некорректный номер телефона" };
        }
        data.phone = v;
    }

    // ---- О себе ----
    if (body.bio !== undefined) {
        const v = String(body.bio).trim();
        if (v.length > 1000)
            return { ok: false, error: "«О себе» максимум 1000 символов" };
        data.bio = v;
    }

    return { ok: true, data };
}

// ================= GET: получить свой профиль =================
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        const [rows]: any = await pool.execute(
            `SELECT id, email, role, first_name, last_name, middle_name, phone, avatar_url, bio
             FROM users WHERE id = ?`,
            [session.userId],
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Пользователь не найден" },
                { status: 404 },
            );
        }

        return NextResponse.json({ user: rows[0] });
    } catch (error) {
        console.error("profile GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

// ================= POST: обновить свой профиль =================
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const result = validateProfile(body);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        const data = result.data;

        // Если нечего обновлять — выходим
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return NextResponse.json(
                { error: "Нет данных для обновления" },
                { status: 400 },
            );
        }

        // Собираем SET-часть динамически, но безопасно — только разрешённые поля
        const setParts: string[] = [];
        const values: any[] = [];

        for (const key of keys) {
            setParts.push(`${key} = ?`);
            values.push((data as any)[key]);
        }

        values.push(session.userId); // WHERE id = ?

        await pool.execute(
            `UPDATE users SET ${setParts.join(", ")} WHERE id = ?`,
            values,
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("profile POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
