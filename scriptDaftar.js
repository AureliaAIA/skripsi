// Mengambil elemen tombol 'Next' dari DOM menggunakan class 'btn-next'
const nextButton = document.querySelector(".btn-next");

// Mengambil elemen tombol 'Previous' dari DOM menggunakan class 'btn-prev'
const prevButton = document.querySelector(".btn-prev");

// Mengambil elemen tombol 'Submit' dari DOM menggunakan class 'btn-submitt'
const submitButton = document.querySelector(".btn-submitt");

// Mengambil elemen tombol 'Home' dari DOM menggunakan class 'btn-submit-Beranda'
const homeButton = document.querySelector(".btn-submit-Beranda");

// Mengambil semua elemen dengan class 'step' (digunakan untuk indikator progress)
const steps = document.querySelectorAll(".step");

// Mengambil semua elemen form-step (bagian-bagian form yang akan ditampilkan/disembunyikan)
const form_step = document.querySelectorAll(".form-step");

// Mengambil elemen menu icon untuk tampilan mobile
let menu = document.querySelector("#menu-icon");

// Mengambil elemen navigasi list untuk tampilan mobile
let navlist = document.querySelector(".navlist");

// Get new result buttons
const masaPertanggunganButton = document.querySelector(".btn-MP");
const premiButton = document.querySelector(".btn-PR");
const editButton = document.querySelector(".btn-Edit");

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
// Fungsi untuk memeriksa apakah semua field di form pertama sudah diisi
function isFormOneFilled() {
  // Mengembalikan true jika semua field memiliki nilai, false jika ada yang kosong
  return (
      formData.jenisKelamin &&       // Cek jenis kelamin terisi
      formData.usia &&               // Cek usia terisi
      formData.pekerjaan &&          // Cek pekerjaan terisi
      formData.sumberDana &&         // Cek sumber dana terisi
      formData.sumberDanaTambahan    // Cek sumber dana tambahan terisi
  );
}

// --------- VALIDASI INPUT --------- //
// Fungsi untuk memeriksa apakah semua field di form kedua sudah diisi
function isFormTwoFilled() {
  // Mengembalikan true jika semua field memiliki nilai, false jika ada yang kosong
  return (
      formData.penghasilanBersih !== "" &&   // Cek penghasilan terisi
      formData.tujuan !== "" &&              // Cek tujuan terisi
      formData.jenisDeposito !== ""          // Cek jenis deposito terisi
  );
}

// Fungsi untuk menyimpan data form ke localStorage
function saveFormDataToStorage() {
  // Mengubah objek formData menjadi string JSON dan menyimpannya di localStorage
  // dengan key 'formData'
  localStorage.setItem('formData', JSON.stringify(formData));
}

// Fungsi untuk mengambil data form dari localStorage
function loadFormDataFromStorage() {
  // Mengambil data yang tersimpan dengan key 'formData'
  const savedData = localStorage.getItem('formData');
  
  // Jika ada data yang tersimpan
  if (savedData) {
    // Mengubah string JSON kembali menjadi objek dan menyimpannya ke variabel formData
    formData = JSON.parse(savedData);
    return true;  // Mengembalikan true jika berhasil memuat data
  }
  return false;   // Mengembalikan false jika tidak ada data tersimpan
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
  // Decrement halaman aktif
  active--;
  // Pastikan tidak kurang dari halaman pertama
  if (active < 1) {
      active = 1;
  }
  // Update tampilan progress
  updateProgress();
});

// Check if page is being reloaded and redirect
window.onload = function() {
  // Check if the page is being reloaded (not first visit)
  if (performance.navigation.type === 1) {
      // Redirect to Program.html
      window.location.href = 'Program.html';
  }
};

// --------- NAVIGASI FORM --------- //
// Event listener untuk tombol Home
homeButton.addEventListener("click", () => {
  // Redirect ke halaman Program.html
  window.location.href = "Program.html";
});

masaPertanggunganButton.addEventListener("click", () => {
  // Redirect ke halaman Program.html
  window.location.href = "MasaPertanggungan.html";
});

premiButton.addEventListener("click", () => {
  // Redirect ke halaman Program.html
  window.location.href = "Premi.html";
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

  // --------- NAVIGASI FORM --------- //
    // Mengatur visibilitas tombol berdasarkan halaman aktif
    // Halaman 1: Hanya tampilkan tombol Next
    // Halaman 2: Tampilkan tombol Back dan Submit
    // Halaman 3: Hanya tampilkan tombol Home
  if (active === 1) {
    prevButton.style.display = "none"; // Sembunyikan tombol Back
    nextButton.style.display = "inline-block"; // Tampilkan tombol Next Step
    submitButton.style.display = "none"; // Sembunyikan tombol Submit
    homeButton.style.display = "none"; // Sembunyikan tombol Home
        // Hide result buttons on page 1
        masaPertanggunganButton.style.display = "none";
        premiButton.style.display = "none";
        editButton.style.display = "none";
  }
  // Kondisi halaman kedua (Page 2)
  else if (active === 2) {
    prevButton.style.display = "inline-block"; // Tampilkan tombol Back
    nextButton.style.display = "none"; // Sembunyikan tombol Next Step
    submitButton.style.display = "inline-block"; // Tampilkan tombol Submit
    homeButton.style.display = "none"; // Sembunyikan tombol Home
        // Hide result buttons on page 2
        masaPertanggunganButton.style.display = "none";
        premiButton.style.display = "none";
        editButton.style.display = "none";
  }
    // Kondisi halaman ketiga (Page 3)
    else if (active === 3) {
      prevButton.style.display = "none"; // Tampilkan tombol Back
      nextButton.style.display = "none"; // Sembunyikan tombol Next Step
      submitButton.style.display = "none"; // Sembunyikan tombol Submit
      homeButton.style.display = "inline-block"; // Tampilkan tombol Back to Home Page
        // Show result buttons only on page 3
        masaPertanggunganButton.style.display = "inline-block";
        premiButton.style.display = "inline-block";
        editButton.style.display = "inline-block";
    }
};

// Menambahkan event listener yang akan dijalankan ketika DOM telah sepenuhnya dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Membuat objek URLSearchParams untuk mengekstrak parameter dari URL halaman
  const urlParams = new URLSearchParams(window.location.search);
  
  // Mengambil nilai parameter 'state' dari URL
  // Contoh URL: "page.html?state=2"
  const state = urlParams.get('state');
  
  // Memeriksa apakah parameter state ada di URL
  if (state) {
    // Mengkonversi nilai state dari string ke integer
    // dan menetapkannya ke variabel active yang mengontrol halaman aktif
    active = parseInt(state);
    
    // Memanggil fungsi updateProgress() untuk memperbarui tampilan
    // berdasarkan nilai state yang baru
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
// Fungsi-fungsi untuk menyimpan data dari setiap field
function storeJenisKelamin(selectElement) {
  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      formData.jenisKelamin = event.target.value;
      console.log(`jenisKelamin:`, formData.jenisKelamin);
    });
  } else {
    console.warn(`Element with ID ${selectElement.id} not found`);
  }
}

function storeUsia(selectElement) {
  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      formData.usia = event.target.value;
      console.log(`usia:`, formData.usia);
    });
  } else {
    console.warn(`Element with ID ${selectElement.id} not found`);
  }
}

function storePekerjaan(selectElement) {
  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      formData.pekerjaan = event.target.value;
      console.log(`pekerjaan:`, formData.pekerjaan);
    });
  } else {
    console.warn(`Element with ID ${selectElement.id} not found`);
  }
}

function storeSumberDana(selectElement) {
  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      formData.sumberDana = event.target.value;
      console.log(`sumberDana:`, formData.sumberDana);
    });
  } else {
    console.warn(`Element with ID ${selectElement.id} not found`);
  }
}

function storeSumberDanaTambahan(selectElement) {
  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      formData.sumberDanaTambahan = event.target.value;
      console.log(`sumberDanaTambahan:`, formData.sumberDanaTambahan);
    });
  } else {
    console.warn(`Element with ID ${selectElement.id} not found`);
  }
}

// Inisialisasi event listeners saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  storeJenisKelamin(document.getElementById("JenisKelamin"));
  storeUsia(document.getElementById("Usia"));
  storePekerjaan(document.getElementById("Pekerjaan"));
  storeSumberDana(document.getElementById("SumberDana"));
  storeSumberDanaTambahan(document.getElementById("SumberDanaTambahan"));
});

// Pengecekan apakah halaman dibuka dalam mode edit
const urlParams = new URLSearchParams(window.location.search);

// Memeriksa apakah parameter 'edit=true' ada di URL dan data tersimpan bisa dimuat
if (urlParams.get('edit') === 'true' && loadFormDataFromStorage()) {
    // Jika kondisi terpenuhi, panggil fungsi untuk mengisi form dengan data tersimpan
    populateFormFields();
}

// Mengambil parameter 'state' dari URL untuk menentukan halaman aktif
const state = urlParams.get('state');
// Jika parameter state ada
if (state) {
    // Konversi nilai state dari string ke number dan set sebagai halaman aktif
    active = parseInt(state);
    // Update tampilan sesuai halaman aktif
    updateProgress();
}

// --------- PENYIMPANAN INPUT USER --------- //
// Event listeners for input changes
[
  "JenisKelamin",
  "Usia",
  "Pekerjaan",
  "SumberDana",
  "SumberDanaTambahan",
].forEach((id) => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("change", () => updateFormData(id));
  }
});

// --------- PENYIMPANAN INPUT USER --------- //
// Fungsi-fungsi untuk mengaktifkan pilihan pada form kedua
function activateText1(element, value) {
  // Deactivate all text "buttons"
  const elements = document.querySelectorAll(".pilihan1");
  elements.forEach((el) => el.classList.remove("active1"));

  // Activate the clicked text
  element.classList.add("active1");
  formData.penghasilanBersih = value;
  // Log the selected value (optional)
  console.log("Penghasilan Bersih per Bulan:", value);
}

function activateText2(element, value) {
  // Deactivate all text "buttons"
  const elements = document.querySelectorAll(".pilihan2");
  elements.forEach((el) => el.classList.remove("active1"));

  // Activate the clicked text
  element.classList.add("active1");
  formData.tujuan = value;
  // Log the selected value (optional)
  console.log("Tujuan:", value);
}

function activateText3(element, value) {
  // Deactivate all text "buttons"
  const elements = document.querySelectorAll(".pilihan3");
  elements.forEach((el) => el.classList.remove("active1"));

  // Activate the clicked text
  element.classList.add("active1");
  formData.jenisDeposito = value;
  // Log the selected value (optional)
  console.log("Jenis Deposito:", value);
}

// Inisialisasi
updateProgress();

// Fungsi untuk mengisi form dengan data yang tersimpan
function populateFormFields() {
  // Mengisi dropdown selections
  if (formData.jenisKelamin) {
    const jenisKelaminSelect = document.getElementById("JenisKelamin");
    if (jenisKelaminSelect) jenisKelaminSelect.value = formData.jenisKelamin;
  }
  
  if (formData.usia) {
    const usiaSelect = document.getElementById("Usia");
    if (usiaSelect) usiaSelect.value = formData.usia;
  }
  
  if (formData.pekerjaan) {
    const pekerjaanSelect = document.getElementById("Pekerjaan");
    if (pekerjaanSelect) pekerjaanSelect.value = formData.pekerjaan;
  }
  
  if (formData.sumberDana) {
    const sumberDanaSelect = document.getElementById("SumberDana");
    if (sumberDanaSelect) sumberDanaSelect.value = formData.sumberDana;
  }
  
  if (formData.sumberDanaTambahan) {
    const sumberDanaTambahanSelect = document.getElementById("SumberDanaTambahan");
    if (sumberDanaTambahanSelect) sumberDanaTambahanSelect.value = formData.sumberDanaTambahan;
  }

  // Mengisi pilihan form kedua
  if (formData.penghasilanBersih) {
    const penghasilanElement = document.querySelector(`.pilihan1[onclick*="activateText1(this, '${formData.penghasilanBersih}')"]`);
    if (penghasilanElement) {
      penghasilanElement.classList.add('active1');
    }
  }

  if (formData.tujuan) {
    const tujuanElement = document.querySelector(`.pilihan2[onclick*="activateText2(this, '${formData.tujuan}')"]`);
    if (tujuanElement) {
      tujuanElement.classList.add('active1');
    }
  }

  if (formData.jenisDeposito) {
    const depositoElement = document.querySelector(`.pilihan3[onclick*="activateText3(this, '${formData.jenisDeposito}')"]`);
    if (depositoElement) {
      depositoElement.classList.add('active1');
    }
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
  const formDataToSend = [{
    Jenis_Kelamin_DD: formData.jenisKelamin || "",
    Usia_DD: formData.usia || "",
    Pekerjaan_DD: formData.pekerjaan || "",
    Sumber_Dana_DD: formData.sumberDana || "",
    Sumber_Dana_Tambahan_DD: formData.sumberDanaTambahan || "",
    Penghasilan_Bersih_per_Bulan_DD: formData.penghasilanBersih || "",
    Tujuan_DD: formData.tujuan || "",
    Jenis_Deposito_DD: formData.jenisDeposito || "",
  }];

   // Simpan ke localStorage sebelum mengirim ke server
   saveFormDataToStorage();
  console.log("Form data to send:", formDataToSend); // Debug log

  // --------- PENGIRIMAN DATA KE SERVER --------- //
    // Kirim data ke server menggunakan fetch API
  fetch("dataDD.php", {
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
      alert("Data diri Anda telah berhasil disimpan!");
       // Pindah ke halaman berikutnya
       active = 3;
       updateProgress();
    })
    .catch((error) => {
      console.error("Error:", error);
      // Optionally, show an error alert
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    });
});

