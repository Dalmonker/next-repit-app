"use client";

import { useEffect, useState } from "react";
import AvatarUpload from "./AvatarUpload";
import ProfileStatus from "./ProfileStatus";
import ProfileLink from "./ProfileLink";
import DeleteAccountBlock from "./DeleteAccountBlock";

import {
    extractDigits,
    formatPhoneDigits,
    normalizePhone,
    phoneFromDb,
} from "@/lib/phone";

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

// Хелпер: проверить, готов ли профиль к отправке
function checkProfileReady(data: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    headline: string;
    subjects: string[];
    education: string;
    experience: string;
}): boolean {
    return (
        data.firstName.trim().length > 0 &&
        data.lastName.trim().length > 0 &&
        data.avatarUrl !== null &&
        data.headline.trim().length > 0 &&
        data.subjects.length > 0 &&
        data.education.trim().length > 0 &&
        data.experience.trim() !== ""
    );
}

export default function ProfileTab({ email, role, userId }: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [headline, setHeadline] = useState("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    const [profileStatus, setProfileStatus] = useState<ProfileStatusType>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [slug, setSlug] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const resProfile = await fetch("/api/profile");
                const dataProfile = await resProfile.json();

                if (!resProfile.ok) {
                    setError(dataProfile.error || "Не удалось загрузить");
                    return;
                }

                const u = dataProfile.user;
                const fName = u.first_name ?? "";
                const lName = u.last_name ?? "";
                const aUrl = u.avatar_url ?? null;

                setFirstName(fName);
                setLastName(lName);
                setMiddleName(u.middle_name ?? "");
                setPhone(phoneFromDb(u.phone ?? null));
                setAvatarUrl(aUrl);

                if (role === "tutor") {
                    const resTutor = await fetch("/api/profile/tutor");
                    const dataTutor = await resTutor.json();

                    if (resTutor.ok) {
                        const hl = dataTutor.headline ?? "";
                        const subs = dataTutor.subjects ?? [];
                        const edu = dataTutor.education ?? "";
                        const exp =
                            dataTutor.experience_years !== null &&
                            dataTutor.experience_years !== undefined
                                ? String(dataTutor.experience_years)
                                : "";

                        setHeadline(hl);
                        setSubjects(subs);
                        setEducation(edu);
                        setExperience(exp);
                        setProfileStatus(dataTutor.status ?? null);
                        setRejectionReason(dataTutor.rejection_reason ?? null);
                        setSlug(dataTutor.slug ?? null);

                        // Если всё уже заполнено в БД — считаем "сохранено"
                        const ready = checkProfileReady({
                            firstName: fName,
                            lastName: lName,
                            avatarUrl: aUrl,
                            headline: hl,
                            subjects: subs,
                            education: edu,
                            experience: exp,
                        });
                        setSaved(ready);
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

    function markDirty() {
        setSaved(false);
        setSuccess("");
        setError("");
    }

    function toggleSubject(subject: string) {
        markDirty();
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
        markDirty();
        setSubjects((prev) => [...prev, value]);
        setCustomInput("");
        setShowCustomInput(false);
    }

    async function handleSave() {
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const resProfile = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    middle_name: middleName,
                    phone: phone.trim() ? normalizePhone(phone) : "",
                }),
            });

            const dataProfile = await resProfile.json();

            if (!resProfile.ok) {
                setError(dataProfile.error || "Ошибка сохранения профиля");
                return;
            }

            if (role === "tutor") {
                const resTutor = await fetch("/api/profile/tutor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        headline,
                        subjects,
                        education,
                        experience_years: experience || null,
                    }),
                });

                const dataTutor = await resTutor.json();

                if (!resTutor.ok) {
                    setError(dataTutor.error || "Ошибка сохранения");
                    return;
                }

                const resStatus = await fetch("/api/profile/tutor");
                const dataStatus = await resStatus.json();
                if (resStatus.ok) {
                    setProfileStatus(dataStatus.status ?? null);
                    setRejectionReason(dataStatus.rejection_reason ?? null);
                    setSlug(dataStatus.slug ?? null);
                }
            }

            setSuccess("Сохранено");
            setSaved(true);
        } catch {
            setError("Ошибка сети");
        } finally {
            setSaving(false);
        }
    }

    const customSubjects = subjects.filter((s) => !PRESET_SUBJECTS.includes(s));

    const profileReady = checkProfileReady({
        firstName,
        lastName,
        avatarUrl,
        headline,
        subjects,
        education,
        experience,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-[60px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[20px]">
            {role === "tutor" && (
                <ProfileStatus
                    initialStatus={profileStatus}
                    rejectionReason={rejectionReason}
                    tutorId={userId}
                    slug={slug}
                    profileReady={profileReady && saved}
                />
            )}

            {role === "tutor" && profileStatus === "approved" && slug && (
                <ProfileLink
                    slug={slug}
                    baseUrl={
                        process.env.NEXT_PUBLIC_SITE_URL ?? "https://ripit.by"
                    }
                />
            )}

            {/* 3. Персональная информация */}
            <div className="bg-white rounded-[24px] p-[32px]">
                <h2 className="font-days text-[22px] text-black mb-[24px]">
                    Персональная информация
                </h2>

                <div className="flex flex-col md:flex-row gap-[54px] items-start">
                    <AvatarUpload
                        currentUrl={avatarUrl}
                        onChange={(url) => {
                            setAvatarUrl(url);
                            markDirty();
                        }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] flex-1 w-full">
                        <div>
                            <label className="block font-medium text-[17px] text-gray mb-[12px]">
                                Имя <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    markDirty();
                                }}
                                maxLength={50}
                                className="w-full px-[21px] pt-[16px] pb-[18px] rounded-full border border-violet bg-white text-black focus:border-green outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-[17px] text-gray mb-[12px]">
                                Фамилия <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    markDirty();
                                }}
                                maxLength={50}
                                className="w-full px-[21px] pt-[16px] pb-[18px] rounded-full border border-violet bg-white text-black focus:border-green outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-[17px] text-gray mb-[12px]">
                                Отчество
                            </label>
                            <input
                                type="text"
                                value={middleName}
                                onChange={(e) => {
                                    setMiddleName(e.target.value);
                                    markDirty();
                                }}
                                maxLength={50}
                                placeholder="Ваше отчество"
                                className="w-full px-[21px] pt-[16px] pb-[18px] rounded-full border border-violet bg-white text-black text-[17px] placeholder:text-clue focus:border-green outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Контакты */}
            <div className="bg-white rounded-[30px] p-[30px] pb-[34px]">
                <h2 className="font-days text-[22px] text-black mb-[20px]">
                    Контакты
                </h2>

                <div className="mb-[24px]">
                    <label className="block text-[17px] text-gray font-medium mb-[12px]">
                        Почта для входа
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="w-full px-[20px] pt-[15px] pb-[17px] rounded-full border border-violet bg-violet text-gray cursor-not-allowed outline-none"
                    />
                    <p className="text-[15px]/20% text-darkGray mt-[12px]">
                        Email нельзя изменить
                    </p>
                </div>

                <div>
                    <label className="block text-[17px] text-gray font-medium mb-[12px]">
                        Телефон
                    </label>
                    <div className="flex items-center w-full px-[20px] pt-[15px] pb-[17px] rounded-full border border-violet bg-white focus-within:border-green transition-all">
                        <span className="text-black font-medium text-[17px] select-none">
                            +375
                        </span>
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={(e) => {
                                const digits = extractDigits(
                                    e.target.value,
                                ).slice(0, 9);
                                setPhone(formatPhoneDigits(digits));
                                markDirty();
                            }}
                            placeholder="29 301-13-11"
                            maxLength={12}
                            className="flex-1 ml-[8px] bg-transparent text-black text-[17px] placeholder:text-clue outline-none"
                        />
                    </div>
                    <p className="text-[15px]/20% text-darkGray mt-[8px]">
                        Необязательно. Отображается на странице для звонка.
                    </p>
                </div>
            </div>

            {/* 5. Преподаваемые дисциплины */}
            {role === "tutor" && (
                <div className="bg-white rounded-[24px] p-[32px]">
                    <div className="flex items-center justify-between mb-[20px]">
                        <h2 className="font-days text-[22px] text-black">
                            Преподаваемые дисциплины{" "}
                            <span className="text-red">*</span>
                        </h2>
                        <span className="text-[12px] text-darkGray">
                            {subjects.length}/{MAX_SUBJECTS}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-[10px] mb-[16px]">
                        {PRESET_SUBJECTS.map((subject) => {
                            const isSelected = subjects.includes(subject);
                            return (
                                <button
                                    key={subject}
                                    type="button"
                                    onClick={() => toggleSubject(subject)}
                                    disabled={saving}
                                    className={`cursor-pointer font-medium px-[16px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% transition disabled:opacity-50 ${
                                        isSelected
                                            ? "bg-green text-black"
                                            : "bg-violet text-black hover:opacity-80"
                                    }`}
                                >
                                    {subject}
                                </button>
                            );
                        })}

                        {customSubjects.map((subject) => (
                            <span
                                key={subject}
                                className="flex items-center gap-[8px] font-medium px-[16px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% bg-green text-black"
                            >
                                {subject}
                                <button
                                    type="button"
                                    onClick={() => toggleSubject(subject)}
                                    disabled={saving}
                                    className="cursor-pointer opacity-60 hover:opacity-100"
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                        {!showCustomInput && (
                            <button
                                type="button"
                                onClick={() => setShowCustomInput(true)}
                                disabled={
                                    saving || subjects.length >= MAX_SUBJECTS
                                }
                                className="cursor-pointer font-medium px-[16px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% bg-white border border-violet text-black hover:opacity-80 transition disabled:opacity-50"
                            >
                                + Добавить
                            </button>
                        )}
                    </div>

                    {showCustomInput && (
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
                                className="flex-1 px-[16px] py-[10px] rounded-full border border-violet bg-white text-black focus:border-green outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={addCustomSubject}
                                disabled={!customInput.trim() || saving}
                                className="cursor-pointer bg-green text-black px-[24px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50 font-medium"
                            >
                                ОК
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 6. О себе */}
            {role === "tutor" && (
                <div className="bg-white rounded-[30px] p-[30px] pb-[34px]">
                    <h2 className="font-days text-[22px] text-black mb-[20px]">
                        О себе
                    </h2>

                    <div className="mb-[20px]">
                        <div className="flex justify-between items-baseline mb-[8px]">
                            <label className="font-medium text-[17px] text-gray">
                                Описание <span className="text-red">*</span>
                            </label>
                            <span className="text-[12px] text-darkGray">
                                {headline.length}/{MAX_HEADLINE_LENGTH}
                            </span>
                        </div>
                        <textarea
                            value={headline}
                            onChange={(e) => {
                                setHeadline(e.target.value);
                                markDirty();
                            }}
                            maxLength={MAX_HEADLINE_LENGTH}
                            placeholder="..."
                            className="w-full h-[200px] px-[20px] pt-[15px] pb-[15px] rounded-[30px] border border-violet bg-white text-black text-[17px] placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                        />
                        <div className="text-[15px]/20% text-darkGray">
                            Описание отобразится на странице учителя
                        </div>
                    </div>

                    <div className="mb-[20px]">
                        <div className="flex justify-between items-baseline mb-[8px]">
                            <label className="font-medium text-[17px] text-gray">
                                Образование <span className="text-red">*</span>
                            </label>
                            <span className="text-[12px] text-darkGray">
                                {education.length}/{MAX_EDUCATION_LENGTH}
                            </span>
                        </div>
                        <textarea
                            value={education}
                            onChange={(e) => {
                                setEducation(e.target.value);
                                markDirty();
                            }}
                            maxLength={MAX_EDUCATION_LENGTH}
                            placeholder="Расскажите, где вы учились"
                            className="w-full h-[200px] px-[20px] pt-[15px] pb-[15px] rounded-[30px] border border-violet bg-white text-black text-[17px] placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                        />
                        <div className="text-[15px]/20% text-darkGray">
                            Описание отобразится на странице учителя
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-[17px] text-gray mb-[8px]">
                            Опыт преподавания (лет){" "}
                            <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={experience}
                            onChange={(e) => {
                                setExperience(
                                    e.target.value.replace(/\D/g, ""),
                                );
                                markDirty();
                            }}
                            placeholder="0"
                            maxLength={2}
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
                disabled={saving || !profileReady}
                className="cursor-pointer w-full bg-green text-black pt-[14px] pb-[16px] rounded-[16px] font-medium hover:bg-[#c2e055] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {saving ? "Сохранение..." : "Сохранить"}
            </button>

            {!profileReady && (
                <p className="text-darkGray text-[13px] text-center">
                    Заполните обязательные поля: имя, фамилия, фото, описание,
                    предметы, образование, опыт
                </p>
            )}

            {/* Удаление аккаунта */}
            <DeleteAccountBlock />
        </div>
    );
}
