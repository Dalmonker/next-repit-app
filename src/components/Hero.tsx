import Image from "next/image";
import Link from "next/link";
import { Svg } from "@/components/Svg";

export default function Hero() {
    return (
        <section className="container pt-[60px]">
            <Link
                href="#"
                className="
                inline-flex 
                items-center text-black
                gap-[6px] mb-[20px] 
                border font-medium
                border-blackTitle 
                rounded-full bg-white 
                py-[6px] pl-[6px] pr-[16px]"
            >
                <div className="flex items-center -space-x-[15px]">
                    <div className="w-[36px] h-[36px] rounded-full bg-lightGray border-2 border-white flex items-center justify-center overflow-hidden">
                        📖
                    </div>

                    <div className="w-[36px] h-[36px] rounded-full bg-lightGray border-2 border-white flex items-center justify-center overflow-hidden">
                        📐
                    </div>

                    <div className="w-[36px] h-[36px] rounded-full bg-green border-2 border-white flex items-center justify-center">
                        <span>9+</span>
                    </div>
                </div>

                <span className="text-[17px]">направлений</span>
            </Link>

            <div className="bg-[#5B4DDF] rounded-[2rem] px-[50px] pb-[50px] pt-[46px]">
                <div className="">
                    <h1 className="font-days mb-[20px] max-w-[615px] text-[52px] text-white leading-[120%] tracking-[-0.43px]">
                        Учитесь с репетитором, который превращает уроки в
                        прогресс
                    </h1>

                    <p className="font-medium text-[24px] text-white">
                        Вместе достигаем целей на удобной платформе
                    </p>

                    <button className="font-medium text-black text-[17px] mt-[40px] bg-green px-[26px] py-[16px] rounded-full cursor-pointer">
                        Найти репетитора
                    </button>
                </div>
            </div>

            <div className="mt-16">
                <h2 className="font-days font-bold">Добро пожаловать</h2>
            </div>
        </section>
    );
}
