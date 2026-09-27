"use client";

import { useEffect, useState } from "react";
import AvatarUpload from "./AvatarUpload";
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
const MAX_HEADLINE_LENGTH = 600;
const MAX_EDUCATION_LENGTH = 600;

type ProfileStatusType =
    "draft" | "pending" | "approved" | "rejected" | "hidden" | null;

type Props = {
    email: string;
    role: "student" | "parent" | "tutor";
    userId: number;
};

export default function ProfileTab({ email, role, userId }: Props) {
    // ===== Общие поля (users) =====
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // ===== Поля репетитора (tutor_profiles) =====
    const [headline, setHeadline] = useState("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    // ===== Статус =====
    const [profileStatus, setProfileStatus] = useState<ProfileStatusType>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    // ===== UI =====
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ===== Загрузка =====
    useEffect(() => {
        async function load() {
            try {
                // Общий профиль
                const resProfile = await fetch("/api/profile");
                const dataProfile = await resProfile.json();

                if (!resProfile.ok) {
                    setError(dataProfile.error || "Не удалось загрузить");
                    return;
                }

                const u = dataProfile.user;
                setFirstName(u.first_name ?? "");
                setLastName(u.last_name ?? "");
                setMiddleName(u.middle_name ?? "");
                setPhone(u.phone ?? "");
                setAvatarUrl(u.avatar_url ?? null);

                // Профиль репетитора
                if (role === "tutor") {
                    const resTutor = await fetch("/api/profile/tutor");
                    const dataTutor = await resTutor.json();

                    if (resTutor.ok) {
                        setHeadline(dataTutor.headline ?? "");
                        setSubjects(dataTutor.subjects ?? []);
                        setEducation(dataTutor.education ?? "");
                        setExperience(
                            dataTutor.experience_years !== null &&
                                dataTutor.experience_years !== undefined
                                ? String(dataTutor.experience_years)
                                : "",
                        );
                        setHourlyRate(
                            dataTutor.hourly_rate
                                ? String(dataTutor.hourly_rate)
                                : "",
                        );
                        setProfileStatus(dataTutor.status ?? null);
                        setRejectionReason(dataTutor.rejection_reason ?? null);
                    }
                }
            } catch {
                setError("Ошибка сети");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [role]);

    // ===== Subject handlers =====
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
    }

    // ===== Сохранение =====
    async function handleSave() {
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            // 1. Общие поля
            const resProfile = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    middle_name: middleName,
                    phone,
                }),
            });

            const dataProfile = await resProfile.json();

            if (!resProfile.ok) {
                setError(dataProfile.error || "Ошибка сохранения профиля");
                return;
            }

            // 2. Поля репетитора
            if (role === "tutor") {
                const resTutor = await fetch("/api/profile/tutor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        headline,
                        subjects,
                        education,
                        experience_years: experience || null,
                        hourly_rate: hourlyRate || null,
                    }),
                });

                const dataTutor = await resTutor.json();

                if (!resTutor.ok) {
                    setError(dataTutor.error || "Ошибка сохранения");
                    return;
                }

                // Обновляем статус (мог сброситься в pending)
                const resStatus = await fetch("/api/profile/tutor");
                const dataStatus = await resStatus.json();
                if (resStatus.ok) {
                    setProfileStatus(dataStatus.status ?? null);
                    setRejectionReason(dataStatus.rejection_reason ?? null);
                }
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
            <div className="flex items-center justify-center py-[60px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[24px] max-w-[900px]">
            {/* 1. Статус профиля */}
            {role === "tutor" && (
                <ProfileStatus
                    initialStatus={profileStatus}
                    rejectionReason={rejectionReason}
                    tutorId={userId}
                />
            )}

            {/* 2. Персональная информация */}
            <div className="bg-white rounded-[24px] p-[32px]">
                <h2 className="font-days text-[22px] text-black mb-[24px]">
                    Персональная информация
                </h2>

                <div className="flex flex-col md:flex-row gap-[24px] items-start">
                    <AvatarUpload
                        currentUrl={avatarUrl}
                        onChange={(url) => setAvatarUrl(url)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] flex-1 w-full">
                        <div>
                            <label className="block text-[13px] text-darkGray mb-[6px]">
                                Имя
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setSuccess("");
                                }}
                                maxLength={50}
                                className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black focus:border-green outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] text-darkGray mb-[6px]">
                                Фамилия
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    setSuccess("");
                                }}
                                maxLength={50}
                                className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black focus:border-green outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] text-darkGray mb-[6px]">
                                Отчество
                            </label>
                            <input
                                type="text"
                                value={middleName}
                                onChange={(e) => {
                                    setMiddleName(e.target.value);
                                    setSuccess("");
                                }}
                                maxLength={50}
                                placeholder="Ваше отчество"
                                className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Контакты */}
            <div className="bg-white rounded-[24px] p-[32px]">
                <h2 className="font-days text-[22px] text-black mb-[24px]">
                    Контакты
                </h2>

                <div className="mb-[20px]">
                    <label className="block text-[13px] text-darkGray mb-[6px]">
                        Почта для входа
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-violet text-darkGray cursor-not-allowed outline-none"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        Email нельзя изменить
                    </p>
                </div>

                <div>
                    <label className="block text-[13px] text-darkGray mb-[6px]">
                        Телефон
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            setSuccess("");
                        }}
                        placeholder="+375 29 123-45-67"
                        maxLength={20}
                        className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        Необязательно. Отображается на странице для звонка.
                    </p>
                </div>
            </div>

            {/* 4. Преподаваемые дисциплины (только репетитор) */}
            {role === "tutor" && (
                <div className="bg-white rounded-[24px] p-[32px]">
                    <div className="flex items-center justify-between mb-[20px]">
                        <h2 className="font-days text-[22px] text-black">
                            Преподаваемые дисциплины
                        </h2>
                        <span className="text-[12px] text-darkGray">
                            {subjects.length}/{MAX_SUBJECTS}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-[8px] mb-[16px]">
                        {PRESET_SUBJECTS.map((subject) => {
                            const isSelected = subjects.includes(subject);
                            return (
                                <button
                                    key={subject}
                                    type="button"
                                    onClick={() => toggleSubject(subject)}
                                    disabled={saving}
                                    className={`cursor-pointer px-[14px] py-[6px] rounded-full text-[13px] transition disabled:opacity-50 ${
                                        isSelected
                                            ? "bg-green text-black font-medium"
                                            : "bg-violet text-black hover:opacity-80"
                                    }`}
                                >
                                    {subject}
                                </button>
                            );
                        })}
                    </div>

                    {customSubjects.length > 0 && (
                        <div className="mb-[16px]">
                            <p className="text-[12px] text-darkGray mb-[8px]">
                                Свои предметы:
                            </p>
                            <div className="flex flex-wrap gap-[8px]">
                                {customSubjects.map((subject) => (
                                    <span
                                        key={subject}
                                        className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-full bg-green text-black text-[13px] font-medium"
                                    >
                                        {subject}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSubject(subject)
                                            }
                                            disabled={saving}
                                            className="cursor-pointer opacity-60 hover:opacity-100"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {showCustomInput ? (
                        <div className="flex gap-[8px]">
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
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
                                className="flex-1 px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black focus:border-green outline-none transition-all"
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
                            disabled={saving || subjects.length >= MAX_SUBJECTS}
                            className="cursor-pointer text-blue hover:underline text-[13px] disabled:opacity-50"
                        >
                            + Добавить свой предмет
                        </button>
                    )}
                </div>
            )}

            {/* 5. О себе (только репетитор) */}
            {role === "tutor" && (
                <div className="bg-white rounded-[24px] p-[32px]">
                    <h2 className="font-days text-[22px] text-black mb-[24px]">
                        О себе
                    </h2>

                    <div className="mb-[20px]">
                        <div className="flex justify-between items-baseline mb-[8px]">
                            <label className="text-[14px] text-black">
                                Описание
                            </label>
                            <span className="text-[12px] text-darkGray">
                                {headline.length}/{MAX_HEADLINE_LENGTH}
                            </span>
                        </div>
                        <textarea
                            value={headline}
                            onChange={(e) => {
                                setHeadline(e.target.value);
                                setSuccess("");
                            }}
                            maxLength={MAX_HEADLINE_LENGTH}
                            rows={4}
                            placeholder="Расскажите о себе и о том, как проходят занятия"
                            className="w-full px-[16px] py-[12px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="mb-[20px]">
                        <div className="flex justify-between items-baseline mb-[8px]">
                            <label className="text-[14px] text-black">
                                Образование
                            </label>
                            <span className="text-[12px] text-darkGray">
                                {education.length}/{MAX_EDUCATION_LENGTH}
                            </span>
                        </div>
                        <textarea
                            value={education}
                            onChange={(e) => {
                                setEducation(e.target.value);
                                setSuccess("");
                            }}
                            maxLength={MAX_EDUCATION_LENGTH}
                            rows={4}
                            placeholder="Расскажите, где вы учились"
                            className="w-full px-[16px] py-[12px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] text-black mb-[8px]">
                            Опыт преподавания (лет)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={experience}
                            onChange={(e) => {
                                setExperience(
                                    e.target.value.replace(/\D/g, ""),
                                );
                                setSuccess("");
                            }}
                            placeholder="0"
                            maxLength={2}
                            className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            {/* 6. Цена (только репетитор) */}
            {role === "tutor" && (
                <div className="bg-white rounded-[24px] p-[32px]">
                    <h2 className="font-days text-[22px] text-black mb-[24px]">
                        Стоимость занятий
                    </h2>

                    <div>
                        <label className="block text-[14px] text-black mb-[8px]">
                            Цена за урок (BYN)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={hourlyRate}
                            onChange={(e) => {
                                setHourlyRate(e.target.value);
                                setSuccess("");
                            }}
                            placeholder="50"
                            maxLength={10}
                            className="w-full px-[16px] py-[10px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Сообщения */}
            {error && (
                <div className="bg-red/10 text-red rounded-[12px] p-[16px] text-[14px]">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green/20 text-black rounded-[12px] p-[16px] text-[14px]">
                    {success}
                </div>
            )}

            {/* Кнопка Сохранить */}
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer w-full bg-green text-black pt-[14px] pb-[16px] rounded-[16px] font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
            >
                {saving ? "Сохранение..." : "Сохранить"}
            </button>
        </div>
    );
}
