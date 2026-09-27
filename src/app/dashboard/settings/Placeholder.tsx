export default function Placeholder({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-[24px] p-[60px] max-w-[640px] text-center">
            <h2 className="font-days text-[24px] text-black mb-[12px]">
                {title}
            </h2>
            <p className="text-darkGray">Раздел в разработке</p>
        </div>
    );
}
