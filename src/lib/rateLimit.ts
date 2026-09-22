type Record = {
    count: number;
    resetAt: number;
};

const attempts = new Map<string, Record>();

export function rateLimit(
    key: string,
    limit = 5,
    windowMs = 60_000,
): { ok: true } | { ok: false; retryAfter: number } {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || record.resetAt < now) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
    }

    if (record.count >= limit) {
        return {
            ok: false,
            retryAfter: Math.ceil((record.resetAt - now) / 1000),
        };
    }

    record.count++;
    return { ok: true };
}

// Очистка старых записей раз в 5 минут, чтобы Map не разрастался
setInterval(
    () => {
        const now = Date.now();
        for (const [key, record] of attempts.entries()) {
            if (record.resetAt < now) attempts.delete(key);
        }
    },
    5 * 60 * 1000,
);
