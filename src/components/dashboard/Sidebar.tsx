"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Svg } from "@/components/Svg";

const MENU = [
    { href: "/dashboard", label: "Главная", icon: "home" },
    { href: "/dashboard/students", label: "Ученики", icon: "users" },
    { href: "/dashboard/schedule", label: "Расписание", icon: "calendar" },
    { href: "/dashboard/statistics", label: "Статистика", icon: "chart" },
    { href: "/dashboard/finance", label: "Финансы", icon: "wallet" },
    {
        href: "/dashboard/notifications",
        label: "Уведомления",
        icon: "bell",
        badge: 3,
    },
];

const SECONDARY = [
    { href: "/dashboard/settings", label: "Настройки", icon: "settings" },
    { href: "/dashboard/support", label: "Поддержка", icon: "help" },
];

export default function Sidebar() {
    const pathname = usePathname();

    function renderItem(item: {
        href: string;
        label: string;
        badge?: number;
    }) {
        const isActive =
            item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/student") ||
                  pathname.startsWith("/dashboard/tutor") ||
                  pathname.startsWith("/dashboard/parent")
                : pathname === item.href;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] mb-[4px] text-[15px] transition ${
                    isActive
                        ? "bg-green text-black font-medium"
                        : "text-darkGray hover:bg-violet hover:text-black"
                }`}
            >
                <span className="w-[20px] h-[20px] flex items-center justify-center opacity-80">
                    {/* Пока иконок нет — заглушка */}
                    <span className="block w-[6px] h-[6px] rounded-full bg-current" />
                </span>
                <span>{item.label}</span>
                {item.badge && (
                    <span className="ml-auto bg-[#EEF861] text-black text-[12px] font-medium px-[8px] py-[2px] rounded-full">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <aside className="w-[240px] min-h-screen bg-white border-r border-[#EDEDF5] flex flex-col p-[20px]">
            {/* Логотип */}
            <div className="flex items-center justify-between mb-[32px]">
                <Svg iconId="logo" className="w-[74px] h-[42px]" />
                <button
                    type="button"
                    className="cursor-pointer w-[28px] h-[28px] flex items-center justify-center rounded-[8px] border border-[#EDEDF5] text-darkGray hover:bg-violet"
                    aria-label="Свернуть"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {/* Основное меню */}
            <nav className="flex-1">
                {MENU.map(renderItem)}

                {/* Разделитель */}
                <div className="h-[1px] bg-[#EDEDF5] my-[20px]" />

                {SECONDARY.map(renderItem)}
            </nav>

            {/* Кнопки внизу */}
            <div className="flex items-center gap-[8px] mb-[20px]">
                <Link
                    href="/dashboard/create"
                    className="flex-1 flex items-center justify-center gap-[8px] bg-[#2E2A45] text-white text-[14px] font-medium py-[10px] rounded-[10px] hover:opacity-90 transition"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Создать
                </Link>

                <button
                    type="button"
                    className="cursor-pointer flex items-center justify-center gap-[6px] border border-[#EDEDF5] text-[14px] text-darkGray px-[12px] py-[10px] rounded-[10px] hover:bg-violet"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Тенюх
                </button>
            </div>

            {/* Профиль */}
            <div className="flex items-center gap-[12px] pt-[16px] border-t border-[#EDEDF5]">
                <div className="w-[36px] h-[36px] rounded-full bg-violet shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-black truncate">
                        Дмитрий
                    </p>
                    <p className="text-[12px] text-darkGray truncate">
                        Партнёров
                    </p>
                </div>
                <button
                    type="button"
                    className="cursor-pointer text-darkGray hover:text-black"
                    aria-label="Выйти"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}