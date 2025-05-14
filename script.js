// =============================
// 1. Deklarasi Variabel Global
// =============================
// Variabel State Aplikasi
let totalInspected = 0;       // Total barang yang diinspeksi (akan diupdate oleh updateTotalQtyInspect)
let totalReworkLeft = 0;      // Total rework kiri
let totalReworkRight = 0;     // Total rework kanan
let totalReworkPairs = 0;     // Total rework pairs
let isAdding = false;         // Flag untuk menandakan mode penambahan (dikontrol oleh tombol +/-)
let isSubtracting = false;    // Flag untuk menandakan mode pengurangan (dikontrol oleh tombol +/-)
let currentDefectPosition = "LEFT"; // Default posisi defect untuk defect menu
// Variabel untuk menyimpan data defect
let defectCounts = {};        // Objek untuk melacak jumlah setiap jenis defect { defectType: { position: { grade: count } } }
// Variabel untuk menyimpan jumlah per grade (A, R, B, C)
const qtyInspectOutputs = {
    'a-grade': 0,
    'r-grade': 0,
    'b-grade': 0,
    'c-grade': 0
};

// Referensi Elemen DOM Utama (Variabel Dideklarasikan di sini, Nilai Diisi di initApp)
const fttOutput = document.getElementById('fttOutput');
const qtyInspectOutput = document.getElementById('qtyInspectOutput'); // Total Qty Inspect
const leftCounter = document.getElementById('left-counter');
const rightCounter = document.getElementById('right-counter');
const pairsCounter = document.getElementById('pairs-counter');
const summaryContainer = document.getElementById('summary-list');
const redoRateOutput = document.getElementById('redoRateOutput');
const qtySampleSetInput = document.getElementById('qty-sample-set');
const plusButton = document.getElementById('plus-button'); // Referensi tombol +/-
const minusButton = document.getElementById('minus-button');

// Referensi Elemen DOM untuk output per grade (A,R,B,C) - Dideklarasikan di sini, Nilai Diisi di initApp
// === PERBAIKAN PENTING: Gunakan 'let' karena nilainya akan diisi ulang di initApp ===
let outputElements = {}; // Diisi di initApp setelah DOM siap
// =============================
// 2. Fungsi Utama Aplikasi
// =============================
// =============================
// 3. (Bagian 3 dari Part 1) - Setup Tombol Rework (Kiri, Kanan, Pasangan)
// =============================
// (Dipindahkan ke initApp untuk urutan inisialisasi)
// =============================
// 4. (Bagian 4 dari Part 1) - Fungsi untuk Menghitung FTT
// =============================
function updateFTT() {
    if (!fttOutput) return;
    if (totalInspected === 0) {
        fttOutput.textContent = '0%';
        fttOutput.className = 'counter'; // Set default class
        return;
    }

    const totalRGrade = qtyInspectOutputs['r-grade'] || 0;
    const totalBGrade = qtyInspectOutputs['b-grade'] || 0;
    const totalCGrade = qtyInspectOutputs['c-grade'] || 0;

    const fttValue = ((totalInspected - totalRGrade - totalBGrade - totalCGrade) / totalInspected) * 100;
    fttOutput.textContent = `${Math.max(0, fttValue.toFixed(2))}%`;

    if (fttValue >= 92) {
        fttOutput.className = 'counter high-ftt'; // Green
    } else if (fttValue >= 80) {
        fttOutput.className = 'counter medium-ftt'; // Yellow
    } else {
        fttOutput.className = 'counter low-ftt'; // Red
    }
}
// =============================
// 5. (Bagian 5 dari Part 1) - Fungsi untuk Mengupdate Kuantitas Rework (Kiri, Kanan, Pasangan)
// =============================
function updateQuantity(counterId, change) { // Parameter 'change' saat ini tidak dominan, isAdding/isSubtracting lebih utama
    const counterElement = document.getElementById(counterId);

    if (!counterElement) {
        console.error("Elemen counter tidak ditemukan:", counterId);
        return;
    }
    let currentValue = parseInt(counterElement.textContent) || 0;

    // Validasi: Rework hanya bisa ditambahkan jika R/B/C grade aktif
    const rGradeActive = document.querySelector('.r-grade.active');
    const bGradeActive = document.querySelector('.b-grade.active');
    const cGradeActive = document.querySelector('.c-grade.active');

    if (!rGradeActive && !bGradeActive && !cGradeActive &&
        (counterId === 'left-counter' || counterId === 'right-counter' || counterId === 'pairs-counter')) {
        console.warn("Rework hanya dapat ditambahkan setelah memilih R-Grade, B-Grade, atau C-Grade.");
        // alert("Pilih R-Grade, B-Grade, atau C-Grade terlebih dahulu untuk mencatat rework.");
        return;
    }

    if (isAdding) {
        currentValue++;
    } else if (isSubtracting && currentValue > 0) {
        currentValue--;
    } else if (!isAdding && !isSubtracting) { // Jika tidak dalam mode +/- (klik langsung)
        currentValue += change; // Gunakan parameter 'change' jika ada
    }

    currentValue = Math.max(0, currentValue); // Pastikan tidak kurang dari 0
    counterElement.textContent = currentValue;

    // Perbarui total rework global
    if (counterId === 'left-counter') {
        totalReworkLeft = currentValue;
    } else if (counterId === 'right-counter') {
        totalReworkRight = currentValue;
    } else if (counterId === 'pairs-counter') {
        totalReworkPairs = currentValue;
    }

    updateRedoRate(); // Perbarui Redo Rate setiap ada perubahan rework
}
// =============================
// 6. (Bagian 6 dari Part 1) - Fungsi terkait Defect
// =============================
function addDefectToSummary(defectType, container) {
    const rGradeActive = document.querySelector('.r-grade.active');
    const bGradeActive = document.querySelector('.b-grade.active');
    const cGradeActive = document.querySelector('.c-grade.active');

    // const aGradeActive = document.querySelector('.a-grade.active'); // A-Grade biasanya tidak ada defect rework
    let currentGrade = "";
    if (rGradeActive) currentGrade = "R-GRADE";
    else if (bGradeActive) currentGrade = "B-GRADE";
    else if (cGradeActive) currentGrade = "C-GRADE";
    // else if (aGradeActive) currentGrade = "A-GRADE"; // Logika untuk A-Grade defect jika perlu

    if (!currentGrade) {
        console.warn("Pilih grade (R, B, atau C) sebelum menambahkan defect.");
        // alert("Pilih R-Grade, B-Grade, atau C-Grade terlebih dahulu untuk mencatat defect.");
        return;
    }
    // Pastikan currentDefectPosition (LEFT, RIGHT, PAIRS) sudah diatur
    if (!["LEFT", "RIGHT", "PAIRS"].includes(currentDefectPosition)) {
        console.warn("Posisi defect (Kiri/Kanan/Pasangan) belum dipilih dengan benar.");
        // alert("Pilih posisi defect (Kiri/Kanan/Pasangan) terlebih dahulu.");
        return;
    }

    if (!defectCounts[defectType]) {
        defectCounts[defectType] = { "LEFT": {}, "PAIRS": {}, "RIGHT": {} };
    }
    if (!defectCounts[defectType][currentDefectPosition]) {
        defectCounts[defectType][currentDefectPosition] = {};
    }
    if (!defectCounts[defectType][currentDefectPosition][currentGrade]) {
        defectCounts[defectType][currentDefectPosition][currentGrade] = 0;
    }

    if (isAdding) {
        defectCounts[defectType][currentDefectPosition][currentGrade]++;
    } else if (isSubtracting && defectCounts[defectType][currentDefectPosition][currentGrade] > 0) {
        defectCounts[defectType][currentDefectPosition][currentGrade]--;
        // Hapus entri jika jumlahnya menjadi 0 untuk kebersihan data
        if (defectCounts[defectType][currentDefectPosition][currentGrade] === 0) {
            delete defectCounts[defectType][currentDefectPosition][currentGrade];
            if (Object.keys(defectCounts[defectType][currentDefectPosition]).length === 0) {
                delete defectCounts[defectType][currentDefectPosition];
            }
            if (Object.keys(defectCounts[defectType]).filter(pos => Object.keys(defectCounts[defectType][pos]).length > 0).length === 0) {
                 delete defectCounts[defectType];
            }
        }
    } else if (!isAdding && !isSubtracting) { // Klik langsung pada tombol defect (default tambah 1)
        defectCounts[defectType][currentDefectPosition][currentGrade]++;
    }


    console.log("defectCounts diupdate:", JSON.stringify(defectCounts));
    updateDefectSummaryDisplay(container);
    updateFTT(); // Defect mempengaruhi FTT
}
// =============================
// 7. (Bagian 7 dari Part 1) - Setup Tombol Plus dan Minus
// =============================
// (Dipindahkan ke initApp untuk urutan inisialisasi)
// =============================
// 8. Fungsi untuk menampilkan summary defect
// =============================
function updateDefectSummaryDisplay(container) {
    if (!container) return;

    container.innerHTML = ''; // Bersihkan summary list
    const gradeOrder = ["R-GRADE", "B-GRADE", "C-GRADE"]; // Urutan tampilan grade
    const positionOrder = ["LEFT", "PAIRS", "RIGHT"]; // Urutan tampilan posisi

    for (const defectType in defectCounts) {
        for (const position of positionOrder) {
            if (defectCounts[defectType][position]) {
                for (const grade of gradeOrder) {
                    if (defectCounts[defectType][position][grade] && defectCounts[defectType][position][grade] > 0) {
                        const count = defectCounts[defectType][position][grade];
                        let displayGrade = grade; // Default, tampilkan apa adanya
                        if (grade === "R-GRADE") {
                            displayGrade = "REWORK";
                        }
                        // Tidak perlu lagi menghapus "-GRADE" untuk B dan C

                        const item = document.createElement('div');
                        item.className = 'summary-item';
                        item.innerHTML = `
                            <div class="defect-col">${defectType}</div>
                            <div class="position-col">${position}</div>
                            <div class="level-col">${displayGrade} <span class="count">${count}</span></div>
                        `;
                        container.appendChild(item);
                    }
                }
            }
        }
    }
}
// =============================
// 9. (Bagian 10 dari Part 1) - Kirim Data ke Google Sheets
// =============================
async function saveData() {
    console.log("Memulai proses simpan data...");

    // Lakukan semua validasi
    if (!validateInputs() || !validateDefects() || !validateQtySampleSet()) {
        console.log("Validasi gagal. Penyimpanan dibatalkan.");
        return; // Hentikan jika ada validasi yang gagal
    }
    // Hitung total defect dari defectCounts
    let totalDefectCount = 0;
    for (const defectType in defectCounts) {
        for (const position in defectCounts[defectType]) {
            for (const grade in defectCounts[defectType][position]) {
                totalDefectCount += defectCounts[defectType][position][grade];
            }
        }
    }

    // Hitung total rework dari variabel global
    const calculatedTotalRework = ((totalReworkLeft + totalReworkRight) / 2) + totalReworkPairs;

    // Validasi tambahan: total defect tidak boleh lebih rendah dari total rework
    if (totalDefectCount < calculatedTotalRework) {
        alert("Total defect tidak boleh lebih rendah dari total rework. Data tidak dapat disimpan.");
        console.log("Validasi gagal: Total defect < total rework.");
        return;
    }

    const fttValueText = fttOutput ? fttOutput.innerText.replace("%", "").trim() : "0";
    const finalFtt = parseFloat(fttValueText) / 100;

    const redoRateValueText = redoRateOutput ? redoRateOutput.innerText.replace("%", "").trim() : "0";
    const finalRedoRate = parseFloat(redoRateValueText) / 100;

    const defectsToSend = [];
    for (const defectType in defectCounts) {
        for (const position in defectCounts[defectType]) {
            for (const grade in defectCounts[defectType][position]) {
                const count = defectCounts[defectType][position][grade];
                if (count > 0) {
                    defectsToSend.push({
                        type: defectType,
                        position: position,
                        level: grade, // R-GRADE, B-GRADE, C-GRADE
                        count: count
                    });
                }
            }
        }
    }

    const dataToSend = {
        timestamp: new Date().toISOString(), // Tambahkan timestamp
        auditor: document.getElementById("auditor").value,
        ncvs: document.getElementById("ncvs").value,
        modelName: document.getElementById("model-name").value,
        styleNumber: document.getElementById("style-number").value,
        qtyInspect: totalInspected, // Dari variabel global
        qtySampleSet: qtySampleSetInput ? (parseInt(qtySampleSetInput.value, 10) || 0) : 0,
        ftt: finalFtt,
        redoRate: finalRedoRate,
        "a-grade": qtyInspectOutputs['a-grade'],
        "r-grade": qtyInspectOutputs['r-grade'],
        "b-grade": qtyInspectOutputs['b-grade'],
        "c-grade": qtyInspectOutputs['c-grade'],
        reworkKiri: totalReworkLeft,
        reworkKanan: totalReworkRight,
        reworkPairs: totalReworkPairs,
        defects: defectsToSend,
    };

    console.log("Data yang akan dikirim:", JSON.stringify(dataToSend, null, 2));

    const saveButton = document.querySelector(".save-button");
    saveButton.disabled = true;
    saveButton.textContent = "MENYIMPAN...";

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbyMppC69px5EAG4DVAyw7h5l8o5uR835VEJuuXWHa8_nbejKLq3TrfCDBpEPgJuveYV/exec", {
            method: "POST",
            body: JSON.stringify(dataToSend),
            // mode: 'no-cors', // Hapus atau sesuaikan jika Web App Anda dikonfigurasi untuk CORS
        });
        // Jika Web App tidak mengembalikan JSON atau responsnya tidak standar untuk .json()
        const resultText = await response.text();
        console.log("Respons server:", resultText);
        alert(resultText); // Tampilkan respons teks dari server

        if (response.ok) { // Cek apakah status HTTP adalah 2xx
             // Cari pesan sukses spesifik jika ada dari Apps Script Anda
            if (resultText.toLowerCase().includes("berhasil")) {
                resetAllFields();
            } else {
                // Mungkin ada pesan error dari Apps Script walau response.ok
                // Anda bisa memutuskan apakah tetap reset atau tidak
                console.warn("Server merespons OK, tapi pesan tidak mengandung 'berhasil'. Hasil:", resultText);
            }
        } else {
             // Tangani HTTP error status di sini
            alert(`Gagal menyimpan data. Server merespons dengan status: ${response.status}. Pesan: ${resultText}`);
        }

    } catch (error) {
        console.error("Error saat mengirim data:", error);
        alert("Terjadi kesalahan saat menyimpan data. Cek koneksi internet atau hubungi administrator.");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "SIMPAN";
    }
}
// =============================
// 10. (Bagian 11 - Versi Terbaru) - Reset Data Setelah Simpan
// =============================
function resetAllFields() {
    console.log("Memulai proses reset semua field dan data internal...");
    // 1. Reset input form fields
    document.getElementById("auditor").value = "";
    document.getElementById("ncvs").value = "";
    document.getElementById("model-name").value = "";
    const styleNumberInput = document.getElementById("style-number");
    if (styleNumberInput) {
        styleNumberInput.value = "";
        styleNumberInput.classList.remove('invalid-input');
    }

    // 2. Reset tampilan output numerik visual di DOM
    if (qtyInspectOutput) qtyInspectOutput.textContent = "0";
    if (leftCounter) leftCounter.textContent = "0";
    if (rightCounter) rightCounter.textContent = "0";
    if (pairsCounter) pairsCounter.textContent = "0";

    if (fttOutput) {
        fttOutput.textContent = "0%";
        fttOutput.className = 'counter';
    }
    if(redoRateOutput) redoRateOutput.textContent = "0.00%";

    // Reset tampilan visual untuk output grade (A, R, B, C)
    const gradeKeysForVisualReset = ["a-grade", "r-grade", "b-grade", "c-grade"];
    gradeKeysForVisualReset.forEach(gradeKey => {
        const el = outputElements[gradeKey]; // Menggunakan referensi yang sudah ada
        if (el) {
            el.textContent = "0";
        }
    });

    // 3. RESET DATA INTERNAL UTAMA
    for (const categoryKey in qtyInspectOutputs) {
        if (Object.prototype.hasOwnProperty.call(qtyInspectOutputs, categoryKey)) {
            qtyInspectOutputs[categoryKey] = 0;
        }
    }
    console.log("Data internal qtyInspectOutputs direset:", JSON.stringify(qtyInspectOutputs));

    defectCounts = {};
    console.log("Data internal defectCounts direset:", JSON.stringify(defectCounts));

    totalInspected = 0;
    totalReworkLeft = 0;
    totalReworkRight = 0;
    totalReworkPairs = 0;
    currentDefectPosition = "LEFT";

    isAdding = false;
    isSubtracting = false;

    // 4. Reset State UI Tambahan
    const plusButton = document.getElementById('plus-button');
    const minusButton = document.getElementById('minus-button');
    if (plusButton) {
        plusButton.classList.remove('active');
        plusButton.classList.add('inactive');
    }
    if (minusButton) {
        minusButton.classList.remove('active');
        minusButton.classList.add('inactive');
    }

    const gradeInputButtons = document.querySelectorAll('.qty-item .input-button');
    gradeInputButtons.forEach(button => {
        button.classList.remove('active');
    });

    toggleButtonState(true); // Nonaktifkan rework dan defect

    if (summaryContainer) {
        summaryContainer.innerHTML = "";
        // atau panggil updateDefectSummaryDisplay(summaryContainer); jika ingin konsisten
    }

    // 5. Update semua kalkulasi dan tampilan
    updateTotalQtyInspect(); // Ini akan update FTT dan RedoRate juga

    // Reset Qty Sample Set jika perlu, atau biarkan sesuai localStorage
    // Jika ingin reset Qty Sample Set input field:
    // if (qtySampleSetInput) qtySampleSetInput.value = "0"; // atau nilai default lainnya

    console.log("Semua field dan data internal telah berhasil direset.");
}
// =============================
// 11. (Bagian 12 dari Part 2) - Validasi Input sebelum SIMPAN
// =============================
function validateInputs() {
    const auditor = document.getElementById("auditor").value.trim();
    const ncvs = document.getElementById("ncvs").value.trim();
    const modelName = document.getElementById("model-name").value.trim();
    const styleNumberInput = document.getElementById("style-number");
    const styleNumber = styleNumberInput.value.trim();
    if (!auditor || !ncvs || !modelName || !styleNumber) {
        alert("Harap isi semua input dasar (Auditor, NCVS, Model, Style) sebelum menyimpan data!");
        return false;
    }

    const styleNumberPattern = /^[a-zA-Z0-9]{6}-[a-zA-Z0-9]{3}$/;
    if (!styleNumberPattern.test(styleNumber)) {
        alert("Format Style Number tidak sesuai. Contoh: AH1567-100 atau 767688-001");
        styleNumberInput.classList.add('invalid-input');
        return false;
    } else {
        styleNumberInput.classList.remove('invalid-input');
    }
    return true;
}
// =============================
// 12. (Bagian 13 dari Part 2) - Validasi Defect sebelum SIMPAN
// =============================
function validateDefects() {
    let hasDefect = false;

    for (const defectType in defectCounts) {
        for (const position in defectCounts[defectType]) {
            for (const grade in defectCounts[defectType][position]) {
                if (defectCounts[defectType][position][grade] > 0) {
                    hasDefect = true;
                    break; // Cukup satu defect ditemukan
                }
            }
            if (hasDefect) break;
        }
        if (hasDefect) break;
    }
    // Khusus untuk R-GRADE, B-GRADE, C-GRADE, defect wajib ada. A-GRADE tidak.
    const rGradeActive = qtyInspectOutputs['r-grade'] > 0;
    const bGradeActive = qtyInspectOutputs['b-grade'] > 0;
    const cGradeActive = qtyInspectOutputs['c-grade'] > 0;

    if ((rGradeActive || bGradeActive || cGradeActive) && !hasDefect) {
         alert("Jika ada item R-Grade, B-Grade, atau C-Grade, harap pilih setidaknya satu defect sebelum menyimpan data!");
         return false;
    }
    // Jika hanya A-Grade, defect tidak wajib
    return true;
}

// =============================
// 13. (Bagian 14 dari Part 2) - Fungsi untuk mengupdate output qty inspect (A, R, B, C Grade)
// (Pastikan kode di sini sudah diperbaiki seperti ini)
// =============================
function updateOutput(category, amount) { // <-- Harus menerima 2 argumen
    // console.log(`Inside updateOutput for ${category} with amount ${amount}`); // Debugging log
    if (!qtyInspectOutputs.hasOwnProperty(category) || !outputElements[category]) {
        console.error("updateOutput Error: Kategori grade tidak valid atau elemen output tidak ditemukan:", category);
        return;
    }

    // Update kuantitas menggunakan 'amount' yang diterima
    qtyInspectOutputs[category] = Math.max(0, qtyInspectOutputs[category] + amount);

    // Update tampilan di HTML
    outputElements[category].textContent = qtyInspectOutputs[category];

    console.log(`Updated ${category} to ${qtyInspectOutputs[category]}`); // Debugging log

    // Panggil fungsi untuk update total dan FTT/Rework
    updateTotalQtyInspect();
}
// =============================
// 14. (Bagian 15 dari Part 2) - Fungsi untuk menghitung total qty inspect
// (Pastikan kode di sini sudah diperbaiki seperti ini)
// =============================
function updateTotalQtyInspect() {
    let total = 0;
    for (const category in qtyInspectOutputs) {
         // Pastikan hanya menjumlahkan jika properti itu benar-benar ada di objek qtyInspectOutputs
        if (Object.prototype.hasOwnProperty.call(qtyInspectOutputs, category)) {
            total += qtyInspectOutputs[category];
        }
    }
    if (qtyInspectOutput) { // qtyInspectOutput adalah elemen untuk TOTAL Qty Inspect
        qtyInspectOutput.textContent = total;
    }
    totalInspected = total; // Perbarui variabel global totalInspected

    // Panggil update FTT dan Redo Rate SETELAH totalInspected diperbarui
    updateFTT(); // Pastikan fungsi ini ada di kode Anda
    updateRedoRate(); // Pastikan fungsi ini ada di kode Anda
     console.log("updateTotalQtyInspect completed. Total:", totalInspected); // Debugging log
}

// ... (Definisi fungsi lain seperti updateFTT, updateQuantity, addDefectToSummary, updateDefectSummaryDisplay,
// saveData, resetAllFields, validateInputs, validateDefects, validateQtySampleSet, toggleButtonState,
// handleGradeSelection, updateRedoRate tetap di sini, di luar initApp) ...

// ... (Logika Announcement juga tetap di sini, mungkin dalam DOMContentLoaded listener terpisah atau digabung) ...


// === Event listener utama untuk menjalankan inisialisasi setelah DOM siap ===
// Ini adalah baris TERAKHIR yang memanggil initApp
document.addEventListener('DOMContentLoaded', initApp); // Pertahankan baris ini di bagian paling bawah script utama


// === Jika Anda punya DOMContentLoaded terpisah untuk Announcement, biarkan tetap di bawah yang ini atau gabungkan ===
// document.addEventListener('DOMContentLoaded', () => { ... }); // Kode announcement
// =============================
// 15. (Bagian 16 dari Part 2) - Logika Kontrol Tombol Berdasarkan Grade
// =============================
function toggleButtonState(disable) { // 'disable' adalah boolean: true untuk menonaktifkan, false untuk mengaktifkan
    const reworkButtons = document.querySelectorAll('.rework-button');
    const defectButtons = document.querySelectorAll('.defect-button');
    reworkButtons.forEach(button => {
        button.disabled = disable;
        button.classList.toggle('inactive', disable);
    });

    defectButtons.forEach(button => {
        button.disabled = disable;
        button.classList.toggle('inactive', disable);
    });
}
function handleGradeSelection(gradeCategory) { // gradeCategory: 'a-grade', 'r-grade', 'b-grade', 'c-grade'
    const allGradeButtons = document.querySelectorAll('.input-button'); // Semua tombol yang bisa jadi grade

    let enableReworkAndDefects = false;
    allGradeButtons.forEach(button => {
        button.classList.remove('active');
    });

    const selectedButton = document.querySelector(`.${gradeCategory}`);
    if (selectedButton) {
        selectedButton.classList.add('active');
        if (gradeCategory === 'r-grade' || gradeCategory === 'b-grade' || gradeCategory === 'c-grade') {
            enableReworkAndDefects = true;
        }
    }
    toggleButtonState(!enableReworkAndDefects); // true untuk nonaktifkan, false untuk aktifkan
}
// =============================
// 16. (Bagian 17 dari Part 2) - Fungsi untuk menghitung dan menampilkan Redo Rate
// =============================
function updateRedoRate() {
    if (!redoRateOutput) return;
    const calculatedTotalRework = ((totalReworkLeft + totalReworkRight) / 2) + totalReworkPairs;
    const redoRateValue = totalInspected !== 0 ? (calculatedTotalRework / totalInspected) * 100 : 0;
    redoRateOutput.textContent = `${redoRateValue.toFixed(2)}%`;
}
// =============================
// 17. (Bagian 18 dari Part 2) - Announcement Logic
// =============================
// (Dijalankan terpisah karena mungkin merupakan modul sendiri)
document.addEventListener('DOMContentLoaded', () => {
    const announcements = [
        // { date: "2024-10-26", text: "info a" },
        // ... (tambahkan pengumuman Anda di sini) ...
    ];
    let currentAnnouncementIndex = 0;
    let viewedAnnouncements = JSON.parse(localStorage.getItem('viewedAnnouncements')) || [];
    const announcementPopup = document.getElementById('announcement-popup');
    const announcementDateElement = document.getElementById('date-text');
    const announcementTextElement = document.getElementById('announcement-text');
    const announcementButton = document.getElementById('announcement-button'); // Tombol untuk membuka popup
    const closeButton = document.querySelector('#announcement-popup .close-button'); // Tombol close di dalam popup
    const prevButton = document.getElementById('prev-announcement');
    const nextButton = document.getElementById('next-announcement');

    function showAnnouncement(index) {
        if (!announcementPopup || !announcementDateElement || !announcementTextElement || announcements.length === 0) return;

        currentAnnouncementIndex = index; // Update current index
        announcementDateElement.textContent = announcements[index].date;
        announcementTextElement.textContent = announcements[index].text;
        announcementPopup.style.display = 'block';

        const announcementIdentifier = `${announcements[index].date}-${announcements[index].text.substring(0,20)}`;
        if (!viewedAnnouncements.includes(announcementIdentifier)) {
            viewedAnnouncements.push(announcementIdentifier);
            localStorage.setItem('viewedAnnouncements', JSON.stringify(viewedAnnouncements));
        }
    }

    function closeAnnouncement() {
        if (announcementPopup) announcementPopup.style.display = 'none';
    }

    function nextAnnouncement() {
        if (announcements.length === 0) return;
        const nextIndex = (currentAnnouncementIndex + 1) % announcements.length;
        showAnnouncement(nextIndex);
    }

    function prevAnnouncement() {
        if (announcements.length === 0) return;
        const prevIndex = (currentAnnouncementIndex - 1 + announcements.length) % announcements.length;
        showAnnouncement(prevIndex);
    }

    if (announcementButton) {
        announcementButton.addEventListener('click', () => {
             if (announcements.length > 0) showAnnouncement(currentAnnouncementIndex);
        });
    }
    if (closeButton) closeButton.addEventListener('click', closeAnnouncement);
    if (prevButton) prevButton.addEventListener('click', prevAnnouncement);
    if (nextButton) nextButton.addEventListener('click', nextAnnouncement);

    // Tampilkan pengumuman baru yang belum dilihat saat halaman dimuat
    if (announcements.length > 0) {
        let firstUnreadIndex = -1;
        for (let i = 0; i < announcements.length; i++) {
            const announcementIdentifier = `${announcements[i].date}-${announcements[i].text.substring(0,20)}`;
            if (!viewedAnnouncements.includes(announcementIdentifier)) {
                firstUnreadIndex = i;
                break;
            }
        }
        if (firstUnreadIndex !== -1) {
            showAnnouncement(firstUnreadIndex);
        } else {
             // Jika semua sudah dilihat, tampilkan yang terbaru (atau yang pertama) sebagai default jika tombol diklik
             currentAnnouncementIndex = announcements.length -1; // atau 0
        }
    }
});
// =============================
// 18. (Bagian 19 dari Part 2) - Validasi Qty Sample Set
// =============================
function validateQtySampleSet() {
    if (!qtySampleSetInput) return true; // Jika elemen tidak ada, lewati validasi ini
    const qtySampleSetValue = parseInt(qtySampleSetInput.value, 10) || 0;
    const currentTotalInspect = totalInspected; // totalInspected sudah diupdate oleh updateTotalQtyInspect

    if (qtySampleSetValue > 0 && currentTotalInspect !== qtySampleSetValue) { // Validasi hanya jika Qty Sample Set diisi
        alert(`Jumlah total Qty Inspect (${currentTotalInspect}) harus sama dengan Qty Sample Set (${qtySampleSetValue}).`);
        return false;
    }
    return true;
}
// =============================
// 19. Inisialisasi Aplikasi & Event Listeners Utama
// =============================
function initApp() {
    console.log("Menginisialisasi aplikasi...");

    // === PENTING: INISIALISASI outputElements DI SINI SETELAH DOM SIAP ===
    // Gunakan ID yang benar dari HTML: '-counter'
    outputElements = {
        'a-grade': document.getElementById('a-grade-counter'), // <--- ID KOREKSI
        'r-grade': document.getElementById('r-grade-counter'), // <--- ID KOREKSI
        'b-grade': document.getElementById('b-grade-counter'), // <--- ID KOREKSI
        'c-grade': document.getElementById('c-grade-counter') // <--- ID KOREKSI
    };

    // Cek apakah elemen output ditemukan (debugging tambahan - ini opsional tapi disarankan)
    for (const category in outputElements) {
        if (!outputElements[category]) {
            console.error(`INIT ERROR: Elemen output dengan ID '${category.replace('-grade', '-counter')}' tidak ditemukan di HTML!`);
            // Tindakan darurat jika elemen krusial tidak ada, misalnya:
            // alert(`Error: Element for ${category.replace('-grade', '-counter')} not found! Please check HTML.`);
            // return; // Berhenti inisialisasi jika elemen penting tidak ada
        } else {
             console.log(`Element output for ${category} found.`); // Debugging
        }
    }
    // ==================================================================


    // === Letakkan SEMUA setup event listener dan inisialisasi UI awal di bawah sini ===

    // Setup Tombol Defect (Bagian 6 dari Part 1 - pindahkan kodenya ke dalam initApp)
    const defectButtons = document.querySelectorAll('.defect-button');
    defectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const defectType = button.dataset.defect || button.textContent.trim();
            addDefectToSummary(defectType, summaryContainer);
            button.classList.add('active-feedback');
            setTimeout(() => button.classList.remove('active-feedback'), 200);
             // Reset mode +/- setelah klik pada tombol Defect
             isAdding = false;
             isSubtracting = false;
             const plusButton = document.getElementById('plus-button'); // Dapatkan referensi di sini jika belum
             const minusButton = document.getElementById('minus-button'); // Dapatkan referensi di sini jika belum
             if (plusButton) { plusButton.classList.remove('active'); plusButton.classList.add('inactive'); }
             if (minusButton) { minusButton.classList.remove('active'); minusButton.classList.add('inactive'); }
        });
    });

    // Setup Tombol Rework (Kiri, Kanan, Pasangan) (Bagian 3 dari Part 1 - pindahkan kodenya ke dalam initApp)
    const reworkLeftButton = document.getElementById('rework-left');
    if (reworkLeftButton) {
        reworkLeftButton.addEventListener('click', () => {
            currentDefectPosition = "LEFT";
            updateQuantity('left-counter', 1); // Default tambah 1 jika tidak mode +/-
             // Reset mode +/- setelah klik pada tombol Rework
             isAdding = false;
             isSubtracting = false;
             const plusButton = document.getElementById('plus-button');
             const minusButton = document.getElementById('minus-button');
             if (plusButton) { plusButton.classList.remove('active'); plusButton.classList.add('inactive'); }
             if (minusButton) { minusButton.classList.remove('active'); minusButton.classList.add('inactive'); }
        });
    }
    const reworkRightButton = document.getElementById('rework-right');
    if (reworkRightButton) {
        reworkRightButton.addEventListener('click', () => {
            currentDefectPosition = "RIGHT";
            updateQuantity('right-counter', 1);
             // Reset mode +/- setelah klik pada tombol Rework
             isAdding = false;
             isSubtracting = false;
             const plusButton = document.getElementById('plus-button');
             const minusButton = document.getElementById('minus-button');
             if (plusButton) { plusButton.classList.remove('active'); plusButton.classList.add('inactive'); }
             if (minusButton) { minusButton.classList.remove('active'); minusButton.classList.add('inactive'); }
        });
    }
    const reworkPairsButton = document.getElementById('rework-pairs');
    if (reworkPairsButton) {
        reworkPairsButton.addEventListener('click', () => {
            currentDefectPosition = "PAIRS";
            updateQuantity('pairs-counter', 1);
             // Reset mode +/- setelah klik pada tombol Rework
             isAdding = false;
             isSubtracting = false;
             const plusButton = document.getElementById('plus-button');
             const minusButton = document.getElementById('minus-button');
             if (plusButton) { plusButton.classList.remove('active'); plusButton.classList.add('inactive'); }
             if (minusButton) { minusButton.classList.remove('active'); minusButton.classList.add('inactive'); }
        });
    }

    // Setup Tombol Plus dan Minus (Bagian 7 dari Part 1 - pindahkan kodenya ke dalam initApp)
    const plusButton = document.getElementById('plus-button'); // Dapatkan referensi di sini
    const minusButton = document.getElementById('minus-button'); // Dapatkan referensi di sini
    if (plusButton && minusButton) {
        plusButton.addEventListener('click', () => {
            isAdding = !isAdding; // TOGGLE mode adding
            isSubtracting = false; // Pastikan mode subtracting mati
            console.log(`Plus button clicked. isAdding: ${isAdding}, isSubtracting: ${isSubtracting}`);
            plusButton.classList.toggle('active', isAdding); // Toggle visual class
            plusButton.classList.toggle('inactive', !isAdding);
            minusButton.classList.remove('active');
            minusButton.classList.add('inactive');
        });
        minusButton.addEventListener('click', () => {
            isSubtracting = !isSubtracting; // TOGGLE mode subtracting
            isAdding = false; // Pastikan mode adding mati
             console.log(`Minus button clicked. isAdding: ${isAdding}, isSubtracting: ${isSubtracting}`);
             minusButton.classList.toggle('active', isSubtracting); // Toggle visual class
             minusButton.classList.toggle('inactive', !isSubtracting);
             plusButton.classList.remove('active');
             plusButton.classList.add('inactive');
        });
        // Initial state (pindahkan ke sini atau biarkan di bawah kalau sudah ada)
        plusButton.classList.add('inactive');
        minusButton.classList.add('inactive');
    }


    // === Event listener tombol .input-button (pertahankan di sini, di dalam initApp) ===
    const inputButtons = document.querySelectorAll('.input-button');
    inputButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            console.log("Raw .input-button click event on:", event.target);
            let targetButton = event.target;
            // Pastikan kita mendapatkan elemen .input-button utama jika yang diklik adalah child (misal ikon)
            while (targetButton && targetButton !== document && !targetButton.classList.contains('input-button')) {
                targetButton = targetButton.parentElement;
            }

            if (targetButton && targetButton !== document && targetButton.classList.contains('input-button')) {
                console.log("Processed .input-button:", targetButton);
                let gradeCategoryClass = Array.from(targetButton.classList).find(cls => cls.endsWith('-grade'));

                if (gradeCategoryClass) {
                    console.log(`Grade category found: ${gradeCategoryClass}`);
                    // Pastikan handleGradeSelection didefinisikan dan tidak menyebabkan error
                    // handleGradeSelection(gradeCategoryClass); // Panggil ini jika perlu menandai tombol grade aktif

                    const isQtyItemButton = targetButton.closest('.qty-item') !== null;
                    console.log(`Is Qty Item button? ${isQtyItemButton}`);

                    if (isQtyItemButton) {
                        let amountToUpdate = 0;

                        // Logika penentuan amountToUpdate berdasarkan isAdding/isSubtracting
                        if (isAdding) {
                            amountToUpdate = 1;
                            console.log("Mode: Adding (isAdding=true)");
                        } else if (isSubtracting) {
                            amountToUpdate = -1;
                            console.log("Mode: Subtracting (isSubtracting=true)");
                        } else {
                            amountToUpdate = 1; // Mode Default jika tidak ada plus/minus aktif
                            console.log("Mode: Default (isAdding=false, isSubtracting=false)");
                        }

                        console.log(`Calling updateOutput for grade '${gradeCategoryClass}' with amount ${amountToUpdate}`);
                        // Panggil updateOutput dengan kedua argumen (fungsi updateOutput sudah diperbaiki)
                        updateOutput(gradeCategoryClass, amountToUpdate);

                        // === PENTING: Reset mode +/- setelah KLIK TOMBOL GRADE ===
                        // Ini memastikan setelah menambah/mengurangi grade, mode kembali normal
                        isAdding = false;
                        isSubtracting = false;
                        // Update tampilan tombol plus/minus
                        const plusButtonInListener = document.getElementById('plus-button');
                        const minusButtonInListener = document.getElementById('minus-button');
                        if (plusButtonInListener) { plusButtonInListener.classList.remove('active'); plusButtonInListener.classList.add('inactive'); }
                        if (minusButtonInListener) { minusButtonInListener.classList.remove('active'); minusButtonInListener.classList.add('inactive'); }
                        // ==========================================================

                    } else {
                        console.log("Bukan Qty Item button, tidak ada update kuantitas untuk:", targetButton);
                        // Mungkin Anda tetap ingin me-reset mode +/- meskipun bukan Qty Item button, tergantung kebutuhan
                        // isAdding = false; isSubtracting = false; // Jika ingin reset di sini juga
                        // Update tampilan tombol plus/minus
                        // ... (kode update class tombol +/- jika reset dilakukan di sini) ...
                    }
                     // Panggil handleGradeSelection di sini agar aktif state tombol grade diperbarui
                     handleGradeSelection(gradeCategoryClass); // Pindah pemanggilan ke sini

                } else {
                    console.warn("Tombol .input-button yang diklik tidak memiliki class kategori grade (contoh: 'a-grade'):", targetButton);
                }
            } else {
                console.warn("Tidak dapat mengidentifikasi elemen .input-button dari event klik.");
            }
        });
    });
    // ===============================================================


    // Setup Tombol Simpan (Pertahankan di sini)
    const saveButton = document.querySelector(".save-button");
    if (saveButton) {
        saveButton.addEventListener("click", saveData);
    }

    // Inisialisasi Qty Sample Set (Pertahankan di sini)
    if (qtySampleSetInput) {
        let qtySampleSetValue = parseInt(localStorage.getItem('qtySampleSet')) || 0;
        qtySampleSetInput.value = qtySampleSetValue;
        qtySampleSetInput.addEventListener('change', () => {
            qtySampleSetValue = parseInt(qtySampleSetInput.value, 10) || 0;
            localStorage.setItem('qtySampleSet', qtySampleSetValue);
            // Mungkin panggil updateTotalQtyInspect() di sini juga kalau Qty Sample Set berubah
             updateTotalQtyInspect();
        });
    }

    // Initial UI State (Pertahankan di sini)
    toggleButtonState(true); // Nonaktifkan rework & defect buttons di awal
    updateTotalQtyInspect(); // Hitung dan tampilkan nilai awal (seharusnya semua 0)

    console.log("Aplikasi berhasil diinisialisasi.");
} // Penutup fungsi initApp


// === Letakkan DEFINISI FUNGSI updateOutput dan updateTotalQtyInspect di sini, di luar initApp ===
// Letakkan setelah definisi variabel global, tapi sebelum DOMContentLoaded listener.
// Anda sudah punya ini di Part 2 (bagian 13 dan 14). Pastikan kodenya sudah diperbaiki
// seperti saran saya sebelumnya (menerima parameter 'amount').
