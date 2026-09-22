import Link from "next/link";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-tablet.webp";

export default function LoginForm() {
    return (
        <div className="w-full rounded-[24px] bg-violet relative">
            <div className="bg-violet rounded-t-[24px] h-[200px] w-full relative">
                <div className="p-[40px] relative z-10">
                    <Svg iconId="logo" className="w-[74px] h-[42px]" />
                </div>

                <div className="absolute bottom-0 right-0 w-full h-full">
                    <Image
                        src={parrotImage}
                        alt="Parrot"
                        fill
                        className="object-contain object-bottom-right"
                        priority
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] p-[40px]">
                <h1 className="font-days text-[32px] text-black text-center mb-[40px]">
                    Войти в кабинет
                </h1>

                <form className="font-sans space-y-4  mb-[24px]">
                    <div className="mb-[24px]">
                        <label
                            className="block font-medium text-black mb-[12px]"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@gmail.com"
                            className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white placeholder:text-clue text-black focus:border-green outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-start mb-[24px]">
                        <div className="flex mt-[4px] mr-[10px]">
                            <input
                                id="checkbox-id"
                                type="checkbox"
                                className="cursor-pointer"
                            />
                        </div>
                        <label
                            htmlFor="checkbox-id"
                            className="text-darkGray leading-5 text-[15px] cursor-pointer max-w-[400px]"
                        >
                            Соглашаюсь с{" "}
                            <Link
                                href="#"
                                className="text-blue hover:underline"
                            >
                                политикой обработки персональных данных
                            </Link>{" "}
                            и принимаю условия{" "}
                            <Link
                                href="#"
                                className="text-blue hover:underline"
                            >
                                пользовательского соглашения
                            </Link>
                        </label>
                    </div>

                    <button
                        type="button"
                        className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition"
                    >
                        Войти
                    </button>
                </form>

                <Link
                    href="#"
                    className="cursor-pointer block bg-transparent text-center pt-[10px] pb-[12px] rounded-full active:bg-green transition"
                >
                    По приглашению от учителя
                </Link>
            </div>
        </div>
    );
}
