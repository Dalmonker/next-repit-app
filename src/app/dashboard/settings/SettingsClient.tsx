"use client";
import AvatarUpload from "./AvatarUpload";
import TutorSettings from "./TutorSettings";
import StudentSettings from "./StudentSettings";

import { useEffect, useState } from "react";

type Props = {
    email: string;
    role: "student" | "parent" | "tutor";
    userId: number;
};

type Profile = {
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    bio: string;
};

const EMPTY: Profile = {
    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
    bio: "",
};

export default function SettingsClient({ email, role, userId }: Props) {
    const [profile, setProfile] = useState<Profile>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Загружаем профиль при монтировании
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Не удалось загрузить профиль");
                    return;
                }

                const u = data.user;
                setProfile({
                    first_name: u.first_name ?? "",
                    last_name: u.last_name ?? "",
                    middle_name: u.middle_name ?? "",
                    phone: u.phone ?? "",
                    bio: u.bio ?? "",
                });
                setAvatarUrl(u.avatar_url ?? null);
            } catch {
                setError("Ошибка сети");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    function update<K extends keyof Profile>(key: K, value: string) {
        setProfile((p) => ({ ...p, [key]: value }));
        setSuccess("");
        setError("");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
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
            <div className="flex items-center justify-center py-[60px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <>
            <h1 className="font-days text-[32px] text-black mb-[24px]">
                Настройки
            </h1>

            <form
                onSubmit={handleSave}
                className="bg-white rounded-[24px] p-[40px] max-w-[640px]"
            >
                {/* Аватар */}
                <AvatarUpload
                    currentUrl={avatarUrl}
                    onChange={(url) => setAvatarUrl(url)}
                />

                {/* Email — только для чтения */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-violet text-darkGray cursor-not-allowed outline-none"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        Email нельзя изменить
                    </p>
                </div>

                {/* ФИО — три поля в одной строке */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-[24px]">
                    <div>
                        <label className="block font-medium text-black mb-[8px]">
                            Фамилия
                        </label>
                        <input
                            type="text"
                            value={profile.last_name}
                            onChange={(e) =>
                                update("last_name", e.target.value)
                            }
                            maxLength={50}
                            className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-black mb-[8px]">
                            Имя
                        </label>
                        <input
                            type="text"
                            value={profile.first_name}
                            onChange={(e) =>
                                update("first_name", e.target.value)
                            }
                            maxLength={50}
                            className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-black mb-[8px]">
                            Отчество
                        </label>
                        <input
                            type="text"
                            value={profile.middle_name}
                            onChange={(e) =>
                                update("middle_name", e.target.value)
                            }
                            maxLength={50}
                            className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Телефон */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        Телефон
                    </label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+375291234567"
                        maxLength={20}
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                </div>

                {/* О себе */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-black mb-[8px]">
                        О себе
                    </label>
                    <textarea
                        value={profile.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        maxLength={1000}
                        rows={5}
                        className="w-full px-[21px] pt-[13px] pb-[13px] rounded-[16px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all resize-none"
                    />
                    <p className="text-[12px] text-darkGray mt-[6px]">
                        {profile.bio.length} / 1000
                    </p>
                </div>

                {/* Сообщения */}
                {error && <p className="text-red text-sm mb-[16px]">{error}</p>}
                {success && (
                    <p className="text-green text-sm mb-[16px]">{success}</p>
                )}

                {/* Кнопка */}
                <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50"
                >
                    {saving ? "Сохранение..." : "Сохранить"}
                </button>
            </form>
            {role === "tutor" && <TutorSettings userId={userId} />}
            {role === "student" && <StudentSettings />}
        </>
    );
}
