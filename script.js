// =============================
// 1. Variabel Global
// =============================
let totalInspected = 0; // Total barang yang diinspeksi
let totalReworkLeft = 0; // Total rework kiri
let totalReworkRight = 0; // Total rework kanan
let isAdding = false; // Flag untuk menandakan mode penambahan
let isSubtracting = false; // Flag untuk menandakan mode pengurangan

// Elemen DOM
const fttOutput = document.getElementById('fttOutput');
const qtyInspectOutput = document.getElementById('qtyInspectOutput');
const leftCounter = document.getElementById('left-counter');
const rightCounter = document.getElementById('right-counter');

// =============================
// 2. Event Listener untuk Qty Inspect
// =============================
const qtyInspectButton = document.querySelector('.input-button');
qtyInspectButton.addEventListener('click', () => {
    // Pilih mode A-Grade
    updateQuantity('qtyInspectOutput', 1); // Tambah Qty Inspect
    updateFTT(); // Perbarui FTT
});

// =============================
// 3. Event Listener untuk Rework
// =============================
const reworkLeftButton = document.getElementById('rework-left');
reworkLeftButton.addEventListener('click', () => {
    updateQuantity('left-counter', 1); // Tambah Rework Kiri
    updateFTT(); // Perbarui FTT
});

const reworkRightButton = document.getElementById('rework-right');
reworkRightButton.addEventListener('click', () => {
    updateQuantity('right-counter', 1); // Tambah Rework Kanan
    updateFTT(); // Perbarui FTT
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
    const averageRework = (totalReworkLeft + totalReworkRight) / 2;
    const fttValue = ((totalInspected - averageRework) / totalInspected) * 100;
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
    plusButton.classList.add('active');
    minusButton.classList.add('inactive');
});

// =============================
// 8. Inisialisasi Aplikasi
// =============================
function init() {
    setupDefectButtons(); // Setup defect buttons
    setupQuantityButtons(); // Setup quantity buttons
}

// Tunggu hingga DOM dimuat sebelum menginisialisasi
document.addEventListener('DOMContentLoaded', init);

// =============================
// 9. Setup Quantity Buttons
// =============================
function setupQuantityButtons() {
    // Qty Inspect
    document.getElementById('plus-qty').addEventListener('click', function() {
        updateQuantity('qtyInspectOutput', 1);
    });

    document.getElementById('minus-qty').addEventListener('click', function() {
        updateQuantity('qtyInspectOutput', -1);
    });

    // Rework Kiri
    document.getElementById('plus-rework-kiri').addEventListener('click', function() {
        updateQuantity('left-counter', 1);
    });

    document.getElementById('minus-rework-kiri').addEventListener('click', function() {
        updateQuantity('left-counter', -1);
    });

    // Rework Kanan
    document.getElementById('plus-rework-kanan').addEventListener('click', function() {
        updateQuantity('right-counter', 1);
    });
    document.getElementById('minus-rework-kanan').addEventListener('click', function() {
        updateQuantity('right-counter', -1);
    });
}

// =============================
// 10. Kirim Data ke Google Sheets via Web App & Validasi Total Defect dan Total Rework Sebelum SIMPAN
// =============================
document.querySelector(".save-button").addEventListener("click", async () => {
  // Panggil fungsi validasi sebelum melanjutkan
  if (!validateInputs() || !validateDefects()) {
    return; // Jika validasi gagal, hentikan proses
  }

  // Hitung total defect dari summary defect
  const totalDefect = Object.values(defectCounts).reduce((acc, count) => acc + count, 0);

  // Hitung total rework (kiri + kanan)
  const totalRework = (totalReworkLeft + totalReworkRight)/2;

  // Cek apakah total defect lebih rendah dari total rework
  if (totalDefect < totalRework) {
    alert("Total defect tidak boleh lebih rendah dari total rework. Data tidak dapat disimpan.");
    return;
  }

  const fttElement = document.getElementById("fttOutput");
  const fttRaw = fttElement ? fttElement.innerText.replace("%", "").trim() : "0";
  const ftt = parseFloat(fttRaw) / 100; // Konversi ke desimal

  if (isNaN(ftt)) {
    alert("FTT value is invalid!");
    return;
  }

  const summaryItems = document.querySelectorAll(".summary-item");
  const defects = Array.from(summaryItems).map(item => {
    const [type, count] = item.textContent.split(":");
    return { type: type.trim(), count: parseInt(count.trim(), 10) };
  });

  console.log("Defects array: ", defects);

  const data = {
    auditor: document.getElementById("auditor").value,
    ncvs: document.getElementById("ncvs").value,
    modelName: document.getElementById("model-name").value,
    styleNumber: document.getElementById("style-number").value,
    ftt,
    qtyInspect: parseInt(document.getElementById("qtyInspectOutput").innerText, 10),
    reworkKanan: parseInt(document.getElementById("right-counter").innerText, 10),
    reworkKiri: parseInt(document.getElementById("left-counter").innerText, 10),
    defects,
  };

  try {
    // Nonaktifkan tombol simpan untuk mencegah multiple submission
    const saveButton = document.querySelector(".save-button");
    saveButton.disabled = true;

    const response = await fetch("https://script.google.com/macros/s/AKfycbynXvd96pVNY53rEfPjoYAGDhLyF3SBh68GIHKYOtuW5hrTVZPkOFC3AGpQGyRRVd5OVw/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.text();
    alert(result);

    // Reset all fields after successful save
    resetAllFields();
  } catch (error) {
    alert("Terjadi kesalahan saat menyimpan data.");
    console.error(error);
  } finally {
    // Aktifkan kembali tombol simpan setelah proses selesai
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
  document.getElementById("fttOutput").textContent = "0%";

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
  const styleNumber = document.getElementById("style-number").value.trim();

  // Cek apakah ada input yang kosong
  if (!auditor || !ncvs || !modelName || !styleNumber) {
    alert("Harap isi semua input sebelum menyimpan data!");
    return false; // Validasi gagal
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
// 14. Update Fungsi updateQuantity
// =============================
function updateQuantity(counterId, change) {
    const counterElement = document.getElementById(counterId);
    let currentValue = parseInt(counterElement.textContent) || 0;

    if (isAdding) {
        currentValue++;
    } else if (isSubtracting) {
        currentValue--;
    }

    if (currentValue < 0) {
        currentValue = 0;
    }

    counterElement.textContent = currentValue;
    updateTotalQty();
}

// =============================
// 15. Update Fungsi updateTotalQty
// =============================
function updateTotalQty() {
    const aGrade = parseInt(document.getElementById("a-grade-count").textContent) || 0;
    const rework = parseInt(document.getElementById("rework-count").textContent) || 0;
    const bGrade = parseInt(document.getElementById("b-grade-count").textContent) || 0;
    const cGrade = parseInt(document.getElementById("c-grade-count").textContent) || 0;

    totalInspected = aGrade + rework + bGrade + cGrade;
    document.getElementById("qtyInspectOutput").textContent = totalInspected;
    updateFTT();
}

// =============================
// 16. Fungsi Menangani Defect Kanan & Kiri untuk Rework, B-Grade, C-Grade
// =============================
function handleDefectForCategory(category, defectSide) {
    const defectSideElement = document.getElementById(`${category}-${defectSide}-count`);
    let defectSideCount = parseInt(defectSideElement.textContent) || 0;

    if (isAdding) {
        defectSideCount++;
    } else if (isSubtracting) {
        defectSideCount--;
    }

    if (defectSideCount < 0) {
        defectSideCount = 0;
    }

    defectSideElement.textContent = defectSideCount;
    updateDefectSummary();
}

// =============================
// 17. Fungsi Memperbarui Summary Defect
// =============================
function updateDefectSummary() {
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = '';

    for (const [defect, count] of Object.entries(defectCounts)) {
        if (count !== 0) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.textContent = `${defect}: ${count}`;
            summaryList.appendChild(summaryItem);
        }
    }
}
