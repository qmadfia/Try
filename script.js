// =============================
// 1. Deklarasi Variabel Global
// =============================
// Variabel State Aplikasi
let totalInspected = 0;
let totalReworkLeft = 0;
let totalReworkRight = 0;
let totalReworkPairs = 0;
let currentDefectPosition = "LEFT";
let defectCounts = {};
const qtyInspectOutputs = {
    'a-grade': 0,
    'r-grade': 0,
    'b-grade': 0,
    'c-grade': 0
};

// Referensi Elemen DOM Utama
const fttOutput = document.getElementById('fttOutput');
const qtyInspectOutput = document.getElementById('qtyInspectOutput'); // Total Qty Inspect
const leftCounter = document.getElementById('left-counter');
const rightCounter = document.getElementById('right-counter');
const pairsCounter = document.getElementById('pairs-counter');
const summaryContainer = document.getElementById('summary-list');
const redoRateOutput = document.getElementById('redoRateOutput');
const qtySampleSetInput = document.getElementById('qty-sample-set');

// Referensi Elemen DOM untuk output per grade (A,R,B,C)
let outputElements = {}; // Diisi di initApp setelah DOM siap

// =============================
// 2. Fungsi Utama Aplikasi
// =============================

// =============================
// 4. Fungsi untuk Menghitung FTT
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
// 5. Fungsi untuk Mengupdate Kuantitas Rework (Kiri, Kanan, Pasangan)
// =============================
function updateQuantity(counterId) {
    const counterElement = document.getElementById(counterId);

    if (!counterElement) {
        console.error("Elemen counter tidak ditemukan:", counterId);
        return;
    }
    let currentValue = parseInt(counterElement.textContent) || 0;
    currentValue++;
    currentValue = Math.max(0, currentValue);
    counterElement.textContent = currentValue;

    if (counterId === 'left-counter') {
        totalReworkLeft = currentValue;
    } else if (counterId === 'right-counter') {
        totalReworkRight = currentValue;
    } else if (counterId === 'pairs-counter') {
        totalReworkPairs = currentValue;
    }
    updateRedoRate();
}

// =============================
// 6. Fungsi terkait Defect
// =============================
function addDefectToSummary(defectType, container) {
    const rGradeActive = document.querySelector('.r-grade.active');
    const bGradeActive = document.querySelector('.b-grade.active');
    const cGradeActive = document.querySelector('.c-grade.active');

    let currentGrade = "";
    if (rGradeActive) currentGrade = "R-GRADE";
    else if (bGradeActive) currentGrade = "B-GRADE";
    else if (cGradeActive) currentGrade = "C-GRADE";

    if (!currentGrade) {
        console.warn("Pilih grade (R, B, atau C) sebelum menambahkan defect.");
        return;
    }
    if (!["LEFT", "RIGHT", "PAIRS"].includes(currentDefectPosition)) {
        console.warn("Posisi defect (Kiri/Kanan/Pasangan) belum dipilih dengan benar.");
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

    defectCounts[defectType][currentDefectPosition][currentGrade]++;

    console.log("defectCounts diupdate:", JSON.stringify(defectCounts));
    updateDefectSummaryDisplay(container);
    updateFTT();
}

// =============================
// 8. Fungsi untuk menampilkan summary defect
// =============================
function updateDefectSummaryDisplay(container) {
    if (!container) return;

    container.innerHTML = ''; // Bersihkan summary list
    const gradeOrder = ["REWORK", "B-GRADE", "C-GRADE"]; // Urutan tampilan grade
    const positionOrder = ["LEFT", "PAIRS", "RIGHT"]; // Urutan tampilan posisi

    const summaryItems = [];

    for (const defectType in defectCounts) {
        for (const position of positionOrder) {
            if (defectCounts[defectType][position]) {
                for (const displayGrade of gradeOrder) {
                    let internalGradeKey = "";
                    if (displayGrade === "REWORK") {
                        internalGradeKey = "R-GRADE";
                    } else if (displayGrade === "B-GRADE") {
                        internalGradeKey = "B-GRADE";
                    } else if (displayGrade === "C-GRADE") {
                        internalGradeKey = "C-GRADE";
                    }

                    if (defectCounts[defectType][position][internalGradeKey] && defectCounts[defectType][position][internalGradeKey] > 0) {
                        const count = defectCounts[defectType][position][internalGradeKey];
                        const item = document.createElement('div');
                        item.className = 'summary-item';
                        item.innerHTML = `
                            <div class="defect-col">${defectType}</div>
                            <div class="position-col">${position}</div>
                            <div class="level-col">${displayGrade} <span class="count">${count}</span></div>
                        `;
                        summaryItems.push({
                            defectType: defectType,
                            grade: displayGrade,
                            position: position,
                            element: item
                        });
                    }
                }
            }
        }
    }

    summaryItems.sort((a, b) => {
        if (a.defectType < b.defectType) return -1;
        if (a.defectType > b.defectType) return 1;

        const gradeOrderIndexA = gradeOrder.indexOf(a.grade);
        const gradeOrderIndexB = gradeOrder.indexOf(b.grade);
        if (gradeOrderIndexA < gradeOrderIndexB) return -1;
        if (gradeOrderIndexA > gradeOrderIndexB) return 1;

        const positionOrderIndexA = positionOrder.indexOf(a.position);
        const positionOrderIndexB = positionOrder.indexOf(b.position);
        if (positionOrderIndexA < positionOrderIndexB) return -1;
        if (positionOrderIndexA > positionOrderIndexB) return 1;

        return 0;
    });

    summaryItems.forEach(itemData => {
        container.appendChild(itemData.element);
    });
}

// =============================
// 9. (Bagian 10 dari Part 1) - Kirim Data ke Google Sheets
// =============================
async function saveData() {
    console.log("Memulai proses simpan data...");

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
        alert("Terjadi kesalahan saat menyimpan data. Cek koneksi internet atau hubungi Team QM System.");
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
    if (redoRateOutput) redoRateOutput.textContent = "0.00%";

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

    // Update visual tombol plus/minus (karena tombolnya dihilangkan, ini tidak perlu lagi)

    const gradeInputButtons = document.querySelectorAll('.qty-item .input-button');
    gradeInputButtons.forEach(button => {
        button.classList.remove('active');
    });

    toggleButtonState(true); // Nonaktifkan rework dan defect di awal

    if (summaryContainer) {
        summaryContainer.innerHTML = "";
        // atau panggil updateDefectSummaryDisplay(summaryContainer); jika ingin konsisten
    }

    // 5. Update semua kalkulasi dan tampilan
    updateTotalQtyInspect(); // Ini akan update FTT dan RedoRate juga

    // Reset Qty Sample Set jika perlu
    // if (qtySampleSetInput) qtySampleSetInput.value = "0";

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
        alert("Harap isi semua input dasar (Auditor, NCVS, Model, Style Number) sebelum menyimpan data!");
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
        alert("Jika ada item Re, B-Grade, atau C-Grade, harap pilih setidaknya satu defect sebelum menyimpan data!");
        return false;
    }
    // Jika hanya A-Grade, defect tidak wajib
    return true;
}

// =============================
// 13. (Bagian 14 dari Part 2) - Fungsi untuk mengupdate output qty inspect (A, R, B, C Grade)
// =============================
function updateOutput(category) {
    if (!qtyInspectOutputs.hasOwnProperty(category) || !outputElements[category]) {
        console.error("updateOutput Error: Kategori grade tidak valid atau elemen output tidak ditemukan:", category);
        return;
    }

    qtyInspectOutputs[category]++;
    outputElements[category].textContent = qtyInspectOutputs[category];
    console.log(`Updated ${category} to ${qtyInspectOutputs[category]}`);
    updateTotalQtyInspect();
}

// =============================
// 14. (Bagian 15 dari Part 2) - Fungsi untuk menghitung total qty inspect
// (Pastikan kode di sini sudah diperbaiki seperti ini)
// =============================
function updateTotalQtyInspect() {
    let total = 0;
    for (const category in qtyInspectOutputs) {
        if (Object.prototype.hasOwnProperty.call(qtyInspectOutputs, category)) {
            total += qtyInspectOutputs[category];
        }
    }
    if (qtyInspectOutput) { // qtyInspectOutput adalah elemen untuk TOTAL Qty Inspect
        qtyInspectOutput.textContent = total;
    }
    totalInspected = total; // Perbarui variabel global totalInspected

    // Panggil update FTT dan Redo Rate SETELAH totalInspected diperbarui
    updateFTT();
    updateRedoRate();
    console.log("updateTotalQtyInspect completed. Total:", totalInspected); // Debugging log
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
document.addEventListener('DOMContentLoaded', () => {
    const announcements = [
        { date: "2024-10-26", text: "info a" },
        { date: "2024-10-26", text: "info B" },
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

        const announcementIdentifier = `${announcements[index].date}-${announcements[index].text.substring(0, 20)}`;
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
            const announcementIdentifier = `${announcements[i].date}-${announcements[i].text.substring(0, 20)}`;
            if (!viewedAnnouncements.includes(announcementIdentifier)) {
                firstUnreadIndex = i;
                break;
            }
        }
        if (firstUnreadIndex !== -1) {
            showAnnouncement(firstUnreadIndex);
        } else {
            // Jika semua sudah dilihat, tampilkan yang terbaru (atau yang pertama) sebagai default jika tombol diklik
            currentAnnouncementIndex = announcements.length - 1; // atau 0
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
    console.log("Menginisialisasi aplikasi dengan logika input sekali klik...");

    // === PENTING: INISIALISASI outputElements DI SINI SETELAH DOM SIAP ===
    outputElements = {
        'a-grade': document.getElementById('a-grade-counter'),
        'r-grade': document.getElementById('r-grade-counter'),
        'b-grade': document.getElementById('b-grade-counter'),
        'c-grade': document.getElementById('c-grade-counter')
    };

    // Cek apakah elemen output ditemukan (debugging tambahan)
    for (const category in outputElements) {
        if (!outputElements[category]) {
            console.error(`INIT ERROR: Elemen output dengan ID '${category.replace('-grade', '-counter')}' tidak ditemukan di HTML!`);
        } else {
            console.log(`Element output for ${category} found.`);
        }
    }

    // Setup Tombol Defect
    const defectButtons = document.querySelectorAll('.defect-button');
    defectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const defectType = button.dataset.defect || button.textContent.trim();
            addDefectToSummary(defectType, summaryContainer);
            button.classList.add('active-feedback');
            setTimeout(() => button.classList.remove('active-feedback'), 200);
        });
    });

    // Setup Tombol Rework (Kiri, Kanan, Pasangan)
    const reworkLeftButton = document.getElementById('rework-left');
    if (reworkLeftButton) {
        reworkLeftButton.addEventListener('click', () => {
            currentDefectPosition = "LEFT";
            updateQuantity('left-counter');
        });
    }
    const reworkRightButton = document.getElementById('rework-right');
    if (reworkRightButton) {
        reworkRightButton.addEventListener('click', () => {
            currentDefectPosition = "RIGHT";
            updateQuantity('right-counter');
        });
    }
    const reworkPairsButton = document.getElementById('rework-pairs');
    if (reworkPairsButton) {
        reworkPairsButton.addEventListener('click', () => {
            currentDefectPosition = "PAIRS";
            updateQuantity('pairs-counter');
        });
    }

    // Event listener tombol .input-button (untuk Grade A,R,B,C)
    const inputButtons = document.querySelectorAll('.input-button');
    inputButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            let targetButton = event.target;
            while (targetButton && targetButton !== document && !targetButton.classList.contains('input-button')) {
                targetButton = targetButton.parentElement;
            }

            if (targetButton && targetButton !== document && targetButton.classList.contains('input-button')) {
                let gradeCategoryClass = Array.from(targetButton.classList).find(cls => cls.endsWith('-grade'));

                if (gradeCategoryClass) {
                    handleGradeSelection(gradeCategoryClass);
                    const isQtyItemButton = targetButton.closest('.qty-item') !== null;
                    if (isQtyItemButton) {
                        updateOutput(gradeCategoryClass);
                    }
                } else {
                    console.warn("Tombol .input-button diklik tanpa class kategori grade:", targetButton);
                }
            }
        });
    });

    // Setup Tombol Simpan
    const saveButton = document.querySelector(".save-button");
    if (saveButton) {
        saveButton.addEventListener("click", saveData);
    }

    // Inisialisasi Qty Sample Set
    if (qtySampleSetInput) {
        let qtySampleSetValue = parseInt(localStorage.getItem('qtySampleSet')) || 0;
        qtySampleSetInput.value = qtySampleSetValue;
        qtySampleSetInput.addEventListener('change', () => {
            qtySampleSetValue = parseInt(qtySampleSetInput.value, 10) || 0;
            localStorage.setItem('qtySampleSet', qtySampleSetValue);
            updateTotalQtyInspect();
        });
    }

    // Initial UI State
    toggleButtonState(true); // Nonaktifkan rework & defect buttons di awal
    updateTotalQtyInspect(); // Hitung dan tampilkan nilai awal

    // Hilangkan elemen tombol plus minus dari DOM
    const plusButtonElement = document.getElementById('plus-button');
    const minusButtonElement = document.getElementById('minus-button');
    if (plusButtonElement && plusButtonElement.parentNode) {
        plusButtonElement.parentNode.removeChild(plusButtonElement);
    }
    if (minusButtonElement && minusButtonElement.parentNode) {
        minusButtonElement.parentNode.removeChild(minusButtonElement);
    }

    console.log("Aplikasi berhasil diinisialisasi dengan input sekali klik.");
} // Penutup fungsi initApp

// =============================
// 15. (Bagian 16 dari Part 2) - Logika Kontrol Tombol Berdasarkan Grade
// =============================
function toggleButtonState(disable) {
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
function handleGradeSelection(gradeCategory) {
    const allGradeButtons = document.querySelectorAll('.input-button');
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
    toggleButtonState(!enableReworkAndDefects);
}

// === Event listener utama untuk menjalankan inisialisasi setelah DOM siap ===
document.addEventListener('DOMContentLoaded', initApp);

// === Jika Anda punya DOMContentLoaded terpisah untuk Announcement, biarkan tetap di bawah yang ini atau gabungkan ===
// document.addEventListener('DOMContentLoaded', () => { ... }); // Kode announcement
