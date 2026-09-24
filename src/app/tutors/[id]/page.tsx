import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InviteButton from "@/components/InviteButton";
import { getApprovedTutorById } from "@/lib/tutors";
import { getSession } from "@/lib/auth";

export default async function TutorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const tutorId = Number(id);

    if (!Number.isInteger(tutorId) || tutorId <= 0) {
        notFound();
    }

    const tutor = await getApprovedTutorById(tutorId);

    if (!tutor) {
        notFound();
    }

    const session = await getSession();

    const fullName =
        [tutor.last_name, tutor.first_name, tutor.middle_name]
            .filter(Boolean)
            .join(" ") || "Репетитор";

    return (
        <>
            <Header />
            <main className="min-h-screen bg-violet px-[30px] py-[60px]">
                <div className="container max-w-[900px]">
                    {/* Назад */}
                    <Link
                        href="/tutors"
                        className="inline-flex items-center gap-[6px] text-darkGray hover:text-black transition mb-[24px]"
                    >
                        ← Назад к каталогу
                    </Link>

                    {/* Основная карточка */}
                    <div className="bg-white rounded-[24px] p-[40px]">
                        <div className="flex flex-col md:flex-row gap-[32px]">
                            {/* Фото */}
                            <div className="relative w-[200px] h-[200px] rounded-[24px] overflow-hidden bg-violet shrink-0 mx-auto md:mx-0">
                                {tutor.avatar_url ? (
                                    <Image
                                        src={tutor.avatar_url}
                                        alt={fullName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-darkGray">
                                        Нет фото
                                    </div>
                                )}
                            </div>

                            {/* Информация */}
                            <div className="flex-1">
                                <h1 className="font-days text-[32px] text-black mb-[8px]">
                                    {fullName}
                                </h1>

                                {tutor.headline && (
                                    <p className="text-darkGray text-[16px] mb-[20px]">
                                        {tutor.headline}
                                    </p>
                                )}

                                {tutor.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-[8px] mb-[20px]">
                                        {tutor.subjects.map((s) => (
                                            <span
                                                key={s}
                                                className="px-[14px] py-[6px] rounded-full bg-violet text-black text-[14px]"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-[24px] mb-[24px]">
                                    {tutor.hourly_rate != null && (
                                        <div>
                                            <p className="text-darkGray text-[12px]">
                                                Цена
                                            </p>
                                            <p className="text-black font-bold text-[20px]">
                                                {tutor.hourly_rate} BYN/час
                                            </p>
                                        </div>
                                    )}
                                    {tutor.experience_years != null && (
                                        <div>
                                            <p className="text-darkGray text-[12px]">
                                                Опыт
                                            </p>
                                            <p className="text-black font-bold text-[20px]">
                                                {tutor.experience_years} лет
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопка «Пригласить» */}
                                <InviteButton
                                    tutorId={tutor.id}
                                    isAuthenticated={!!session}
                                    role={session?.role ?? null}
                                />
                            </div>
                        </div>

                        {/* О себе */}
                        {tutor.bio && (
                            <div className="mt-[32px] pt-[32px] border-t border-whiteTxt">
                                <h2 className="font-days text-[20px] text-black mb-[12px]">
                                    О себе
                                </h2>
                                <p className="text-darkGray whitespace-pre-line">
                                    {tutor.bio}
                                </p>
                            </div>
                        )}

                        {/* Образование */}
                        {tutor.education && (
                            <div className="mt-[32px] pt-[32px] border-t border-whiteTxt">
                                <h2 className="font-days text-[20px] text-black mb-[12px]">
                                    Образование
                                </h2>
                                <p className="text-darkGray whitespace-pre-line">
                                    {tutor.education}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
