import pool from "@/lib/db";
import { cache } from "react";

export type SidebarUser = {
    first_name: string | null;
    avatar_url: string | null;
};

export const getUserForSidebar = cache(
    async (userId: number): Promise<SidebarUser | null> => {
        const [rows]: any = await pool.execute(
            `SELECT first_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
            [userId],
        );
        return rows[0] ?? null;
    },
);
