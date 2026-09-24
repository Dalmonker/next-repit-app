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

        // Локальный превью
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
                setPreview(currentUrl); // откат
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
        <div className="mb-[24px]">
            <label className="block font-medium text-black mb-[8px]">
                Фото
            </label>

            <div className="flex items-center gap-[20px]">
                <div className="w-[100px] h-[100px] rounded-full bg-violet overflow-hidden shrink-0">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Аватар"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-darkGray text-[12px]">
                            Нет фото
                        </div>
                    )}
                </div>

                <div>
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
                        className="cursor-pointer bg-green text-black px-[24px] py-[10px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50"
                    >
                        {uploading ? "Загрузка..." : "Загрузить фото"}
                    </button>

                    <p className="text-[12px] text-darkGray mt-[6px]">
                        JPG, PNG или WebP, до 2 МБ
                    </p>

                    {error && (
                        <p className="text-red text-[12px] mt-[6px]">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
