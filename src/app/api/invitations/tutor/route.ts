import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTutorInvitations } from "@/lib/invitations";

export async function GET() {
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

        const invitations = await getTutorInvitations(session.userId);

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error("invitations/tutor GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
