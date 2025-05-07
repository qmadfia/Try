// =============================
// 1. Variabel Global
// =============================
let totalInspected = 0; // Total barang yang diinspeksi
let totalReworkLeft = 0; // Total rework kiri
let totalReworkRight = 0; // Total rework kanan
let totalReworkPairs = 0; // Total rework pairs
let isAdding = false; // Flag untuk menandakan mode penambahan
let isSubtracting = false; // Flag untuk menandakan mode pengurangan

// Elemen DOM
const fttOutput = document.getElementById('fttOutput');
const qtyInspectOutput = document.getElementById('qtyInspectOutput');
const leftCounter = document.getElementById('left-counter');
const rightCounter = document.getElementById('right-counter');
const pairsCounter = document.getElementById('pairs-counter');


// =============================
// 3. Event Listener untuk Rework
// =============================
const reworkLeftButton = document.getElementById('rework-left');
reworkLeftButton.addEventListener('click', () => {
    updateQuantity('left-counter', 1); // Tambah Rework Kiri
    updateRedoRate(); // Perbarui Redo Rate
});

const reworkRightButton = document.getElementById('rework-right');
reworkRightButton.addEventListener('click', () => {
    updateQuantity('right-counter', 1); // Tambah Rework Kanan
    updateRedoRate(); // Perbarui Redo Rate
});
const reworkPairsButton = document.getElementById('rework-pairs');
reworkPairsButton.addEventListener('click', () => {
    updateQuantity('pairs-counter', 1); // Tambah Rework Pairs
    updateRedoRate(); // Perbarui Redo Rate
});

// =============================
// 4. Fungsi untuk Menghitung FTT
// =============================
function updateFTT() {
    if (totalInspected === 0) {
        fttOutput.textContent = '0%';
        fttOutput.className = 'counter'; // Set default class (light blue)
        return;
    }

    // Ambil nilai total R-Grade, B-Grade, dan C-Grade dari output elemen
    const totalRGradeElement = document.getElementById('output-r-grade');
    const totalBGradeElement = document.getElementById('output-b-grade');
    const totalCGradeElement = document.getElementById('output-c-grade');
    const totalRGrade = parseInt(totalRGradeElement ? totalRGradeElement.textContent : '0', 10);
    const totalBGrade = parseInt(totalBGradeElement ? totalBGradeElement.textContent : '0', 10);
    const totalCGrade = parseInt(totalCGradeElement ? totalCGradeElement.textContent : '0', 10);

    // New FTT formula: (qty inspect - (r-grade) - (b-grade) - (c-grade)) / qty inspect
    const fttValue = ((totalInspected - totalRGrade - totalBGrade - totalCGrade) / totalInspected) * 100;

    fttOutput.textContent = `${Math.max(0, fttValue.toFixed(2))}%`; // Nilai FTT tidak boleh negatif

    // Update color based on FTT value
    if (fttValue >= 92) {
        fttOutput.className = 'counter high-ftt'; // Green
    } else if (fttValue >= 80) {
        fttOutput.className = 'counter medium-ftt'; // Yellow
    } else {
        fttOutput.className = 'counter low-ftt'; // Red
    }
}

// =============================
// 5. Fungsi untuk Mengupdate Kuantitas
// =============================
function updateQuantity(counterId, change) {
    const counterElement = document.getElementById(counterId);
    let currentValue = parseInt(counterElement.textContent) || 0; // Ambil nilai saat ini

    // MODIFIKASI - PART CODE 5: Periksa apakah grade R, B, atau C aktif
    const rGradeActive = document.querySelector('.r-grade.active');
    const bGradeActive = document.querySelector('.b-grade.active');
    const cGradeActive = document.querySelector('.c-grade.active');

    if (!rGradeActive && !bGradeActive && !cGradeActive && (counterId === 'left-counter' || counterId === 'right-counter' || counterId === 'pairs-counter')) {
        console.warn("Rework hanya dapat ditambahkan setelah memilih R-Grade, B-Grade, atau C-Grade.");
        return; // Jangan lakukan update jika grade R/B/C tidak aktif dan ini adalah tombol rework
    }

    // Tambah atau kurangi nilai berdasarkan mode
    if (isAdding) {
        currentValue++; // Tambah jika mode penambahan aktif
    } else if (isSubtracting) {
        currentValue--; // Kurangi jika mode pengurangan aktif
    }

    // Pastikan nilai tidak kurang dari 0
    if (currentValue < 0) {
        currentValue = 0;
    }

    // Perbarui elemen counter
    counterElement.textContent = currentValue;

    // Perbarui totalInspected dan totalRework
    if (counterId === 'qtyInspectOutput') {
        totalInspected = currentValue; // Perbarui totalInspected
    } else if (counterId === 'left-counter') {
        totalReworkLeft = currentValue; // Perbarui totalReworkLeft
    } else if (counterId === 'right-counter') {
        totalReworkRight = currentValue; // Perbarui totalReworkRight
    } else if (counterId === 'pairs-counter') {
        totalReworkPairs = currentValue; // Perbarui totalReworkPairs
    }

    // Perbarui Redo Rate setelah perubahan rework
    if (counterId === 'left-counter' || counterId === 'right-counter' || counterId === 'pairs-counter') {
        updateRedoRate();
    }
}

// =============================
// 6. Fungsi untuk menangani klik tombol defect
// =============================
const defectCounts = {
    "OVER CEMENT": 0,
    "STAIN UPPER": 0,
    "STAIN OUTSOLE": 0,
    "THREAD END": 0,
    "RAT HOLE": 0,
    "BOND GAP UPPER": 0,
    "WRINKLE": 0,
    "ALIGN UP": 0,
    "OVER BUFFING": 0,
    "OFF CENTER": 0,
    "ARIANCE": 0,
    "X-RAY": 0,
    "BROKEN STITCHING": 0,
    "TOE / HEEL / COLLAR SHAPE": 0,
    "STITCH MARGIN / SPI": 0,
    "YELLOWING": 0,
    "ROCKING": 0,
    "BOND GAP MIDSOLE": 0,
    "MATERIAL FAILURE": 0,
    "COLOR MIGRATION": 0,
    "PEEL OFF": 0,
    "DELAMINATION": 0,
    "METAL CONTAMINATION": 0,
    "TWISTED SHOE": 0,
    "LOGO / AIR BAG": 0
};

// Setup defect buttons
function setupDefectButtons() {
    const defectButtons = document.querySelectorAll('.defect-button');
    defectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const defectName = button.textContent.trim();
            handleDefectClick(defectName);
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 200);
        });
    });
}

// Function to handle defect button clicks
function handleDefectClick(defectName) {
    // MODIFIKASI - PART CODE 6: Periksa apakah grade R, B, atau C aktif
    const rGradeActive = document.querySelector('.r-grade.active');
    const bGradeActive = document.querySelector('.b-grade.active');
    const cGradeActive = document.querySelector('.c-grade.active');

    if (!rGradeActive && !bGradeActive && !cGradeActive) {
        console.warn("Defect hanya dapat ditambahkan setelah memilih R-Grade, B-Grade, atau C-Grade.");
        return; // Jangan lakukan update defect jika grade R/B/C tidak aktif
    }

    if (defectCounts.hasOwnProperty(defectName)) {
        if (isAdding) {
            defectCounts[defectName]++;  // Menambah defect hanya 1 kali
        } else if (isSubtracting) {
            defectCounts[defectName] = Math.max(0, defectCounts[defectName] - 1);  // Mengurangi defect hanya 1 kali
        }

        // Update nilai defect pada tampilan
        console.log(`Defect ${defectName} updated to ${defectCounts[defectName]}`);
    } else {
        console.warn(`Defect '${defectName}' tidak dikenali.`);
    }

    // Update summary defect
    updateDefectSummary();
}

// Update the defect summary
function updateDefectSummary() {
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = ''; // Clear previous content

    // Loop through defect counts and display them
    for (const [defect, count] of Object.entries(defectCounts)) {
        if (count !== 0) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.textContent = `${defect}: ${count}`;
            summaryList.appendChild(summaryItem);
        }
    }
}
// Function to handle defect button clicks
function handleDefectClick(defectName) {
    if (defectCounts.hasOwnProperty(defectName)) {
        if (isAdding) {
            defectCounts[defectName]++;  // Menambah defect hanya 1 kali
        } else if (isSubtracting) {
            defectCounts[defectName] = Math.max(0, defectCounts[defectName] - 1);  // Mengurangi defect hanya 1 kali
        }

        // Update nilai defect pada tampilan
        console.log(`Defect ${defectName} updated to ${defectCounts[defectName]}`);
    } else {
        console.warn(`Defect '${defectName}' tidak dikenali.`);
    }

    // Update summary defect
    updateDefectSummary();
}

// Update the defect summary
function updateDefectSummary() {
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = ''; // Clear previous content

    // Loop through defect counts and display them
    for (const [defect, count] of Object.entries(defectCounts)) {
        if (count !== 0) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.textContent = `${defect}: ${count}`;
            summaryList.appendChild(summaryItem);
        }
    }
}

// =============================
// 7. Event Listeners untuk Plus dan Minus Buttons
// =============================
document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const minusButton = document.getElementById('minus-button');

    // Global click event listeners for plus and minus modes
    plusButton.addEventListener('click', () => {
        isAdding = true;
        isSubtracting = false;

        // Update button styles
        plusButton.classList.add('active');
        plusButton.classList.remove('inactive');
        minusButton.classList.remove('active');
        minusButton.classList.add('inactive');
    });

    minusButton.addEventListener('click', () => {
        isAdding = false;
        isSubtracting = true;

        // Update button styles
        minusButton.classList.add('active');
        minusButton.classList.remove('inactive');
        plusButton.classList.remove('active');
        plusButton.classList.add('inactive');
    });

    // Make sure the initial state is correctly set
    plusButton.classList.add('inactive');
    minusButton.classList.add('inactive');
});

// =============================
// 8. Inisialisasi Aplikasi
// =============================
function init() {
    setupDefectButtons(); // Setup defect buttons
    setupQuantityButtons(); // Setup quantity buttons

    // MODIFIKASI - PART CODE 8: Pastikan rework section dan defect menu item nonaktif saat aplikasi dimuat
    toggleButtonState(true); // true berarti nonaktifkan tombol

    // MODIFIKASI - PART CODE 8: Pastikan tidak ada tombol grade yang aktif secara visual saat awal
    const gradeButtons = document.querySelectorAll('.input-button');
    gradeButtons.forEach(button => {
        button.classList.remove('active');
    });

    // MODIFIKASI - PART CODE 8: Atur ulang status tombol plus/minus global ke inactive
    const plusButton = document.getElementById('plus-button');
    const minusButton = document.getElementById('minus-button');
    if (plusButton && minusButton) { // Pastikan tombol ada
        isAdding = false;
        isSubtracting = false;
        plusButton.classList.remove('active');
        plusButton.classList.add('inactive');
        minusButton.classList.remove('active');
        minusButton.classList.add('inactive');
    }
}

// Tunggu hingga DOM dimuat sebelum menginisialisasi
document.addEventListener('DOMContentLoaded', init);

// =============================
// 10. Kirim Data ke Google Sheets via Web App & Validasi Total Defect dan Total Rework Sebelum SIMPAN
// =============================
document.querySelector(".save-button").addEventListener("click", async () => {
  // Validasi input
  if (!validateInputs()) return;
  if (!validateDefects()) return;
  if (!validateQtySampleSet()) return;

  // Hitung total defect
  const totalDefect = Object.values(defectCounts).reduce((acc, count) => acc + count, 0);

  // Hitung total rework
  const totalRework = ((totalReworkLeft + totalReworkRight) / 2) + totalReworkPairs;

  // Validasi total defect tidak boleh lebih rendah dari total rework
  if (totalDefect < totalRework) {
    alert("Total defect tidak boleh lebih rendah dari total rework. Data tidak dapat disimpan.");
    return;
  }

  // Ambil nilai FTT dan Redo Rate
  const fttElement = document.getElementById("fttOutput");
  const fttRaw = fttElement ? fttElement.innerText.replace("%", "").trim() : "0";
  const ftt = parseFloat(fttRaw) / 100;

  const redoRateElement = document.getElementById("redoRateOutput");
  const redoRateRaw = redoRateElement ? redoRateElement.innerText.replace("%", "").trim() : "0";
  const redoRate = parseFloat(redoRateRaw) / 100;

  // Ambil data defect dari elemen summary-item
  const summaryItems = document.querySelectorAll(".summary-item");
  const defects = Array.from(summaryItems).map(item => {
    const [type, count] = item.textContent.split(":");
    return {
      type: type.trim(),
      count: parseInt(count.trim(), 10),
    };
  });

  // Buat payload data yang akan dikirim
  const data = {
    auditor: document.getElementById("auditor").value,
    ncvs: document.getElementById("ncvs").value,
    modelName: document.getElementById("model-name").value,
    styleNumber: document.getElementById("style-number").value,
    qtyInspect: parseInt(document.getElementById("qtyInspectOutput").innerText, 10),
    ftt,
    redoRate,
    "a-grade": parseInt(document.getElementById("output-a-grade").innerText, 10),
    "b-grade": parseInt(document.getElementById("output-b-grade").innerText, 10),
    "c-grade": parseInt(document.getElementById("output-c-grade").innerText, 10),
    reworkKiri: parseInt(document.getElementById("left-counter").innerText, 10),
    reworkKanan: parseInt(document.getElementById("right-counter").innerText, 10),
    defects,
  };

  try {
    // Nonaktifkan tombol simpan sementara
    const saveButton = document.querySelector(".save-button");
    saveButton.disabled = true;

    // Kirim data ke Web App Google Apps Script
    const response = await fetch("https://script.google.com/macros/s/AKfycbwpDfeJf5TTi1I5KPpXc-eIxHZ-RJYi2BTzUJJwnyaOu2ywP_iKe4W-7hGWwiAKWPJr/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.text();
    alert(result);

    // Reset semua input jika berhasil
    resetAllFields();
  } catch (error) {
    alert("Terjadi kesalahan saat menyimpan data.");
    console.error(error);
  } finally {
    // Aktifkan kembali tombol simpan
    document.querySelector(".save-button").disabled = false;
  }
});

// =============================
// 11. Reset Data Setelah Simpan
// =============================
function resetAllFields() {
    // Reset input form fields
    document.getElementById("auditor").value = "";
    document.getElementById("ncvs").value = "";
    document.getElementById("model-name").value = "";
    document.getElementById("style-number").value = "";

    // Reset counters and output sections
    document.getElementById("qtyInspectOutput").textContent = "0";
    document.getElementById("left-counter").textContent = "0";
    document.getElementById("right-counter").textContent = "0";
    document.getElementById("pairs-counter").textContent = "0";
    document.getElementById("fttOutput").textContent = "0%";
    document.getElementById("redoRateOutput").textContent = "0.00%"; // Reset redo rate

    // Reset defect summary
    const summaryList = document.getElementById("summary-list");
    summaryList.innerHTML = ""; // Clear the summary section

    // Reset defect counts
    for (const defect in defectCounts) {
        defectCounts[defect] = 0; // Reset defect counters
    }

    // Reset global counters
    totalInspected = 0;
    totalReworkLeft = 0;
    totalReworkRight = 0;
    totalReworkPairs = 0;

    // Reset qty inspect outputs
    resetQtyInspectOutputs();

    console.log("All fields have been reset.");
}


// =============================
// 12. Validasi Input sebelum SIMPAN
// =============================
function validateInputs() {
    // Ambil elemen input
    const auditor = document.getElementById("auditor").value.trim();
    const ncvs = document.getElementById("ncvs").value.trim();
    const modelName = document.getElementById("model-name").value.trim();
    const styleNumberInput = document.getElementById("style-number"); // Dapatkan elemen input style number
    const styleNumber = styleNumberInput.value.trim();

    // Cek apakah ada input yang kosong
    if (!auditor || !ncvs || !modelName || !styleNumber) {
        alert("Harap isi semua input sebelum menyimpan data!");
        return false; // Validasi gagal
    }

    // Pola regex untuk format Style Number (6 huruf/angka - 3 huruf/angka)
    const styleNumberPattern = /^[a-zA-Z0-9]{6}-[a-zA-Z0-9]{3}$/;
    if (!styleNumberPattern.test(styleNumber)) {
        alert("Format Style Number tidak sesuai. Contoh: AH1567-100 atau 767688-001");
        styleNumberInput.classList.add('invalid-input'); // Tambahkan kelas error visual
        return false; // Validasi gagal jika format salah
    } else {
        styleNumberInput.classList.remove('invalid-input'); // Hapus kelas error jika format benar
    }

    return true; // Validasi berhasil
}

// =============================
// 13. Validasi Defect sebelum SIMPAN
// =============================
function validateDefects() {
    console.log("Memeriksa apakah ada defect yang dipilih...");

    // Mengecek apakah ada setidaknya satu defect yang memiliki jumlah > 0
    const hasDefect = Object.values(defectCounts).some(count => count > 0);
    
    console.log("Hasil Pengecekan Defect:", hasDefect); // Debugging

    if (!hasDefect) {
        alert("Harap pilih setidaknya satu defect sebelum menyimpan data!");
        return false;
    }

    return true;
}

// =============================
// 14. Qty Inspect Section Management
// =============================
const outputElements = {
    'a-grade': document.getElementById('output-a-grade'),
    'r-grade': document.getElementById('output-r-grade'),
    'b-grade': document.getElementById('output-b-grade'),
    'c-grade': document.getElementById('output-c-grade')
};

const qtyInspectButtons = document.querySelectorAll('.qty-item .input-button');
const qtyInspectOutputs = {
    'a-grade': 0,
    'r-grade': 0,
    'b-grade': 0,
    'c-grade': 0
};

// Fungsi untuk mengupdate output qty inspect
function updateOutput(category) {
    if (isAdding) {
        qtyInspectOutputs[category]++;
    } else if (isSubtracting) {
        qtyInspectOutputs[category] = Math.max(0, qtyInspectOutputs[category] - 1);
    }

    // Update tampilan per kategori
    outputElements[category].textContent = qtyInspectOutputs[category];

    // Perbarui total qty inspect setelah setiap perubahan
    updateTotalQtyInspect();

    // Panggil updateFTT() jika ada perubahan pada R-Grade, B-Grade, atau C-Grade
    if (category === 'r-grade' || category === 'b-grade' || category === 'c-grade') {
        updateFTT();
    }
}

// Setup event listener untuk setiap tombol qty inspect
qtyInspectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.classList[1].replace('-grade', '');
        updateOutput(category);
    });
});

// Tambahkan fungsi untuk reset qty inspect outputs saat reset
function resetQtyInspectOutputs() {
    for (const category in qtyInspectOutputs) {
        qtyInspectOutputs[category] = 0;
        outputElements[category].textContent = '0';
    }

    // Reset total qty inspect
    document.getElementById('qtyInspectOutput').textContent = '0';
    updateFTT(); // Pastikan FTT direset ke 0% saat semua qty direset
}

// Tambahkan pemanggilan reset ke fungsi resetAllFields
function extendedResetAllFields() {
    resetAllFields(); // Panggil fungsi asli
    resetQtyInspectOutputs(); // Tambahkan reset untuk qty inspect outputs
}

// Override fungsi resetAllFields dengan versi yang diperluas
resetAllFields = extendedResetAllFields;

// Setup event listener untuk setiap tombol qty inspect
qtyInspectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.classList[1].replace('-grade', '');
        updateOutput(category);
    });
});

// Tambahkan fungsi untuk reset qty inspect outputs saat reset
function resetQtyInspectOutputs() {
    for (const category in qtyInspectOutputs) {
        qtyInspectOutputs[category] = 0;
        outputElements[category].textContent = '0';
    }

    // Reset total qty inspect
    document.getElementById('qtyInspectOutput').textContent = '0';
    updateFTT(); // Pastikan FTT direset ke 0% saat semua qty direset
}

// Tambahkan pemanggilan reset ke fungsi resetAllFields
function extendedResetAllFields() {
    resetAllFields(); // Panggil fungsi asli
    resetQtyInspectOutputs(); // Tambahkan reset untuk qty inspect outputs
}

// Override fungsi resetAllFields dengan versi yang diperluas
resetAllFields = extendedResetAllFields;

// =============================
// 15. Akumulasi Qty Inspect dari Semua Grade
// =============================

// Fungsi untuk menghitung total qty inspect
function updateTotalQtyInspect() {
    let total = qtyInspectOutputs['a-grade'] +
                qtyInspectOutputs['r-grade'] +
                qtyInspectOutputs['b-grade'] +
                qtyInspectOutputs['c-grade'];

    // Update tampilan output total qty inspect
    document.getElementById('qtyInspectOutput').textContent = total;

    // Perbarui variabel global totalInspected
    totalInspected = total;

    // Panggil updateFTT() setiap kali total qty inspect berubah
    updateFTT();
    updateRedoRate(); // Perbarui Redo Rate
}

// =============================
// 16. Logika Kontrol Tombol Berdasarkan Grade
// =============================

// Fungsi untuk mengaktifkan atau menonaktifkan tombol berdasarkan kategori
function toggleButtonState(state) {
    const reworkButtons = document.querySelectorAll('.rework-button');
    const defectButtons = document.querySelectorAll('.defect-button');

    reworkButtons.forEach(button => {
        button.disabled = state;
        button.classList.toggle('inactive', state);
    });

    defectButtons.forEach(button => {
        button.disabled = state;
        button.classList.toggle('inactive', state);
    });
}

// Fungsi untuk mengelola status tombol berdasarkan kategori yang dipilih
function handleGradeSelection(gradeCategory) {
    const gradeButtons = document.querySelectorAll('.input-button');
    let enableReworkAndDefects = false; // Defaultnya nonaktif

    // Hapus status aktif dari semua tombol grade terlebih dahulu
    gradeButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Aktifkan tombol grade yang dipilih
    const selectedButton = document.querySelector(`.${gradeCategory}`);
    if (selectedButton) {
        selectedButton.classList.add('active'); // Menandai tombol yang dipilih

        // MODIFIKASI - PART CODE 16: Hanya aktifkan rework dan defect jika R, B, atau C grade dipilih
        if (gradeCategory === 'r-grade' || gradeCategory === 'b-grade' || gradeCategory === 'c-grade') {
            enableReworkAndDefects = true;
        }
    }

    // Terapkan status aktif/nonaktif ke tombol rework dan defect
    // Jika enableReworkAndDefects true (R/B/C dipilih), maka state untuk toggleButtonState adalah false (aktifkan)
    // Jika enableReworkAndDefects false (A atau tidak ada yg dipilih), maka state untuk toggleButtonState adalah true (nonaktifkan)
    toggleButtonState(!enableReworkAndDefects);
}

// Setup event listener untuk memilih grade
document.querySelectorAll('.input-button').forEach(button => {
    button.addEventListener('click', (event) => {
        let targetButton = event.target;
        // Pastikan target adalah tombol itu sendiri, bukan elemen anak di dalamnya (jika ada)
        while (targetButton && !targetButton.classList.contains('input-button')) {
            targetButton = targetButton.parentElement;
        }

        if (targetButton) {
            const gradeCategory = targetButton.classList[1]; // Mengambil kelas kategori (a-grade, r-grade, b-grade, c-grade)
            if (gradeCategory) { // Pastikan gradeCategory ada
                handleGradeSelection(gradeCategory); // Proses pemilihan grade
            } else {
                console.warn("Grade category class (e.g., a-grade) not found on button:", targetButton);
            }
        }
    });
});

// =============================
// 17. Redo Rate
// =============================

// Fungsi untuk menghitung dan menampilkan Redo Rate
function updateRedoRate() {
    const redoRateOutput = document.getElementById('redoRateOutput');
    // Hitung total rework dengan rumus yang benar
    const totalRework = ((totalReworkLeft + totalReworkRight) / 2) + totalReworkPairs;
    const redoRateValue = totalInspected !== 0 ? (totalRework / totalInspected) * 100 : 0;
    redoRateOutput.textContent = `${redoRateValue.toFixed(2)}%`;
}


// =============================
// 18. Announcement Logic
// =============================

const announcements = [
    { date: "2024-10-26", text: "info a" },
    { date: "2024-10-27", text: "info b" },
    { date: "2024-10-27", text: "info c" },
    { date: "2024-10-28", text: "info d" },
     { date: "2024-11-01", text: "info e" },
     { date: "2024-11-02", text: "info f" },
    { date: "2024-11-04", text: "info g" }
];

let currentAnnouncementIndex = 0;
let viewedAnnouncements = JSON.parse(localStorage.getItem('viewedAnnouncements')) || [];

function showAnnouncement(index) {
    const popup = document.getElementById('announcement-popup');
    const dateElement = document.getElementById('date-text');
    const textElement = document.getElementById('announcement-text');

    dateElement.textContent = announcements[index].date;
    textElement.textContent = announcements[index].text;
    popup.style.display = 'block';

    // Tambahkan pengumuman ke daftar yang sudah dilihat
    if (!viewedAnnouncements.includes(announcements[index].date)) {
        viewedAnnouncements.push(announcements[index].date);
        localStorage.setItem('viewedAnnouncements', JSON.stringify(viewedAnnouncements));
    }
}

function closeAnnouncement() {
    document.getElementById('announcement-popup').style.display = 'none';
}

function nextAnnouncement() {
    currentAnnouncementIndex = (currentAnnouncementIndex + 1) % announcements.length;
    showAnnouncement(currentAnnouncementIndex);
}

function prevAnnouncement() {
    currentAnnouncementIndex = (currentAnnouncementIndex - 1 + announcements.length) % announcements.length;
    showAnnouncement(currentAnnouncementIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    const announcementButton = document.getElementById('announcement-button');
    const closeButton = document.querySelector('.close-button');
    const prevButton = document.getElementById('prev-announcement');
    const nextButton = document.getElementById('next-announcement');

    announcementButton.addEventListener('click', () => {
        showAnnouncement(currentAnnouncementIndex);
    });

    closeButton.addEventListener('click', closeAnnouncement);
    prevButton.addEventListener('click', prevAnnouncement);
    nextButton.addEventListener('click', nextAnnouncement);

    // Tampilkan pengumuman baru yang belum dilihat
    for (let i = 0; i < announcements.length; i++) {
        if (!viewedAnnouncements.includes(announcements[i].date)) {
            showAnnouncement(i);
            return; // Hentikan loop setelah menemukan pengumuman baru
        }
    }
});
// ... JavaScript sebelumnya ...

// =============================
// 19. Qty Sample Set Logic
// =============================
const qtySampleSetInput = document.getElementById('qty-sample-set');
let qtySampleSetValue = parseInt(localStorage.getItem('qtySampleSet')) || 0; // Ambil dari localStorage atau default 0

// Set nilai awal qty sample set dari localStorage
qtySampleSetInput.value = qtySampleSetValue;

// Update qtySampleSetValue saat input berubah
qtySampleSetInput.addEventListener('change', () => {
    qtySampleSetValue = parseInt(qtySampleSetInput.value) || 0;
    localStorage.setItem('qtySampleSet', qtySampleSetValue); // Simpan ke localStorage
});

// Fungsi untuk validasi qty inspect terhadap qty sample set
function validateQtySampleSet() {
    const totalQtyInspect = qtyInspectOutputs['a-grade'] + qtyInspectOutputs['r-grade'] + qtyInspectOutputs['b-grade'] + qtyInspectOutputs['c-grade'];

    if (totalQtyInspect !== qtySampleSetValue) {
        alert(`Jumlah total Qty Inspect (${totalQtyInspect}) harus sama dengan Qty Sample Set (${qtySampleSetValue}).`);
        return false;
    }

    return true;
}
