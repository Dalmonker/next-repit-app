import Link from "next/link";
import Image from "next/image";
import { Svg } from "@/components/Svg";

export default function Header() {
    return (
        <header className="pt-[40px]">
            <div className="container flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Svg className="w-[74px] h-[42px]" iconId="logo" />
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
                    <Link href="#" className="hover:text-blue-600 transition">
                        О платформе
                    </Link>
                    <Link href="#" className="hover:text-blue-600 transition">
                        Преимущества
                    </Link>
                    <Link href="#" className="hover:text-blue-600 transition">
                        Репетиторы
                    </Link>
                    <Link href="#" className="hover:text-blue-600 transition">
                        Отзывы
                    </Link>
                    <Link href="#" className="hover:text-blue-600 transition">
                        Блог
                    </Link>
                    <Link href="#" className="hover:text-blue-600 transition">
                        FAQ
                    </Link>
                </nav>

                <Link
                    href="/login"
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                    Войти
                </Link>
            </div>
        </header>
    );
}
