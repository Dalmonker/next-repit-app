import Link from "next/link";
import Image from "next/image";
import type { TutorListItem } from "@/lib/tutors";

export default function TutorCard({ tutor }: { tutor: TutorListItem }) {
    const fullName =
        [tutor.first_name, tutor.last_name].filter(Boolean).join(" ") ||
        "Репетитор";

    const visibleSubjects = tutor.subjects.slice(0, 3);
    const hasMore = tutor.subjects.length > 3;

    return (
        <Link
            href={`/tutors/${tutor.id}`}
            className="group bg-white rounded-[24px] overflow-hidden hover:shadow-lg transition-shadow block"
        >
            {/* Фото + синий фон */}
            <div className="relative w-[333px] h-[333px] bg-blue">
                {tutor.avatar_url ? (
                    <Image
                        src={tutor.avatar_url}
                        alt={fullName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60">
                        Нет фото
                    </div>
                )}

                {/* Теги поверх фото, внизу */}
                {tutor.subjects.length > 0 && (
                    <div className="absolute bottom-[16px] left-[16px] right-[16px] flex flex-wrap gap-[6px]">
                        {visibleSubjects.map((s) => (
                            <span
                                key={s}
                                className="px-[10px] py-[6px] rounded-[8px] bg-white/95 backdrop-blur text-black text-[12px] font-medium"
                            >
                                {s}
                            </span>
                        ))}
                        {hasMore && (
                            <span className="px-[10px] py-[6px] rounded-[8px] bg-white/95 backdrop-blur text-darkGray text-[12px] font-medium">
                                …
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Контент */}
            <div className="p-[20px]">
                {/* Имя */}
                <h2 className="font-days text-[24px] text-black mb-[10px] leading-[1.15]">
                    {fullName}
                </h2>

                {/* Headline */}
                {tutor.headline && (
                    <p className="text-darkGray text-[14px] leading-[1.4] mb-[16px] line-clamp-3 max-w-[333px]">
                        {tutor.headline}
                    </p>
                )}

                {/* Цена и опыт */}
                <div className="flex items-center justify-between text-[14px]">
                    {tutor.hourly_rate != null && (
                        <span className="text-black font-bold">
                            от {tutor.hourly_rate} BYN/час
                        </span>
                    )}
                    {tutor.experience_years != null && (
                        <span className="text-darkGray">
                            {tutor.experience_years} лет опыта
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
