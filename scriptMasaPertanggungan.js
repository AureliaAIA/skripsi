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

let selectedPenghasilanBersih = "";

// Variabel global baru untuk menyimpan min dan max penghasilan
let premiMin = 0;
let premiMax = 0;

// Variabel global baru untuk menyimpan hasil perhitungan
let premiMinInterest = 0;
let premiMaxInterest = 0;

// Variable global untuk menyimpan suku bunga
let interestRate = 0;

// Variabel global baru untuk menyimpan rentang bunga
let interestRange = "";

// Fungsi untuk mendapatkan suku bunga berdasarkan masa pertanggungan
function getInterestRate(months) {
    switch(parseInt(months)) {
        case 3:
            return 0.8125;
        case 6:
            return 2.25;
        case 12:
            return 7.0;
        case 24:
            return 7.72;
        case 36:
            return 7.71;
        case 60:
            return 8.29;
        default:
            return 0;
    }
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
  premi: "",               // Menyimpan jumlah premi yang dipilih
  penghasilanBersih: "",   // Menyimpan range penghasilan bersih
  tujuan: "",              // Menyimpan tujuan investasi
  jenisDeposito: "",       // Menyimpan jenis deposito yang dipilih
};

// --------- VALIDASI INPUT --------- //
// Fungsi untuk memeriksa apakah semua field di form kedua sudah diisi
function isFormTwoFilled() {
  // Mengembalikan true jika semua field memiliki nilai, false jika ada yang kosong
  return (
      formData.premi !== ""               // Cek premi terisi
  );
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
  window.location.href = "MasaPertanggungan.html?state=1";
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
// warna beda di 1/2/3 yang dikiri
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
function activateText(element, value) {
  // Menghapus class 'active1' dari semua elemen dengan class 'pilihan'
  // Ini menonaktifkan opsi yang sebelumnya dipilih
  const elements = document.querySelectorAll(".pilihan");
  elements.forEach((el) => el.classList.remove("active1"));

  // Menambahkan class 'active1' ke elemen yang diklik untuk menunjukkan bahwa ini dipilih
  element.classList.add("active1");

  // Menyimpan nilai premi yang dipilih ke dalam objek formData
  formData.premi = value;

  // Menentukan rentang premi berdasarkan nilai yang dipilih
switch(value) {
  case '0': // Lebih dari Rp 100.000.001
    premiMin = 100000001;
    premiMax = Infinity;
    break;
  case '1': // Rp 25.000.000 - Rp 50.000.000
    premiMin = 25000000;
    premiMax = 50000000;
    break;
  case '2': // Rp 50.000.001 - Rp 100.000.000
    premiMin = 50000001;
    premiMax = 100000000;
    break;
  default:
    premiMin = 0;
    premiMax = 0;
}

    // Menghitung rentang bunga
    // Bunga dihitung dengan rumus (premi * suku_bunga)
premiMinInterest = (premiMin * (interestRate / 100));
premiMaxInterest = premiMax === Infinity ? Infinity : (premiMax * (interestRate / 100));

    // Memformat string rentang bunga berdasarkan ada tidaknya batas maksimum
if (premiMax === Infinity) {
  interestRange = `Lebih dari ${formatRupiah(premiMinInterest)}`;
} else {
  interestRange = `${formatRupiah(premiMinInterest)} - ${formatRupiah(premiMaxInterest)}`;
}

// Log perhitungan
console.log("Premi:", formData.premi);
console.log("Premi Range - Min:", formatRupiah(premiMin));
console.log("Premi Range - Max:", premiMax === Infinity ? "Tidak terbatas" : formatRupiah(premiMax));
console.log("Bunga Minimum:", formatRupiah(premiMinInterest));
console.log("Bunga Maximum:", premiMaxInterest === Infinity ? "Tidak terbatas" : formatRupiah(premiMaxInterest));
console.log("Rentang Bunga:", interestRange);
}

// Fungsi helper untuk memformat angka ke format Rupiah
    // Menggunakan Intl.NumberFormat untuk memformat angka sebagai mata uang
    // - 'id-ID': Pengaturan lokal Indonesia
    // - style: 'currency' untuk format mata uang
    // - minimumFractionDigits: 0 untuk menghilangkan desimal
    // - maximumFractionDigits: 0 untuk menghilangkan desimal
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// Inisialisasi
updateProgress();

// --------- PENGAMBILAN DATA KE SERVER --------- //
// Fungsi untuk mengambil rekomendasi dari server dengan retry mechanism
function fetchRecommendationWithRetry(retries = 3, interval = 2000) { // interval disini itu jeda
  fetch("dataMP1.php", {
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
        // Jika ada rekomendasi, tampilkan hasilnya di elemen HTML dengan id "recommendationResult"
        document.getElementById("recommendationResult").textContent =
          data.recommendation + " bulan";
          // Jika tidak ada rekomendasi dan masih ada kesempatan retry
          // Hitung dan simpan suku bunga
          interestRate = getInterestRate(data.recommendation);
                
          // Hitung ulang bunga berdasarkan premiMin dan premiMax yang ada, dibagi 2
        premiMinInterest = (premiMin * (interestRate / 100)) / 2;
        premiMaxInterest = premiMax === Infinity ? Infinity : (premiMax * (interestRate / 100)) / 2;
        
         // Memformat string rentang bunga
          if (premiMax === Infinity) {
            interestRange = `Lebih dari ${formatRupiah(premiMinInterest)}`;
        } else {
            interestRange = `${formatRupiah(premiMinInterest)} - ${formatRupiah(premiMaxInterest)}`;
        }

          // Tampilkan suku bunga di UI (tambahkan element dengan id "interestRateResult" di HTML)
          if (document.getElementById("interestRateResult")) {
              document.getElementById("interestRateResult").textContent =
                  interestRate + "%";
          }

          // Menampilkan akumulasi bunga dan persentase ke UI
          document.getElementById("akumulasiBungaResult").textContent = interestRange;
          document.getElementById("persentaseBungaResult").textContent = interestRate + "%";

          // Log untuk debugging
                console.log(`Masa Pertanggungan: ${data.recommendation} bulan`);
                console.log(`Suku Bunga: ${interestRate}%`);
                console.log("Bunga Minimum:", formatRupiah(premiMinInterest));
                console.log("Bunga Maximum:", premiMaxInterest === Infinity ? "Tidak terbatas" : formatRupiah(premiMaxInterest));
                console.log("Rentang Bunga:", interestRange);

       // Jika tidak ada rekomendasi dan masih ada kesempatan retry
      } else if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        // Menjalankan fungsi fetch lagi setelah jeda waktu sesuai interval
        setTimeout(
          () => fetchRecommendationWithRetry(retries - 1, interval),
          interval
        );
        // Jika tidak ada rekomendasi dan tidak ada kesempatan retry lagi
      } else {
        document.getElementById("recommendationResult").textContent =
            "Tidak ada rekomendasi";
        if (document.getElementById("interestRateResult")) {
            document.getElementById("interestRateResult").textContent = "0%";
        }
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
        document.getElementById("recommendationResult").textContent =
          "Error fetching recommendation";
          if (document.getElementById("interestRateResult")) {
            document.getElementById("interestRateResult").textContent = "Error";
        }
      }
    });
}

 // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
// Modifikasi fungsi fetchData
async function fetchData() {
  try {
      // Melakukan request ke server untuk mengambil data dari dataMP1.php
      const response = await fetch('dataMP1.php');
      // Mengubah response menjadi format JSON
      const result = await response.json();

      // Jika ada error, tampilkan di console dan hentikan eksekusi
      if (result.error) {
          console.error(result.error);
          return;
      }

      // Memeriksa apakah ada data masa_pertanggungan dan max_id
      if (result.masa_pertanggungan && result.masa_pertanggungan.max_id) {
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
    
        const convertPremi = (value) => {
            const premiMap = {
                '0': 'Lebih dari Rp 100.000.001',
                '1': 'Rp 25.000.000 - Rp 50.000.000',
                '2': 'Rp 50.000.001 - Rp 100.000.000'
            };
            return premiMap[value] || value;
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
    document.getElementById('predJenisKelamin').value = convertJenisKelamin(result.masa_pertanggungan.Jenis_Kelamin_MP);
    document.getElementById('predUsia').value = convertUsia(result.masa_pertanggungan.Usia_MP);
    document.getElementById('predPekerjaan').value = convertPekerjaan(result.masa_pertanggungan.Pekerjaan_MP);
    document.getElementById('predSumberDana').value = convertSumberDana(result.masa_pertanggungan.Sumber_Dana_MP);
    document.getElementById('predSumberDanaTambahan').value = convertSumberDanaTambahan(result.masa_pertanggungan.Sumber_Dana_Tambahan_MP);
    document.getElementById('predPremi').value = convertPremi(result.masa_pertanggungan.Premi_MP);
    document.getElementById('predPenghasilanBersih').value = convertPenghasilanBersih(result.masa_pertanggungan.Penghasilan_Bersih_per_Bulan_MP);
    document.getElementById('predTujuan').value = convertTujuan(result.masa_pertanggungan.Tujuan_MP);
    document.getElementById('predJenisDeposito').value = convertJenisDeposito(result.masa_pertanggungan.Jenis_Deposito_MP);

    console.log('Data berhasil ditampilkan:', result.masa_pertanggungan);
} else {
    console.log('Tidak ada data masa pertanggungan yang ditemukan');
}

      // Menampilkan rekomendasi jika ada
      if (result.recommendation && result.recommendation !== "Tidak ada rekomendasi") {
        recommendationResult = result.recommendation;
        document.getElementById("recommendationResult").textContent = recommendationResult + " bulan";
        console.log("Hasil Rekomendasi dari fetchData:", recommendationResult, "bulan");
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
    Premi_Mp: formData.premi || "",
  };

  console.log("Form data to send:", formDataToSend); // Debug log

  // --------- PENGIRIMAN DATA KE SERVER --------- //
    // Kirim data ke server menggunakan fetch API
  fetch("dataMP1.php", {
    method: "POST",
    body: JSON.stringify(formDataToSend),
    headers: {
      "Content-Type": "application/json",
    },
  })
  // Mengubah response dari request menjadi format JSON
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    // Memeriksa apakah ada data berhasil disimpan
    .then((data) => {
        // Tampilkan pesan sukses
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
    }, 5000);
        // Isi form prediksi
      populatePredictionForm();

      // Ambil rekomendasi setelah 5 detik
      setTimeout(() => {
        fetchRecommendationWithRetry();
      }, 5000); 

    })
    .catch((error) => {
      console.error("Error:", error);
      // Optionally, show an error alert
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
  const setValueSafely = (id, value) => { // -> ambil id sama value dari HTML
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
  // Fungsi helper untuk mendapatkan teks dari option yang dipilih dalam select element
  // Menerima parameter selectId (string) yang merupakan ID dari select element
  const getSelectedOptionText = (selectId) => { // -> ambil teks dari form 1
    // Mencari select element berdasarkan ID
    const select = document.getElementById(selectId);
    // Jika select element ditemukan, ambil teks dari option yang dipilih
    // Jika tidak ditemukan, kembalikan string kosong
    return select ? select.options[select.selectedIndex].text : "";
  };

  // --------- MENAMPILKAN HASIL REKOMENDASI --------- //
  // Fungsi helper untuk mendapatkan teks dari elemen yang memiliki class active1
  // Menerima parameter className (string) untuk mencari elemen dengan class tersebut
  const getActiveOptionText = (className) => { // -> ambil teks dari form 2
    // Mencari elemen dengan class yang diberikan dan class active1
    const activeOption = document.querySelector(`${className}.active1`);
    // Jika elemen ditemukan, ambil teks kontennya dan hilangkan whitespace
    // Jika tidak ditemukan, kembalikan string kosong
    return activeOption ? activeOption.textContent.trim() : "";
  };
}

// Call this function when moving to the third step
document.querySelector(".btn-submitt").addEventListener("click", () => {
  setTimeout(populatePredictionForm, 5000); // Small delay to ensure formData is updated
});

// --------- LOADING SCREEN --------- //
// Fungsi untuk menampilkan loading screen
function showAlertAndLoading() {
  document.getElementById('loading-screen').style.display = 'flex';
  console.log("Loading screen seharusnya tampil sekarang");

// Sembunyikan loading screen setelah 6 detik
  setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      console.log("Loading screen disembunyikan");
  }, 6000);
}