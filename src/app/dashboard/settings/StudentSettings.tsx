"use client";

import { useEffect, useState } from "react";

const GRADES = [
    "11 класс",
    "10 класс",
    "9 класс",
    "8 класс",
    "7 класс",
    "6 класс",
    "5 класс",
    "4 класс",
    "3 класс",
    "2 класс",
    "1 класс",
    "Дошкольник",
];

export default function StudentSettings() {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Загружаем текущий класс
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/profile/student");
                const data = await res.json();

                if (res.ok && data.grade) {
                    // Преобразуем "11" → "11 класс", "Дошкольник" → "Дошкольник"
                    const display =
                        data.grade === "Дошкольник"
                            ? "Дошкольник"
                            : `${data.grade} класс`;
                    setSelected(display);
                }
            } catch {
                // Игнорируем — пользователь может просто не иметь класса
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function handleSave() {
        if (!selected) return;
        setError("");
        setSuccess("");
        setSaving(true);

        const gradeValue =
            selected === "Дошкольник"
                ? "Дошкольник"
                : selected.replace(" класс", "");

        try {
            const res = await fetch("/api/profile/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grade: gradeValue }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка сохранения");
                return;
            }

            setSuccess("Сохранено");
        } catch {
            setError("Ошибка сети");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] p-[40px] max-w-[640px] mt-[24px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] p-[40px] max-w-[640px] mt-[24px]">
            <h2 className="font-days text-[22px] text-black mb-[24px]">
                Класс
            </h2>

            <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
                {GRADES.map((grade) => {
                    const isSelected = selected === grade;
                    return (
                        <button
                            key={grade}
                            type="button"
                            onClick={() => {
                                setSelected(grade);
                                setSuccess("");
                                setError("");
                            }}
                            disabled={saving}
                            className={`cursor-pointer py-[12px] rounded-[12px] text-[15px] font-medium transition disabled:opacity-50 ${
                                isSelected
                                    ? "bg-green text-black"
                                    : "bg-violet text-black hover:opacity-80"
                            }`}
                        >
                            {grade}
                        </button>
                    );
                })}
            </div>

            {error && <p className="text-red text-sm mb-[16px]">{error}</p>}
            {success && (
                <p className="text-green text-sm mb-[16px]">{success}</p>
            )}

            <button
                type="button"
                onClick={handleSave}
                disabled={!selected || saving}
                className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? "Сохранение..." : "Сохранить класс"}
            </button>
        </div>
    );
}
