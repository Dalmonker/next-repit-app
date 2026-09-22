/**
 * Генерирует случайный 6-значный код.
 * Всегда 6 цифр, ведущие нули сохраняются (например, "001234").
 */
export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Возвращает дату, через которую код истечёт.
 * По умолчанию — 10 минут от текущего момента.
 */
export function getExpiryDate(minutes = 10): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
}
