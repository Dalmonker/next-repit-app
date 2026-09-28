// ============================================================
// Работа с телефоном
// ============================================================

// Извлекаем только цифры
export function extractDigits(input: string): string {
    return String(input ?? "").replace(/\D/g, "");
}

// Форматирование для отображения: "293011311" → "29 301-13-11"
export function formatPhoneDigits(digits: string): string {
    const d = extractDigits(digits).slice(0, 9);
    if (!d) return "";

    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);

    let result = p1;
    if (p2) result += ` ${p2}`;
    if (p3) result += `-${p3}`;
    if (p4) result += `-${p4}`;
    return result;
}

// Нормализация для БД: "29 301-13-11" → "+375293011311"
export function normalizePhone(input: string): string {
    const digits = extractDigits(input).slice(0, 9);
    if (!digits) return "";
    return `+375${digits}`;
}

// Из БД для отображения: "+375293011311" → "29 301-13-11"
export function phoneFromDb(dbPhone: string | null): string {
    if (!dbPhone) return "";
    const digits = extractDigits(dbPhone);
    // Убираем код страны 375
    const without = digits.startsWith("375") ? digits.slice(3) : digits;
    return formatPhoneDigits(without.slice(0, 9));
}

// Валидация (на сервере): полный белорусский номер
export function isValidBelarusPhone(input: string): boolean {
    const digits = extractDigits(input);
    // +375 (12 цифр) — минимум
    if (digits.length !== 12) return false;
    if (!digits.startsWith("375")) return false;
    // Дальше 9 цифр (29, 33, 25, 44 — коды операторов)
    return true;
}
