// Mengambil elemen tombol 'Next' dari DOM menggunakan class 'btn-next'
const nextButton = document.querySelector(".btn-next");

// Mengambil elemen tombol 'Previous' dari DOM menggunakan class 'btn-prev'
const prevButton = document.querySelector(".btn-prev");

// Mengambil elemen tombol 'Submit' dari DOM menggunakan class 'btn-submitt'
const submitButton = document.querySelector(".btn-submitt");

// Mengambil elemen tombol 'Home' dari DOM menggunakan class 'btn-submit-Beranda'
const homeButton = document.querySelector(".btn-submit-Beranda");
const fiturButton = document.querySelector(".btn-fitur");
const editButton = document.querySelector(".btn-Edit");

// Mengambil semua elemen dengan class 'step' (digunakan untuk indikator progress)
const steps = document.querySelectorAll(".step");

// Mengambil semua elemen form-step (bagian-bagian form yang akan ditampilkan/disembunyikan)
const form_step = document.querySelectorAll(".form-step");

// Mengambil elemen menu icon untuk tampilan mobile
let menu = document.querySelector("#menu-icon");

// Mengambil elemen navigasi list untuk tampilan mobile
let navlist = document.querySelector(".navlist");

// Store recommendation result values separately
let recommendationMinValue, recommendationMaxValue;

// Variabel untuk menyimpan hasil perkalian
let recommendationMinMonthlyPremium, recommendationMaxMonthlyPremium;

// Menghilangkan tanda baca rupiah
function extractNumericValue(premi_str) {
  cleaned = premi_str.replace('Rp', '').replace('.', '').replace('.', '');
  return parseFloat(cleaned);
}

// --------- PENGISIAN FORM --------- //
// Variable untuk melacak halaman form yang aktif saat ini (dimulai dari 1)
let active = 1;

// --------- PENGISIAN FORM --------- //
// Objek untuk menyimpan semua data form yang diinput user
let formData = {
  jenisKelamin: "",        // Menyimpan jenis kelamin yang dipilih
  usia: "",                // Menyimpan usia yang dipilih
  pekerjaan: "",           // Menyimpan pekerjaan yang dipilih
  sumberDana: "",          // Menyimpan sumber dana utama
  sumberDanaTambahan: "",  // Menyimpan sumber dana tambahan
  masaPertanggungan: "",   // Menyimpan jumlah masa pertanggungan yang dipilih
  penghasilanBersih: "",   // Menyimpan range penghasilan bersih
  tujuan: "",              // Menyimpan tujuan investasi
  jenisDeposito: "",       // Menyimpan jenis deposito yang dipilih
};

// --------- VALIDASI INPUT --------- //
// Fungsi untuk memeriksa apakah semua field di form kedua sudah diisi
function isFormTwoFilled() {
  // Mengembalikan true jika semua field memiliki nilai, false jika ada yang kosong
  return (
      formData.masaPertanggungan !== ""   // Cek premi terisi
  );
}

// Fungsi untuk menampilkan suku bunga persentase
function displayPersentaseBunga(sukuBungaValue) {
  const persentaseBungaElement = document.getElementById("persentaseBungaResult");
  persentaseBungaElement.textContent = `${sukuBungaValue}%`;
}

// --------- NAVIGASI FORM --------- //
// Event handler untuk menu icon di tampilan mobile
menu.onclick = () => {
  // Toggle class 'bx-x' pada menu icon (mengubah icon)
  menu.classList.toggle("bx-x");
  // Toggle class 'open' pada navlist (membuka/menutup menu)
  navlist.classList.toggle("open");
};

// --------- NAVIGASI FORM --------- //
// Event listener untuk tombol Next
nextButton.addEventListener("click", () => {
  // Jika berada di halaman pertama, cek apakah semua field sudah diisi
  if (active === 1 && !isFormOneFilled()) {
      alert("Harap isi semua bagian pada halaman ini sebelum melanjutkan.");
      return;
  }
  // Increment halaman aktif
  active++;
  // Pastikan tidak melebihi jumlah total langkah
  if (active > steps.length) {
      active = steps.length;
  }
  // Update tampilan progress
  updateProgress();
});

// --------- NAVIGASI FORM --------- //
// Event listener untuk tombol Previous
prevButton.addEventListener("click", () => {
  // Redirect ke halaman MasaPertanggungan.html dengan state=2
  window.location.href = "Premi.html?state=1";
});

// Check if page is being reloaded and redirect
window.onload = function() {
  // Check if the page is being reloaded (not first visit)
  if (performance.navigation.type === 1) {
      // Redirect to Program.html
      window.location.href = 'Program.html';
  }
};

// Event listener untuk "Pilih fitur lain" button
fiturButton.addEventListener("click", () => {
  // Redirect ke halaman Daftar.html dengan state=3
  window.location.href = "Daftar.html?state=3";
});

// --------- NAVIGASI FORM --------- //
// Event listener untuk tombol Home
homeButton.addEventListener("click", () => {
  // Redirect ke halaman Program.html
  window.location.href = "Program.html";
});

// Modifikasi event listener edit button
editButton.addEventListener("click", () => {
  window.location.href = "Daftar.html?edit=true";
});

// --------- NAVIGASI FORM --------- //
// Fungsi untuk memperbarui tampilan progress dan tombol navigasi
// mengupdate tampilan visual untuk menunjukkan di halaman mana user berada saat ini
const updateProgress = () => {
  // Update setiap langkah progress
  steps.forEach((step, i) => {
      if (i == active - 1) {
          // Tambahkan class 'active' pada langkah saat ini
          step.classList.add("active");
          form_step[i].classList.add("active");
      } else {
          // Hapus class 'active' dari langkah lainnya
          step.classList.remove("active");
          form_step[i].classList.remove("active");
      }
  });

  if (active === 2) {
    prevButton.style.display = "inline-block"; // Sembunyikan tombol Kembali
    nextButton.style.display = "none"; // Sembunyikan tombol Selanjutnya
    submitButton.style.display = "none"; // Tampilkan tombol Kirim
    fiturButton.style.display = "inline-block"; // Tampilkan tombol Kirim
    homeButton.style.display = "inline-block"; // Tampilkan tombol Kembali ke Beranda
    editButton.style.display = "inline-block";
  } else {
    prevButton.style.display = "none"; // Tampilkan tombol Kembali
    nextButton.style.display = "none"; // Tampilkan tombol Selanjutnya
    submitButton.style.display = "inline-block"; // Sembunyikan tombol Kirim
    fiturButton.style.display = "inline-block"; // Tampilkan tombol Kirim
    homeButton.style.display = "none"; // Sembunyikan tombol Kembali ke Beranda
    editButton.style.display = "inline-block";
  }
};

// Event listener yang akan dijalankan ketika DOM selesai dimuat sepenuhnya
document.addEventListener("DOMContentLoaded", () => {
  
  // Membuat instance URLSearchParams untuk mengambil parameter dari URL saat ini
  // window.location.search mengambil string query dari URL (bagian setelah '?')
  const urlParams = new URLSearchParams(window.location.search);
  
  // Mengambil nilai parameter 'state' dari URL
  // Contoh URL: example.com/page.html?state=2
  // urlParams.get('state') akan mengembalikan "2"
  const stateParam = urlParams.get('state');
  
  // Mengambil nilai parameter 'active' dari URL
  // Contoh URL: example.com/page.html?active=1
  // urlParams.get('active') akan mengembalikan "1"
  const activeParam = urlParams.get('active');
  
  // Memeriksa apakah ada parameter 'state' atau 'active' di URL
  if (stateParam || activeParam) {
    // Mengonversi nilai parameter (string) menjadi number menggunakan parseInt
    // Operator || (OR) akan mengambil nilai pertama yang tidak null/undefined
    // Contoh: jika stateParam = "2", maka active = 2
    active = parseInt(stateParam || activeParam);
    
    // Memanggil fungsi updateProgress untuk memperbarui tampilan UI
    // berdasarkan nilai active yang baru
    // Fungsi ini akan mengubah tampilan form sesuai dengan step yang aktif
    updateProgress();
  }
});

// Fungsi untuk memperbarui data form ketika input berubah
function updateFormData(elementId) {
  // Cari element berdasarkan ID
  const element = document.getElementById(elementId);
  if (element) {
      // Update nilai di objek formData
      formData[elementId] = element.value;
  }
}

// --------- PENYIMPANAN INPUT USER --------- //
// Fungsi-fungsi untuk mengaktifkan pilihan pada form kedua
function activateText4(element, value, sukuBunga) {
  // Menghapus class 'active1' dari semua elemen dengan class 'pilihan'
  // Ini menonaktifkan opsi yang sebelumnya dipilih
  const elements = document.querySelectorAll(".pilihan4");
  elements.forEach((el) => el.classList.remove("active1"));

  // Menambahkan class 'active1' ke elemen yang diklik untuk menunjukkan bahwa ini dipilih
  element.classList.add("active1");

  // Mengambil elemen untuk menampilkan suku bunga
  const sukuBungaElement = document.querySelector('.suku-bunga');

  // Menyimpan nilai masa pertanggungan yang dipilih ke dalam objek formData
  formData.masaPertanggungan = value;

 // Menentukan nilai suku bunga berdasarkan masa pertanggungan yang dipilih
  let sukuBungaValue;
  switch (value) {
    case '2':
      sukuBungaValue = 0.008125;
      break;
    case '4':
      sukuBungaValue = 0.0225;
      break;
    case '0':
      sukuBungaValue = 0.07;
      break;
    case '1':
      sukuBungaValue = 0.0772;
      break;
    case '3':
      sukuBungaValue = 0.0771;
      break;
    case '5':
      sukuBungaValue = 0.0829;
      break;
    default:
      sukuBungaValue = '';
  }

    // Memperbarui tampilan suku bunga dalam format persentase
    // dengan dua angka di belakang koma
  sukuBungaElement.textContent = `Suku Bunga: ${(sukuBungaValue * 100).toFixed(2)}%`;
  displayPersentaseBunga((sukuBungaValue * 100).toFixed(2));
  
    // Menghitung akumulasi premi jika nilai rekomendasi tersedia
  if (recommendationMinValue && recommendationMaxValue) {
    // Menghitung premi bulanan minimum dan maksimum
    // dengan mengalikan nilai rekomendasi dengan suku bunga
    recommendationMinMonthlyPremium = (recommendationMinValue * sukuBungaValue);
    recommendationMaxMonthlyPremium = (recommendationMaxValue * sukuBungaValue);
    
    // Menampilkan nilai premi bulanan yang telah diformatkan
    displayMonthlyPremiums();
  }

  // Memformat nilai premi dengan format mata uang Indonesia
  // tanpa desimal dan dengan pemisah ribuan
  const formattedMin = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(recommendationMinMonthlyPremium);
  
  const formattedMax = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(recommendationMaxMonthlyPremium);
  
  // Log informasi
  console.log("MasaPertanggungan:", formData.masaPertanggungan);
  console.log("Suku Bunga:", sukuBungaValue);
  console.log("Min Monthly Premium:", recommendationMinMonthlyPremium);
  console.log("Max Monthly Premium:", recommendationMaxMonthlyPremium);
}

// Inisialisasi
updateProgress();

 // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
// Fungsi untuk menampilkan nilai premi bulanan yang telah diformat
function displayMonthlyPremiums() {
  // Mengambil elemen HTML dengan id 'akumulasiBungaResult'
    // Element ini digunakan untuk menampilkan hasil premi bulanan
  const monthlyPremiumElement = document.getElementById('akumulasiBungaResult');
  
  // Memeriksa apakah:
    // 1. Element HTML ditemukan
    // 2. Nilai minimum premi bulanan tersedia
    // 3. Nilai maksimum premi bulanan tersedia
  if (monthlyPremiumElement && recommendationMinMonthlyPremium && recommendationMaxMonthlyPremium) {
    const formattedMin = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(recommendationMinMonthlyPremium);
    
    // Memformat nilai maksimum premi ke dalam format mata uang Rupiah
    const formattedMax = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(recommendationMaxMonthlyPremium);
    
    // Menampilkan rentang premi bulanan (minimal - maksimal)
    // dalam format: "Rp X.xxx.xxx - Rp X.xxx.xxx"
    monthlyPremiumElement.textContent = `${formattedMin} - ${formattedMax}`;
  }
}

// --------- PENGAMBILAN DATA KE SERVER --------- //
// Fungsi untuk mengambil rekomendasi dari server dengan retry mechanism
function fetchRecommendationWithRetry(retries = 3, interval = 2000) {
  fetch("dataPR2.php", {
    method: "GET",
  })
    // Mengubah response dari request menjadi format JSON
  // untuk mengubah data mentah dari server menjadi format yang bisa digunakan dengan mudah dalam JavaScript.
  // contoh '{"recommendation": "12"}' -> {recommendation: "12"} 
    .then((response) => response.json())
      // Memeriksa apakah ada data rekomendasi dan nilainya bukan "Tidak ada rekomendasi"
    .then((data) => {
      if (
        data.recommendation &&
        data.recommendation !== "Tidak ada rekomendasi"
      ) {

          // Memisahkan string rekomendasi menjadi nilai minimum dan maksimum
          // Contoh: "1000000 - 2000000" menjadi ["1000000", "2000000"]
        const [minValueStr, maxValueStr] = data.recommendation.split(" - ");
          // Mengkonversi string nilai menjadi angka dan menyimpannya ke variabel global
          recommendationMinValue = extractNumericValue(minValueStr);
          recommendationMaxValue = extractNumericValue(maxValueStr);

          // Mencari elemen yang aktif dengan class pilihan4 dan active1
        const activeMasaPertanggungan = document.querySelector(".pilihan4.active1");
          // Jika ada masa pertanggungan yang aktif
        if (activeMasaPertanggungan) {
          // Mengambil nilai dari atribut onclick menggunakan regex
          // Contoh: "activateText4(this, '1')" akan mengambil '1'
          const value = activeMasaPertanggungan.getAttribute("onclick").match(/'([^']+)'/)[1];
            // Menghitung ulang premi bulanan dengan nilai masa pertanggungan
          activateText4(activeMasaPertanggungan, value);
        }

        // Log program
        console.log("Data Rekomendasi:", data.recommendation);
        console.log("Recommendation Min Value:", recommendationMinValue);
        console.log("Recommendation Max Value:", recommendationMaxValue);
        console.log("Recommendation Min Monthly Premium:", recommendationMinMonthlyPremium);
        console.log("Recommendation Max Monthly Premium:", recommendationMaxMonthlyPremium);

        // Menampilkan hasil rekomendasi di elemen HTML
        document.getElementById("recommendationResult").textContent =
          data.recommendation + " ";
        // Jika tidak ada rekomendasi dan masih ada kesempatan retry
      } else if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        // Menjalankan fungsi retry setelah interval waktu tertentu
        setTimeout(
          () => fetchRecommendationWithRetry(retries - 1, interval),
          interval
        );
        // Jika tidak ada rekomendasi dan tidak ada kesempatan retry
      } else {
        // Mereset semua nilai rekomendasi ke default
        resetRecommendationValues();
      }
    })
        // Menangani error yang terjadi selama proses
    .catch((error) => {
      console.error("Error:", error);
        // Jika masih ada kesempatan retry
      if (retries > 0) {
        console.log(`Retrying due to error... (${retries} attempts left)`);
       // Menjalankan fungsi retry setelah interval waktu tertentu
        setTimeout(
          () => fetchRecommendationWithRetry(retries - 1, interval),
          interval
        );
      // Jika tidak ada kesempatan retry
      } else {
     // Mereset semua nilai rekomendasi ke default
        resetRecommendationValues();
      }
    });
}

// Add helper function to reset recommendation values
function resetRecommendationValues() {
  recommendationMinValue = null;
  recommendationMaxValue = null;
  recommendationMinMonthlyPremium = null;
  recommendationMaxMonthlyPremium = null;
  document.getElementById("recommendationResult").textContent = "Tidak ada rekomendasi";
  document.getElementById("akumulasiBungaResult").textContent = "Tidak ada rekomendasi";
}

 // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
// Modifikasi fungsi fetchData
async function fetchData() {
  try {
      // Melakukan request ke server untuk mengambil data dari dataPR2.php
      const response = await fetch('dataPR2.php');
      // Mengubah response menjadi format JSON
      const result = await response.json();

      // Jika ada error, tampilkan di console dan hentikan eksekusi
      if (result.error) {
          console.error(result.error);
          return;
      }

      // Memeriksa apakah ada data premi dan max_id
      if (result.premi && result.premi.max_id) {
        // Fungsi helper untuk mengkonversi nilai numerik ke string yang sesuai
        const convertJenisKelamin = (value) => {
            return value === '0' ? 'Laki-laki' : 'Perempuan';
        };
    
        const convertUsia = (value) => {
            const usiaMap = {
                '0': '17 - 27 Tahun',
                '1': '28 - 38 Tahun',
                '2': '39 - 49 Tahun',
                '3': '50 - 60 Tahun',
                '4': 'Lebih dari 60 Tahun'
            };
            return usiaMap[value] || value;
        };
    
        const convertPekerjaan = (value) => {
            const pekerjaanMap = {
                '0': 'Karyawan Swasta',
                '1': 'Mahasiswa',
                '2': 'Pegawai Negeri',
                '3': 'Wirausaha'
            };
            return pekerjaanMap[value] || value;
        };
    
        const convertSumberDana = (value) => {
            const sumberDanaMap = {
                '0': 'Bisnis',
                '1': 'Gaji'
            };
            return sumberDanaMap[value] || value;
        };
    
        const convertSumberDanaTambahan = (value) => {
            const sumberDanaTambahanMap = {
                '0': 'Investasi',
                '1': 'Tabungan',
                '2': 'Warisan'
            };
            return sumberDanaTambahanMap[value] || value;
        };
    
        const convertMasaPertanggungan = (value) => {
            const masaPertanggunganMap = {
                '0': '12 bulan',
                '1': '24 bulan',
                '2': '3 bulan',
                '3': '36 bulan',
                '4': '6 bulan',
                '5': '60 bulan'
            };
            return masaPertanggunganMap[value] || value;
        };
    
        const convertPenghasilanBersih = (value) => {
            const penghasilanMap = {
                '0': 'Lebih dari Rp 100.000.001',
                '1': 'Rp 10.000.001 - Rp 25.000.000',
                '2': 'Rp 25.000.001 - Rp 100.000.000',
                '3': 'Rp 5.000.000 - Rp 10.000.000'
            };
            return penghasilanMap[value] || value;
        };
    
        const convertTujuan = (value) => {
            const tujuanMap = {
                '0': 'Dana Darurat',
                '1': 'Dana Pensiun',
                '2': 'Investasi',
                '3': 'Pembelian Aset'
            };
            return tujuanMap[value] || value;
        };
    
        const convertJenisDeposito = (value) => {
            const jenisDepositoMap = {
                '0': 'ARO',
                '1': 'ARO+',
                '2': 'Non ARO'
            };
            return jenisDepositoMap[value] || value;
        };

         // Mengisi form dengan data yang sudah dikonversi
    document.getElementById('predJenisKelamin').value = convertJenisKelamin(result.premi.Jenis_Kelamin_Pr);
    document.getElementById('predUsia').value = convertUsia(result.premi.Usia_Pr);
    document.getElementById('predPekerjaan').value = convertPekerjaan(result.premi.Pekerjaan_Pr);
    document.getElementById('predSumberDana').value = convertSumberDana(result.premi.Sumber_Dana_Pr);
    document.getElementById('predSumberDanaTambahan').value = convertSumberDanaTambahan(result.premi.Sumber_Dana_Tambahan_Pr);
    document.getElementById('predMasaPertanggungan').value = convertMasaPertanggungan(result.premi.Masa_Pertanggungan_Pr);
    document.getElementById('predPenghasilanBersih').value = convertPenghasilanBersih(result.premi.Penghasilan_Bersih_per_Bulan_Pr);
    document.getElementById('predTujuan').value = convertTujuan(result.premi.Tujuan_Pr);
    document.getElementById('predJenisDeposito').value = convertJenisDeposito(result.premi.Jenis_Deposito_Pr);

    console.log('Data berhasil ditampilkan:', result.premi);
} else {
    console.log('Tidak ada data masa pertanggungan yang ditemukan');
}

     // Menampilkan rekomendasi jika ada
     if (result.recommendation && result.recommendation !== "Tidak ada rekomendasi") {
      recommendationResult = result.recommendation;
      document.getElementById("recommendationResult").textContent = recommendationResult;
      console.log("Hasil Rekomendasi dari fetchData:", recommendationResult);
    }

  } catch (error) {
      console.error('Error fetching data:', error);
  }
}
// --------- PENGIRIMAN DATA KE SERVER --------- //
// Event listener untuk tombol submit 
submitButton.addEventListener("click", (e) => {
  // Validasi, pengiriman data ke server, dan penanganan respons
  e.preventDefault();
  
  if (!isFormTwoFilled()) {
    alert("Harap isi semua bagian pada halaman ini sebelum melanjutkan.");
    return;
  }
  
  // Siapkan data untuk dikirim ke server
  const formDataToSend = {
    Masa_Pertanggungan_Pr: formData.masaPertanggungan || ""
  };

  console.log("Form data to send:", formDataToSend); // Debug log

  // Kirim data ke server menggunakan fetch API
  fetch("dataPR2.php", {
    method: "POST",
    body: JSON.stringify(formDataToSend),
    headers: {
      "Content-Type": "application/json",
    }
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Success:", data);
    // Show alert that data has been saved
    alert("Data Anda telah berhasil tersimpan dan diproses!");
    
    // Pindah ke halaman berikutnya
    active = 2;
    updateProgress();
    
    // Tampilkan loading screen
    showAlertAndLoading();
    
    // Tunggu beberapa detik sebelum mengambil dan menampilkan data
    setTimeout(async () => {
      await fetchData();
      active = 2;
      updateProgress();
      // Tampilkan loading screen dan reset nilai
      showAlertAndLoading();
    }, 3000); // Tambahkan waktu timeout di sini
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
  });
});

// Panggil fetchData saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Cek apakah sedang berada di halaman hasil (state=2)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('state') === '2') {
      fetchData();
  }
});

// --------- MENAMPILKAN HASIL REKOMENDASI --------- //
// Fungsi utama untuk mengisi form prediksi pada halaman ketiga
// Fungsi ini bertanggung jawab untuk memindahkan data dari form input ke form prediksi
function populatePredictionForm() {
  // Fungsi helper untuk mengatur nilai elemen dengan penanganan error
  // Menerima parameter id (string) dan value (string) yang akan diset
  const setValueSafely = (id, value) => {
    // Mencari elemen DOM berdasarkan ID
    const element = document.getElementById(id);
    if (element) {
      // Jika elemen ditemukan, set nilai nya
      element.value = value;
    } else {
      // Jika elemen tidak ditemukan, tampilkan peringatan di console
      console.warn(`Element with id '${id}' not found`);
    }
  };

  // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
  // Fungsi helper untuk mendapatkan teks dari option yang dipilih dalam select element
  // Menerima parameter selectId (string) yang merupakan ID dari select element
  const getSelectedOptionText = (selectId) => {
    // Mencari select element berdasarkan ID
    const select = document.getElementById(selectId);
    // Jika select element ditemukan, ambil teks dari option yang dipilih
    // Jika tidak ditemukan, kembalikan string kosong
    return select ? select.options[select.selectedIndex].text : "";
  };

  // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
  // Fungsi helper untuk mendapatkan teks dari elemen yang memiliki class active1
  // Menerima parameter className (string) untuk mencari elemen dengan class tersebut
  const getActiveOptionText = (className) => {
    // Mencari elemen dengan class yang diberikan dan class active1
    const activeOption = document.querySelector(`${className}.active1`);
    // Jika elemen ditemukan, ambil teks kontennya dan hilangkan whitespace
    // Jika tidak ditemukan, kembalikan string kosong
    return activeOption ? activeOption.textContent.trim() : "";
  };
}

// Call this function when moving to the third step
document.querySelector(".btn-submitt").addEventListener("click", () => {
  setTimeout(populatePredictionForm, 6000); // Small delay to ensure formData is updated
});

// --------- LOADING SCREEN --------- //
// Fungsi untuk menampilkan loading screen
function showAlertAndLoading() {
  // Tampilkan loading screen
  document.getElementById('loading-screen').style.display = 'flex';
  
  // Reset/sembunyikan nilai-nilai selama loading
  document.getElementById('persentaseBungaResult').textContent = '';
  document.getElementById('akumulasiBungaResult').textContent = '';
  document.getElementById('recommendationResult').textContent = '';
  
  // Reset nilai global
  recommendationMinValue = null;
  recommendationMaxValue = null;
  recommendationMinMonthlyPremium = null;
  recommendationMaxMonthlyPremium = null;

  console.log("Loading screen dan reset nilai ditampilkan");

  // Sembunyikan loading screen dan tampilkan nilai setelah 6 detik
  setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      
      // Fetch dan tampilkan data setelah loading selesai
      fetchData();
      fetchRecommendationWithRetry();
      
      console.log("Loading screen disembunyikan dan nilai ditampilkan kembali");
  }, 6000);
}