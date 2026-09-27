"use client";

import { useState, useRef } from "react";

type Props = {
    currentUrl: string | null;
    onChange: (url: string) => void;
};

export default function AvatarUpload({ currentUrl, onChange }: Props) {
    const [preview, setPreview] = useState<string | null>(currentUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        setError("");
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploading(true);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await fetch("/api/profile/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка загрузки");
                setPreview(currentUrl);
                return;
            }

            onChange(data.avatarUrl);
            setPreview(data.avatarUrl);
        } catch {
            setError("Ошибка сети");
            setPreview(currentUrl);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="relative shrink-0">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="cursor-pointer relative w-[80px] h-[80px] rounded-full overflow-hidden bg-violet group disabled:opacity-50"
                aria-label="Загрузить фото"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Аватар"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-darkGray text-[11px] text-center px-[8px]">
                        {uploading ? "..." : "Нет фото"}
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium">
                        {uploading ? "Загрузка" : "Изменить"}
                    </span>
                </div>
            </button>

            {/* Значок карандаша */}
            {!uploading && (
                <div className="absolute -bottom-[2px] -right-[2px] w-[24px] h-[24px] rounded-full bg-[#2E2A45] flex items-center justify-center pointer-events-none">
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </div>
            )}

            {error && (
                <p className="absolute top-full left-0 right-0 text-red text-[11px] mt-[6px] text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
