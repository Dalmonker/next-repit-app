import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { submitForReview } from "@/lib/tutor-profile";

export async function POST() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        if (session.role !== "tutor") {
            return NextResponse.json(
                { error: "Только для репетиторов" },
                { status: 403 },
            );
        }

        const result = await submitForReview(session.userId);

        if (!result.ok) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("submit-for-review error:", error);
        return NextResponse.json(
            { error: "Ошибка сервера" },
            { status: 500 },
        );
    }
}