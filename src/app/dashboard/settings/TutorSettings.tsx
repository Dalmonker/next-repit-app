"use client";

import { useEffect, useState } from "react";
import ProfileStatus from "./ProfileStatus";

const PRESET_SUBJECTS = [
    "Математика",
    "Физика",
    "Химия",
    "Информатика",
    "Русский язык",
    "Белорусский язык",
    "Английский язык",
    "История",
    "Биология",
    "География",
    "Литература",
    "Обществознание",
    "Робототехника",
    "Программирование",
];

const MAX_SUBJECTS = 20;
const MAX_SUBJECT_LENGTH = 50;
const MAX_HEADLINE_LENGTH = 150;

type ProfileStatusType =
    "draft" | "pending" | "approved" | "rejected" | "hidden" | null;

type Props = {
    userId: number;
};

export default function TutorSettings({ userId }: Props) {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [headline, setHeadline] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [hourlyRate, setHourlyRate] = useState("");
    const [experience, setExperience] = useState("");
    const [education, setEducation] = useState("");

    const [profileStatus, setProfileStatus] = useState<ProfileStatusType>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Загружаем профиль
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/profile/tutor");
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Не удалось загрузить");
                    return;
                }

                setSubjects(data.subjects ?? []);
                setHeadline(data.headline ?? "");
                setHourlyRate(data.hourly_rate ? String(data.hourly_rate) : "");
                setExperience(
                    data.experience_years !== null &&
                        data.experience_years !== undefined
                        ? String(data.experience_years)
                        : "",
                );
                setEducation(data.education ?? "");
                setProfileStatus(data.status ?? null);
                setRejectionReason(data.rejection_reason ?? null);
            } catch {
                setError("Ошибка сети");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    function toggleSubject(subject: string) {
        setError("");
        setSuccess("");

        setSubjects((prev) => {
            if (prev.includes(subject)) {
                return prev.filter((s) => s !== subject);
            }
            if (prev.length >= MAX_SUBJECTS) {
                setError(`Максимум ${MAX_SUBJECTS} предметов`);
                return prev;
            }
            return [...prev, subject];
        });
    }

    function addCustomSubject() {
        const value = customInput.trim();
        if (!value) return;

        if (value.length > MAX_SUBJECT_LENGTH) {
            setError(`Название предмета до ${MAX_SUBJECT_LENGTH} символов`);
            return;
        }

        if (!/^[А-Яа-яЁёA-Za-z0-9\- .,()]+$/.test(value)) {
            setError("Недопустимые символы в названии");
            return;
        }

        const lower = value.toLowerCase();
        if (subjects.some((s) => s.toLowerCase() === lower)) {
            setError("Такой предмет уже добавлен");
            return;
        }

        if (subjects.length >= MAX_SUBJECTS) {
            setError(`Максимум ${MAX_SUBJECTS} предметов`);
            return;
        }

        setSubjects((prev) => [...prev, value]);
        setCustomInput("");
        setShowCustomInput(false);
        setError("");
        setSuccess("");
    }

    async function handleSave() {
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const res = await fetch("/api/profile/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjects,
                    headline,
                    hourly_rate: hourlyRate || null,
                    experience_years: experience || null,
                    education,
                }),
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

    const customSubjects = subjects.filter((s) => !PRESET_SUBJECTS.includes(s));

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] p-[40px] max-w-[640px] mt-[24px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <>
            {/* Статус профиля — перед формой */}
            <ProfileStatus
                initialStatus={profileStatus}
                rejectionReason={rejectionReason}
                tutorId={userId}
            />

            <div className="bg-white rounded-[24px] p-[40px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[24px]">
                    Данные репетитора
                </h2>

                {/* === Headline === */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Короткое описание
                    </label>
                    <input
                        type="text"
                        value={headline}
                        onChange={(e) => {
                            setHeadline(e.target.value);
                            setError("");
                            setSuccess("");
                        }}
                        maxLength={MAX_HEADLINE_LENGTH}
                        placeholder="Математика и физика для школьников"
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        {headline.length} / {MAX_HEADLINE_LENGTH}
                    </p>
                </div>

                {/* === Предметы === */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[12px]">
                        Предметы
                    </label>

                    <div className="flex flex-wrap gap-[8px] mb-[12px]">
                        {PRESET_SUBJECTS.map((subject) => {
                            const isSelected = subjects.includes(subject);
                            return (
                                <button
                                    key={subject}
                                    type="button"
                                    onClick={() => toggleSubject(subject)}
                                    disabled={saving}
                                    className={`cursor-pointer px-[16px] py-[8px] rounded-full text-[14px] font-medium transition disabled:opacity-50 ${
                                        isSelected
                                            ? "bg-green text-black"
                                            : "bg-violet text-black hover:opacity-80"
                                    }`}
                                >
                                    {subject}
                                </button>
                            );
                        })}
                    </div>

                    {customSubjects.length > 0 && (
                        <div className="mt-[16px] mb-[12px]">
                            <p className="text-[12px] text-darkGray mb-[8px]">
                                Свои предметы:
                            </p>
                            <div className="flex flex-wrap gap-[8px]">
                                {customSubjects.map((subject) => (
                                    <span
                                        key={subject}
                                        className="flex items-center gap-[8px] px-[16px] py-[8px] rounded-full bg-green text-black text-[14px] font-medium"
                                    >
                                        {subject}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSubject(subject)
                                            }
                                            disabled={saving}
                                            className="cursor-pointer opacity-60 hover:opacity-100"
                                            aria-label={`Удалить ${subject}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-[16px]">
                        {showCustomInput ? (
                            <div className="flex gap-[8px]">
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) =>
                                        setCustomInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addCustomSubject();
                                        }
                                        if (e.key === "Escape") {
                                            setShowCustomInput(false);
                                            setCustomInput("");
                                        }
                                    }}
                                    maxLength={MAX_SUBJECT_LENGTH}
                                    placeholder="Название предмета"
                                    autoFocus
                                    className="flex-1 px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addCustomSubject}
                                    disabled={!customInput.trim() || saving}
                                    className="cursor-pointer bg-green text-black px-[20px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50"
                                >
                                    ОК
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowCustomInput(true)}
                                disabled={
                                    saving || subjects.length >= MAX_SUBJECTS
                                }
                                className="cursor-pointer text-blue hover:underline text-[14px] disabled:opacity-50"
                            >
                                + Добавить свой предмет
                            </button>
                        )}
                    </div>

                    <p className="text-[12px] text-darkGray mt-[8px]">
                        Выбрано: {subjects.length} / {MAX_SUBJECTS}
                    </p>
                </div>

                {/* === Цена === */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Цена за урок (BYN)
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={hourlyRate}
                        onChange={(e) => {
                            setHourlyRate(e.target.value);
                            setError("");
                            setSuccess("");
                        }}
                        placeholder="50"
                        maxLength={10}
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                </div>

                {/* === Опыт === */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Опыт преподавания (лет)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={experience}
                        onChange={(e) => {
                            setExperience(e.target.value.replace(/\D/g, ""));
                            setError("");
                            setSuccess("");
                        }}
                        placeholder="5"
                        maxLength={2}
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                </div>

                {/* === Образование === */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Образование
                    </label>
                    <textarea
                        value={education}
                        onChange={(e) => {
                            setEducation(e.target.value);
                            setError("");
                            setSuccess("");
                        }}
                        maxLength={1000}
                        rows={5}
                        placeholder="БГУ, факультет прикладной математики, 2018"
                        className="w-full px-[21px] pt-[13px] pb-[13px] rounded-[16px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        {education.length} / 1000
                    </p>
                </div>

                {error && <p className="text-red text-sm mb-[16px]">{error}</p>}
                {success && (
                    <p className="text-green text-sm mb-[16px]">{success}</p>
                )}

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50"
                >
                    {saving ? "Сохранение..." : "Сохранить"}
                </button>
            </div>
        </>
    );
}
