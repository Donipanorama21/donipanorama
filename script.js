// ===================== KONFIGURASI =====================
// PASTIKAN SCRIPT_URL INI ADALAH URL DEPLOYMENT APPS SCRIPT ANDA YANG TERBARU!
// URL ini diambil dari gambar Deployment ID Anda.
const SCRIPT_URL ="https://script.google.com/macros/s/AKfycbyavcOwzUMjya6kIP-E7K88t0ZO23qMl4lzpEZ2lEe2N0QqT_qrj5mNs0iG4199K-jr/exec"; 

// ===================== ELEMENT =====================
const kelasSelect = document.getElementById("kelas");
const daftarSiswaDiv = document.getElementById("daftarSiswa");
const tabelBody = document.getElementById("tabelBody");
const formAbsensi = document.getElementById("formAbsensi");
const tanggalInput = document.getElementById("tanggal");

// Elemen Tombol Nilai
const toggleNilaiBtn = document.getElementById("toggleNilaiBtn");
const nilaiFormSection = document.getElementById("rekap-nilai");
const nilaiForm = document.getElementById("nilaiForm");
const kelasNilaiSelect = document.getElementById("kelasNilai");
const namaSiswaNilaiSelect = document.getElementById("namaSiswaNilai");
const nilaiUHInput = document.getElementById("nilaiUH"); 
const nilaiTugasInput = document.getElementById("nilaiTugas"); 
const nilaiUTSInput = document.getElementById("nilaiUTS"); 
const nilaiUASInput = document.getElementById("nilaiUAS"); 

// Elemen Tombol Rekap & Download
const btn1Bulan = document.getElementById("rekapBulan");
const btn3Bulan = document.getElementById("rekap3Bulan");
const btn6Bulan = document.getElementById("rekap6Bulan");
const rekapContainer = document.getElementById("rekapContainer");
const rekapSection = document.getElementById("rekapSection");
const btnDownloadExcel = document.getElementById("btnDownloadRekap"); 

// Elemen Data Siswa (Filter & Detail)
const toggleDataSiswaBtn = document.getElementById("toggleDataSiswaBtn");
const dataSiswaSection = document.getElementById("data-siswa-rekap");
const formFilterRekap = document.getElementById("formFilterRekap");
const filterKelasSelect = document.getElementById("filterKelas");
const filterNamaSelect = document.getElementById("filterNama"); 
const filterMapelSelect = document.getElementById("filterMapel");
const filterGuruSelect = document.getElementById("filterGuru");
const filterTahunSelect = document.getElementById("filterTahun"); 
const filterBulanSelect = document.getElementById("filterBulan");
const filterSemesterSelect = document.getElementById("filterSemester");

// Elemen Tampilan Detail Siswa
const detailSiswaContainer = document.getElementById("detailSiswaContainer");

let dataSiswaAbsensi = []; 

// ===================== FUNGSI UTILITY =====================

/**
 * Menampilkan pesan notifikasi sementara (Toast)
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn("Element 'toast' tidak ditemukan di DOM!");
        alert(message);
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================== LOAD DATA SISWA (ABSENSI) - TIDAK ADA PERUBAHAN FUNGSI =====================
/**
 * Memuat data siswa menggunakan XMLHttpRequest (XHR).
 */
function loadSiswa(kelas) {
    if (!kelas) {
        daftarSiswaDiv.classList.add("hidden");
        tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Pilih kelas terlebih dahulu...</td></tr>`;
        return;
    }

    tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Memuat data siswa...</td></tr>`;
    daftarSiswaDiv.classList.remove("hidden");
    
    const timestamp = new Date().getTime();
    const url = `${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(kelas)}&_=${timestamp}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const json = JSON.parse(xhr.responseText);
                
                let siswaData = json.data || [];

                if (json.status === 'error' || siswaData.length === 0) {
                    // Menampilkan pesan error atau tidak ditemukan
                    tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Data siswa tidak ditemukan atau Server Error: ${json.message || 'Data kosong.'}</td></tr>`;
                    showToast(`⚠️ Data siswa tidak ditemukan atau ada error Server: ${json.message || ''}`);
                    return;
                }

                dataSiswaAbsensi = siswaData; 
                renderTabelSiswa(siswaData);

            } catch (e) {
                console.error("JSON Parse Error:", e, xhr.responseText);
                tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Gagal memproses data! Cek Log Apps Script.</td></tr>`;
                showToast("❌ Gagal memproses data! Cek Log Apps Script.");
            }
        } else {
            console.error("HTTP Status Error:", xhr.status, xhr.responseText);
            tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Koneksi gagal! (Status: ${xhr.status})</td></tr>`;
            showToast(`❌ Koneksi Gagal! Status HTTP: ${xhr.status}`);
        }
    };
    
    xhr.onerror = function() {
        console.error("XHR Network Error: Failed to connect.");
        tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Gagal terhubung ke Server! (Network Error)</td></tr>`;
        showToast("❌ Koneksi Gagal Total! Pastikan URL dan Izin Deploy sudah benar.");
    };

    xhr.send();
}

function renderTabelSiswa(data) {
    tabelBody.innerHTML = "";
    data.forEach((s, i) => {
        const nama = s.nama || `Siswa ${i + 1}`;
        const jk = s.jk || "-";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${nama}</td>
            <td>${jk}</td>
            <td>
                <select name="kehadiran" data-nama="${nama}">
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpha">Alpha</option>
                </select>
            </td>
        `;
        tabelBody.appendChild(tr);
    });
}

kelasSelect.addEventListener("change", (e) => loadSiswa(e.target.value));

// ===================== SIMPAN ABSENSI - TIDAK ADA PERUBAHAN FUNGSI =====================
formAbsensi.addEventListener("submit", (e) => {
    e.preventDefault();

    const kelas = kelasSelect.value;
    const tanggal = tanggalInput.value;
    const mapel = document.getElementById("mapel").value;
    const guru = document.getElementById("guru").value;

    if (!kelas || !tanggal || !mapel || !guru) {
        showToast("⚠️ Harap lengkapi Kelas, Tanggal, Mapel, dan Guru!");
        return;
    }

    const absensiData = [];
    document.querySelectorAll('#tabelBody select[name="kehadiran"]').forEach(select => {
        absensiData.push({
            nama: select.dataset.nama,
            kehadiran: select.value
        });
    });

    if (absensiData.length === 0) {
        showToast("⚠️ Daftar siswa kosong. Pilih kelas terlebih dahulu.");
        return;
    }
    
    showToast("🔄 Mengirim data absensi...");

    const payload = {
        action: "simpanAbsensi",
        kelas: kelas,
        tanggal: tanggal,
        mapel: mapel,
        guru: guru,
        absensi: absensiData 
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', SCRIPT_URL);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const result = JSON.parse(xhr.responseText);
                
                if (result.status === "success") {
                    showToast(`✅ ${result.message || "Data absensi berhasil disimpan!"}`);
                    
                    formAbsensi.reset(); 
                    daftarSiswaDiv.classList.add("hidden"); 
                    tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Pilih kelas terlebih dahulu...</td></tr>`;
                    kelasSelect.selectedIndex = 0;
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                } else {
                    showToast(`❌ Gagal Simpan Absensi: ${result.message || "Kesalahan tak terduga"}`);
                }
            } catch (e) {
                console.error("JSON Parse Error:", e, xhr.responseText);
                showToast("❌ Gagal memproses respons server (JSON Error).");
            }
        } else {
            console.error("HTTP Status Error:", xhr.status, xhr.responseText);
            showToast(`❌ Koneksi Gagal! Status HTTP: ${xhr.status}`);
        }
    };
    
    xhr.onerror = function() {
        showToast("❌ Koneksi Gagal Total! (Network Error).");
    };

    xhr.send(JSON.stringify(payload));
});


// ===================== FORM NILAI & SIMPAN NILAI - TIDAK ADA PERUBAHAN FUNGSI =====================
toggleNilaiBtn.addEventListener("click", () => {
    nilaiFormSection.classList.toggle("hidden");
    toggleNilaiBtn.textContent = nilaiFormSection.classList.contains("hidden")
        ? "🎓 Input Form Nilai"
        : "Tutup Form Nilai";
    dataSiswaSection.classList.add("hidden");
    detailSiswaContainer.classList.add("hidden");
    toggleDataSiswaBtn.textContent = "🔍 Data Siswa";
});

kelasNilaiSelect.addEventListener("change", async (e) => {
    const kelas = e.target.value;
    namaSiswaNilaiSelect.innerHTML = `<option value="">-- Pilih Nama Siswa --</option>`;
    if (!kelas) return;

    namaSiswaNilaiSelect.innerHTML = `<option value="">Memuat...</option>`;
    
    const timestamp = new Date().getTime();
    const url = `${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(kelas)}&_=${timestamp}`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        let siswaList = json.data || [];

        namaSiswaNilaiSelect.innerHTML = `<option value="">-- Pilih Nama Siswa --</option>`;
        if (siswaList.length === 0) {
            namaSiswaNilaiSelect.innerHTML = `<option value="">Tidak ada siswa ditemukan</option>`;
            return;
        }

        siswaList.forEach((s) => {
            const nama = s.nama || s[0];
            if (nama) {
                namaSiswaNilaiSelect.innerHTML += `<option value="${nama}">${nama}</option>`;
            }
        });
    } catch (err) {
        showToast("Gagal memuat daftar siswa nilai!");
        namaSiswaNilaiSelect.innerHTML = `<option value="">Gagal memuat siswa</option>`;
    }
});

nilaiForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const kelas = kelasNilaiSelect.value;
    const nama = namaSiswaNilaiSelect.value;
    const nilaiUH = nilaiUHInput.value; 
    const nilaiTugas = nilaiTugasInput.value;
    const nilaiUTS = nilaiUTSInput.value;
    const nilaiUAS = nilaiUASInput.value;

    if (!kelas || !nama || !nilaiUH || !nilaiTugas || !nilaiUTS || !nilaiUAS) {
        showToast("⚠️ Harap lengkapi semua data nilai dan siswa.");
        return;
    }

    if (isNaN(nilaiUH) || isNaN(nilaiTugas) || isNaN(nilaiUTS) || isNaN(nilaiUAS)) {
        showToast("⚠️ Nilai harus berupa angka yang valid.");
        return;
    }
    
    showToast("🔄 Mengirim data nilai...");

    const payload = {
        action: "simpanNilai",
        kelas: kelas,
        nama: nama,
        nilaiUH: nilaiUH,
        nilaiTugas: nilaiTugas,
        nilaiUTS: nilaiUTS,
        nilaiUAS: nilaiUAS
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', SCRIPT_URL);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const result = JSON.parse(xhr.responseText);
                
                if (result.status === "success") {
                    showToast(`✅ ${result.message || "Data nilai berhasil disimpan!"}`);
                    
                    nilaiForm.reset();
                    toggleNilaiBtn.click(); 
                    namaSiswaNilaiSelect.innerHTML = `<option value="">-- Pilih Nama Siswa --</option>`;
                    
                } else {
                    showToast(`❌ Gagal Simpan Nilai: ${result.message || "Kesalahan tak terduga"}`);
                }
            } catch (e) {
                console.error("JSON Parse Error:", e, xhr.responseText);
                showToast("❌ Gagal memproses respons server (JSON Error).");
            }
        } else {
            console.error("HTTP Status Error:", xhr.status, xhr.responseText);
            showToast(`❌ Koneksi Gagal! Status HTTP: ${xhr.status}`);
        }
    };
    
    xhr.onerror = function() {
        showToast("❌ Koneksi Gagal Total! (Network Error).");
    };

    xhr.send(JSON.stringify(payload));
});

// ===================== FUNGSI REKAP/FILTER - TIDAK ADA PERUBAHAN FUNGSI =====================
toggleDataSiswaBtn.addEventListener("click", () => {
    dataSiswaSection.classList.toggle("hidden");
    toggleDataSiswaBtn.textContent = dataSiswaSection.classList.contains("hidden")
        ? "🔍 Data Siswa"
        : "Tutup Filter Siswa";
    
    nilaiFormSection.classList.add("hidden");
    toggleNilaiBtn.textContent = "🎓 Input Form Nilai";
    detailSiswaContainer.classList.add("hidden");
    
    if (!dataSiswaSection.classList.contains("hidden")) {
        populateFilterOptions();
    }
});

filterKelasSelect.addEventListener("change", async (e) => {
    const kelas = e.target.value;
    filterNamaSelect.innerHTML = `<option value="">Semua Siswa</option>`;
    if (!kelas) return;

    filterNamaSelect.innerHTML = `<option value="">Memuat Siswa...</option>`;
    
    const timestamp = new Date().getTime();
    const url = `${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(kelas)}&_=${timestamp}`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        let siswaList = json.data || [];

        filterNamaSelect.innerHTML = `<option value="">Semua Siswa</option>`;
        siswaList.forEach((s) => {
            const nama = s.nama || s[0];
            if (nama) {
                filterNamaSelect.innerHTML += `<option value="${nama}">${nama}</option>`;
            }
        });
    } catch (err) {
        showToast("Gagal memuat daftar siswa filter!");
        filterNamaSelect.innerHTML = `<option value="">Gagal memuat siswa</option>`;
    }
});

function populateFilterOptions() {
    const currentYear = new Date().getFullYear();
    filterTahunSelect.innerHTML = `<option value="">Semua Tahun</option>`;
    for (let i = 0; i < 5; i++) { 
        const year = currentYear - i;
        filterTahunSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    filterBulanSelect.innerHTML = `<option value="">Semua Bulan</option>`;
    monthNames.forEach((name, index) => {
        filterBulanSelect.innerHTML += `<option value="${index + 1}">${name}</option>`;
    });

    filterSemesterSelect.innerHTML = `<option value="">Semua Semester</option>`;
    filterSemesterSelect.innerHTML += `<option value="Ganjil">Ganjil</option>`;
    filterSemesterSelect.innerHTML += `<option value="Genap">Genap</option>`;
}

formFilterRekap.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formFilterRekap);
    const params = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }
    
    if (params.get('filterNama') && params.get('filterKelas') && params.size === 2) {
        await displaySiswaDetail(params.get('filterNama'), params.get('filterKelas'));
    } else {
        await loadRekap(12, params.toString()); 
    }
    
    dataSiswaSection.classList.add("hidden"); 
    toggleDataSiswaBtn.textContent = "🔍 Data Siswa";
});

async function loadRekap(bulan, filterParams = "") {
    try {
        rekapContainer.innerHTML = `<p class="loading-message">Sedang memuat data rekap...</p>`;
        detailSiswaContainer.classList.add("hidden"); 
        if (btnDownloadExcel) btnDownloadExcel.classList.add("hidden"); 
        
        const timestamp = new Date().getTime();
        const url = `${SCRIPT_URL}?action=getRekap&bulan=${bulan}${filterParams ? '&' + filterParams : ''}&_=${timestamp}`;

        const res = await fetch(url);
        const json = await res.json();
        
        if (json.status === "success" && Array.isArray(json.data) && json.data.length > 0) {
            renderRekap(json.data);
            if (btnDownloadExcel) btnDownloadExcel.classList.remove("hidden"); 
            rekapSection.scrollIntoView({ behavior: 'smooth' }); 
            showToast("✅ Rekap data berhasil dimuat!");
        } else {
            rekapContainer.innerHTML = "<p class='error-message'>Tidak ada data ditemukan untuk filter yang dipilih.</p>";
            showToast("⚠️ Tidak ada data ditemukan!");
        }
    } catch {
        rekapContainer.innerHTML = "<p class='error-message'>❌ Gagal memuat rekap! Cek koneksi atau URL Apps Script.</p>";
        showToast("❌ Gagal memuat rekap!");
    }
}

function renderRekap(data) {
    let html = `
        <div class="rekap-header">
            <h2>📊 Hasil Rekap Data Siswa</h2>
        </div>
        <table class="rekap-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Hadir</th>
                    <th>Sakit</th>
                    <th>Izin</th>
                    <th>Alpha</th>
                    <th>% Hadir</th>
                    <th>Nilai Akhir</th>
                </tr>
            </thead>
            <tbody>`;

    data.forEach((s, i) => {
        const total = s.hadir + s.sakit + s.izin + s.alpha;
        const persen = total ? ((s.hadir / total) * 100).toFixed(1) + "%" : "0.0%";
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${s.nama}</td>
                <td>${s.kelas || '-'}</td>
                <td>${s.hadir}</td>
                <td>${s.sakit}</td>
                <td>${s.izin}</td>
                <td>${s.alpha}</td>
                <td>${persen}</td>
                <td>${s.nilaiAkhir || '-'}</td>
            </tr>`;
    });

    html += "</tbody></table>";
    rekapContainer.innerHTML = html;
}

btn1Bulan.addEventListener("click", () => loadRekap(1));
btn3Bulan.addEventListener("click", () => loadRekap(3));
btn6Bulan.addEventListener("click", () => loadRekap(6));

if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener("click", async () => {
        showToast("Memulai proses download... Mohon tunggu.");
        try {
            window.open(`${SCRIPT_URL}?action=downloadRekapFixed`, '_blank');
            showToast("✅ Download dimulai! Cek folder Unduhan Anda.");
        } catch (err) {
            console.error(err);
            showToast("❌ Gagal memulai download. Cek izin Apps Script.");
        }
    });
}

async function displaySiswaDetail(nama, kelas) {
    // ... (Fungsi ini tidak berubah) ...
}

function renderSiswaDetail(data) {
    // ... (Fungsi ini tidak berubah) ...
}