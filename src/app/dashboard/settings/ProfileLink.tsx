"use client";

import { useState } from "react";

type Props = {
    slug: string;
    baseUrl: string;
};

export default function ProfileLink({ slug, baseUrl }: Props) {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const cleanBase = baseUrl.replace(/\/$/, "");
    const fullUrl = `${cleanBase}/tutors/${slug}`;

    async function handleCopy() {
        setError("");

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(fullUrl);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = fullUrl;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Не удалось скопировать");
        }
    }

    return (
        <div className="bg-white rounded-[30px] p-[30px] pb-[34px]">
            <h2 className="font-days text-[22px] text-black mb-[18px]">
                Ссылка на ваш профиль
            </h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-[10px] mb-[14px]">
                <div className="flex-1 flex items-center rounded-full overflow-hidden min-w-0 border border-violet">
                    <span className="bg-violet px-[20px] py-[14px] text-darkGray text-[15px] select-none whitespace-nowrap">
                        {cleanBase}/tutors/
                    </span>
                    <span className="px-[20px] py-[14px] text-black text-[15px] truncate">
                        {slug}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="cursor-pointer bg-white border border-whiteTxt text-black px-[26px] py-[14px] rounded-full font-medium hover:bg-violet transition text-[15px] whitespace-nowrap"
                >
                    {copied ? "Скопировано" : "Копировать"}
                </button>
            </div>

            {error && <p className="text-red text-[13px] mb-[8px]">{error}</p>}

            <p className="text-darkGray text-[15px] leading-[20%]">
                По этой ссылке ученики смогут найти ваш профиль. Её можно
                скопировать и отправить ученику
            </p>
        </div>
    );
}
