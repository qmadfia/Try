// Nama file: api/saveData.js (atau sesuai nama file Vercel Function Anda)

// Sebuah 'Map' untuk menyimpan data rate limit.
// Kunci-nya adalah alamat IP, nilai-nya adalah objek berisi hitungan dan waktu permintaan pertama.
// PENTING: Karena ini adalah Vercel/Serverless Function, data di 'requestCounts' ini
// bersifat sementara dan bisa di-reset setiap kali fungsi "cold start" atau di-deploy ulang.
// Namun, ini cukup efektif untuk memitigasi spam cepat dan menghemat kuota untuk kasus sederhana.
const requestCounts = new Map();

export default async function handler(req, res) {
    // 1. Dapatkan Alamat IP Pengguna
    // Vercel sering meneruskan IP asli di header 'x-forwarded-for'
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 2. Atur Batasan (Anda bisa mengubah nilai-nilai ini sesuai kebutuhan)
    const MAX_REQUESTS_PER_IP = 5; // Maksimal 5 permintaan per alamat IP
    const WINDOW_MS = 60 * 1000;   // Dalam periode 60 detik (1 menit)

    // 3. Periksa atau Inisialisasi Data Rate Limit untuk IP ini
    let entry = requestCounts.get(ip);

    if (!entry) {
        // Jika IP baru, inisialisasi hitungan dan waktu awal
        entry = {
            count: 0,
            firstRequestTime: Date.now()
        };
        requestCounts.set(ip, entry);
    }

    // 4. Perbarui Jendela Waktu
    // Jika waktu saat ini sudah melewati jendela waktu (misal: sudah lebih dari 1 menit sejak permintaan pertama),
    // maka reset hitungan untuk IP ini.
    if (Date.now() - entry.firstRequestTime > WINDOW_MS) {
        entry.count = 0;
        entry.firstRequestTime = Date.now();
    }

    // 5. Periksa Apakah Batas Sudah Terlampaui
    if (entry.count >= MAX_REQUESTS_PER_IP) {
        console.warn(`Rate limit terlampaui untuk IP: ${ip}. Permintaan ditolak.`);
        // Kirim respons error HTTP 429 (Too Many Requests)
        return res.status(429).send('Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.');
    }

    // 6. Jika Belum Terlampaui, Tambahkan Hitungan dan Lanjutkan Proses Normal
    entry.count++;
    console.log(`Permintaan dari IP: ${ip}. Hitungan: ${entry.count}`);

    // --- MULAI DARI SINI: LOGIKA FUNGSI ASLI ANDA UNTUK MENYIMPAN DATA ---
    // (Ini adalah bagian yang seharusnya sudah ada di Vercel Function Anda)

    try {
        // Pastikan Anda mendapatkan data dari 'req.body' (dari frontend)
        const dataToSend = req.body; 

        // URL Google Script Anda
        const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwp9jX0u4u6qKtP3HoBKg2-Bi0Hcn0vCBh4p3TnFhjIsg4-bUp3F6dlM2GGIMUPop8X/exec"; // GANTI DENGAN URL GOOGLE SCRIPT ANDA!

        const googleResponse = await fetch(googleScriptUrl, {
            method: "POST",
            body: JSON.stringify(dataToSend),
            headers: { 'Content-Type': 'application/json' }
        });

        const resultText = await googleResponse.text();
        console.log("Respons Google Script:", resultText);

        if (googleResponse.ok && resultText.toLowerCase().includes("berhasil")) {
            // Jika berhasil disimpan di Google Sheet
            return res.status(200).send("Data berhasil disimpan!");
        } else {
            // Jika ada masalah dari Google Script
            return res.status(500).send("Gagal menyimpan data: " + resultText);
        }

    } catch (error) {
        console.error("Terjadi kesalahan saat mengirim data ke Google Script:", error);
        return res.status(500).send("Terjadi kesalahan internal server.");
    }
}
