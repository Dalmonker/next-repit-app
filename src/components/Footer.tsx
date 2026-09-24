import Link from "next/link";
import Header from "@/components/Header";
import { Svg } from "@/components/Svg";

export default function Footer() {
    return (
        <footer className="w-full bg-[#2E2A45] text-[#B8B5C7]">
            <div className="container py-[50px]">
                {/* top */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Svg
                            className="w-[74px] h-[42px]"
                            iconId="logo"
                            color="#F3F3F3"
                        />
                    </Link>

                    <nav className="flex items-center gap-8 text-clue font-medium">
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            О платформе
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            Преимущества
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            Репетиторы
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            Отзывы
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            Блог
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-blue-600 transition"
                        >
                            FAQ
                        </Link>
                    </nav>
                </div>
                {/* top-end */}

                <div className="pt-[60px] flex flex-col gap-[16px] border-b border-[#3D3857]">
                    <div className="flex items-center gap-[16px]">
                        {/* Иконки соцсетей */}
                        <a
                            href="https://t.me/ripit_support"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Telegram"
                            className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-[10px] hover:opacity-80 transition"
                        >
                            {/* Telegram */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21.5 4.5L2.5 11.5L8.5 13.5L10.5 19.5L13.5 15.5L19.5 19.5L21.5 4.5Z"
                                    stroke="#2E2A45"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>

                        <a
                            href="mailto:support@ripit.by"
                            aria-label="Email"
                            className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-[10px] hover:opacity-80 transition"
                        >
                            {/* Mail */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                    stroke="#2E2A45"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M3 7L12 13L21 7"
                                    stroke="#2E2A45"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </a>
                    </div>

                    <div>
                        <a
                            href="mailto:support@ripit.by"
                            className="block text-white text-[18px] font-semibold hover:underline"
                        >
                            support@ripit.by
                        </a>
                        <p className="text-[14px] mt-[4px]">
                            ответим за 1 рабочий день
                        </p>
                    </div>
                </div>

                {/* Средняя часть: правовая информация + ссылки */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[20px] md:gap-[60px] py-[40px] border-b border-[#3D3857]">
                    <div>
                        <p className="text-[15px] text-white">
                            Правовая информация
                        </p>
                    </div>

                    <div className="flex flex-col gap-[16px] text-[14px] leading-[1.5]">
                        <p>УНП BA9210221 · Республика Беларусь</p>

                        <p>
                            Мы используем файлы cookie для персонализации
                            сервисов и повышения удобства пользования сайтом.
                            Если вы не согласны на их использование, поменяйте
                            настройки браузера
                        </p>

                        <Link
                            href="/policy"
                            className="hover:text-white transition-colors"
                        >
                            Политика обработки персональных данных
                        </Link>

                        <Link
                            href="/terms"
                            className="hover:text-white transition-colors"
                        >
                            Пользовательское соглашение
                        </Link>
                    </div>
                </div>

                {/* Нижняя часть: копирайт и дизайнер */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[12px] pt-[30px] text-[13px]">
                    <p>© Ripit, 2026</p>
                    <p className="text-[#8A87A0]">
                        Designed by Alina Gavrilovich
                    </p>
                </div>
            </div>
        </footer>
    );
}
