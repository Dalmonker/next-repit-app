"use client";

import { useState } from "react";

const ROLES = [
    { id: "tutor", label: "Я репетитор", emoji: "🎓" },
    { id: "parent", label: "Я родитель", emoji: "👨‍👩‍👧" },
    { id: "student", label: "Я ученик", emoji: "📚" },
] as const;

export default function RolePage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function chooseRole(role: string) {
        setError("");
        setLoading(role);

        try {
            const res = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            window.location.href = "/dashboard";
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(null);
        }
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-violet px-[30px]">
            <div className="w-full max-w-[560px] bg-white rounded-[24px] p-[40px] shadow-xl">
                <h1 className="font-days text-[32px] text-black text-center mb-[16px]">
                    Кто вы?
                </h1>
                <p className="text-center text-darkGray mb-[32px]">
                    Это нужно, чтобы настроить кабинет под вас
                </p>

                {error && (
                    <p className="text-red text-sm mb-4 text-center">{error}</p>
                )}

                <div className="space-y-[12px]">
                    {ROLES.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => chooseRole(r.id)}
                            disabled={loading !== null}
                            className="cursor-pointer w-full flex items-center gap-[16px] p-[20px] rounded-[16px] border border-whiteTxt hover:border-green hover:bg-violet transition disabled:opacity-50"
                        >
                            <span className="text-[32px]">{r.emoji}</span>
                            <span className="text-[18px] font-medium text-black">
                                {r.label}
                            </span>
                            {loading === r.id && (
                                <span className="ml-auto text-darkGray text-sm">
                                    Загрузка...
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}
