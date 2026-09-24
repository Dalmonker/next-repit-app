"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
    tutorId: number;
    isAuthenticated: boolean;
    role: string | null;
};

export default function InviteButton({
    tutorId,
    isAuthenticated,
    role,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Не залогинен → ссылка на логин
    if (!isAuthenticated) {
        return (
            <Link
                href={`/login?next=/tutors/${tutorId}`}
                className="inline-block bg-green text-black px-[32px] py-[14px] rounded-full font-medium hover:bg-[#c2e055] transition"
            >
                Войдите, чтобы пригласить
            </Link>
        );
    }

    // Репетитор → не рендерим
    if (role === "tutor") {
        return null;
    }

    // Уже отправил
    if (success) {
        return (
            <div className="bg-violet text-black px-[24px] py-[14px] rounded-full text-center">
                ✅ Заявка отправлена
            </div>
        );
    }

    // Отправка
    async function handleClick() {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tutorId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка отправки");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="cursor-pointer bg-green text-black px-[32px] py-[14px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
            >
                {loading ? "Отправка..." : "Пригласить заниматься"}
            </button>

            {error && <p className="text-red text-sm mt-[8px]">{error}</p>}
        </div>
    );
}
