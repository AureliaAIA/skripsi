// Mengambil elemen dengan id 'menu-icon' dan menyimpannya ke variabel menu
let menu = document.querySelector('#menu-icon')

// Mengambil elemen dengan class 'navlist' dan menyimpannya ke variabel navlist
let navlist = document.querySelector('.navlist')

// Menambahkan fungsi yang akan dijalankan ketika menu diklik
menu.onclick = () => {
    // Toggle (menambah/menghapus) class 'bx-x' pada menu icon
    // Ini biasanya digunakan untuk mengubah ikon menu menjadi ikon close (X)
    menu.classList.toggle('bx-x');
    
    // Toggle class 'open' pada navlist
    // Ini biasanya digunakan untuk menampilkan/menyembunyikan menu navigasi
    navlist.classList.toggle('open');
};

// Membuat konfigurasi untuk animasi scroll reveal
const sr = ScrollReveal ({
    distance: '65px',     // Jarak pergerakan animasi
    duration: 2600,       // Durasi animasi dalam milidetik
    delay: 450,          // Waktu tunggu sebelum animasi dimulai
    reset: true,         // Animasi akan diulang setiap kali elemen masuk ke viewport
});

// Menerapkan animasi pada elemen dengan class 'hero-text'
// Animasi akan muncul dari atas dengan delay 200ms
sr.reveal('.hero-text', {delay:200, origin: 'top'});

// Menerapkan animasi pada elemen dengan class 'hero-img'
// Animasi akan muncul dari atas dengan delay 450ms
sr.reveal('.hero-img', {delay:450, origin: 'top'});

// Menerapkan animasi pada elemen dengan class 'icons'
// Animasi akan muncul dari kiri dengan delay 500ms
sr.reveal('.icons', {delay:500, origin: 'left'});