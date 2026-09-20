import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";

const daysOne = localFont({
  src: "../fonts/DaysOneRegular.woff2",
  variable: "--font-days-one",
  display: "swap",
  weight: "400",
});

// 2. Добавляем метаданные (SEO)
export const metadata: Metadata = {
  title: "Ripit — платформа для поиска репетиторов в Беларуси",
  description:
    "Учитесь с репетитором, который превращает уроки в прогресс. Удобная платформа для учеников и преподавателей.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${daysOne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
