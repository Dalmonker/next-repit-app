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
            {/* Фото */}
            <div className="relative w-full h-[280px] bg-violet">
                {tutor.avatar_url ? (
                    <Image
                        src={tutor.avatar_url}
                        alt={fullName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-darkGray">
                        Нет фото
                    </div>
                )}
            </div>

            {/* Контент */}
            <div className="p-[24px]">
                {/* Имя */}
                <h2 className="font-days text-[22px] text-black mb-[8px]">
                    {fullName}
                </h2>

                {/* Headline */}
                {tutor.headline && (
                    <p className="text-darkGray text-[14px] mb-[12px] line-clamp-2">
                        {tutor.headline}
                    </p>
                )}

                {/* Предметы */}
                {tutor.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-[6px] mb-[16px]">
                        {visibleSubjects.map((s) => (
                            <span
                                key={s}
                                className="px-[10px] py-[4px] rounded-full bg-violet text-black text-[12px]"
                            >
                                {s}
                            </span>
                        ))}
                        {hasMore && (
                            <span className="px-[10px] py-[4px] rounded-full bg-violet text-darkGray text-[12px]">
                                ...
                            </span>
                        )}
                    </div>
                )}

                {/* Цена и опыт */}
                <div className="flex items-center justify-between text-[14px]">
                    {tutor.hourly_rate != null && (
                        <span className="text-black font-medium">
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
