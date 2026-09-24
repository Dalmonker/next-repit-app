import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, basename } from "path";
import { randomUUID } from "crypto";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const MAX_SIZE = 2 * 1024 * 1024; // 2 МБ
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_PREFIX = "/uploads/avatars/";

// Безопасное удаление старого файла
async function deleteOldAvatar(avatarUrl: string | null) {
    if (!avatarUrl) return;

    // Удаляем только свои файлы
    if (!avatarUrl.startsWith(AVATAR_PREFIX)) return;

    // Берём только basename — защита от ../../
    const filename = basename(avatarUrl);
    const filePath = join(
        process.cwd(),
        "public",
        "uploads",
        "avatars",
        filename,
    );

    try {
        await unlink(filePath);
    } catch {
        // Файла нет — не страшно, игнорируем
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("avatar") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Файл не найден" },
                { status: 400 },
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Файл больше 2 МБ" },
                { status: 400 },
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Только JPG, PNG, WebP" },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const magic = buffer.subarray(0, 4).toString("hex");
        const isValidImage =
            magic.startsWith("ffd8ff") ||
            magic.startsWith("89504e47") ||
            magic.startsWith("52494646");

        if (!isValidImage) {
            return NextResponse.json(
                { error: "Файл не является изображением" },
                { status: 400 },
            );
        }

        // 1. Читаем текущий avatar_url
        const [rows]: any = await pool.execute(
            `SELECT avatar_url FROM users WHERE id = ?`,
            [session.userId],
        );
        const oldAvatarUrl = rows[0]?.avatar_url ?? null;

        // 2. Удаляем старый файл (если он наш)
        await deleteOldAvatar(oldAvatarUrl);

        // 3. Сохраняем новый
        const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadDir, { recursive: true });

        const ext = file.type.split("/")[1].replace("jpeg", "jpg");
        const filename = `${session.userId}-${randomUUID()}.${ext}`;
        const filePath = join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const avatarUrl = `${AVATAR_PREFIX}${filename}`;

        // 4. Обновляем БД
        await pool.execute(`UPDATE users SET avatar_url = ? WHERE id = ?`, [
            avatarUrl,
            session.userId,
        ]);

        return NextResponse.json({ success: true, avatarUrl });
    } catch (error) {
        console.error("avatar upload error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
