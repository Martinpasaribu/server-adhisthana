import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

export const verifyEmail = async (email: string): Promise<boolean> => {
    try {
        const response = await axios.get(
            `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`
        );

        const { status, accept_all, smtp_check, disposable, block } = response.data.data;

        // Email valid jika:
        // - status adalah "valid"
        // - smtp_check true (email benar-benar aktif)
        // - bukan email disposable (sekali pakai)
        // - tidak masuk daftar blocklist
        if (status === "valid" && smtp_check && !disposable && !block) {
            return true;
        }

        // Jika email adalah "accept_all", kita anggap valid tetapi beri peringatan
        if (accept_all) {
            console.warn(`Email ${email} is an "accept_all" address, verification may not be reliable.`);
            return true; // Bisa dikembalikan `false` jika ingin lebih ketat
        }

        return false;
    } catch (error) {
        console.error("Error verifying email:", error);
        return false; // Jika ada error, anggap email tidak valid
    }
};
