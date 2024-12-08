// Mengambil elemen dengan id 'menu-icon' dan class 'navlist' dari HTML
let menu = document.querySelector('#menu-icon')
let navlist = document.querySelector('.navlist')

// Ketika menu icon diklik, akan menambah/menghapus class 'bx-x' pada menu
// dan class 'open' pada navlist (untuk tampilan menu mobile)
menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('open');
};

// Check if page is being reloaded and redirect
window.onload = function() {
    // Check if the page is being reloaded (not first visit)
    if (performance.navigation.type === 1) {
        // Redirect to Program.html
        window.location.href = 'Program.html';
    }
  }; 
  
// Mengatur animasi scroll reveal dengan pengaturan:
// - Jarak animasi: 65px
// - Durasi animasi: 2.6 detik
// - Delay sebelum animasi: 450 milidetik
// - Reset: true (animasi akan diulang setiap scroll)
const sr = ScrollReveal ({
    distance: '65px',
    duration: 2600,
    delay: 450,
    reset: true,
});

// Menerapkan animasi scroll reveal pada beberapa elemen:
// - hero-text: muncul dari atas dengan delay 200ms
// - hero-img: muncul dari atas dengan delay 450ms
// - icons: muncul dari kiri dengan delay 500ms
// - scroll-down: muncul dari kanan dengan delay 500ms
sr.reveal('.hero-text', {delay:200, origin: 'top'});
sr.reveal('.hero-img', {delay:450, origin: 'top'});
sr.reveal('.icons', {delay:500, origin: 'left'});
sr.reveal('.scroll-down', {delay:500, origin: 'right'});

// Fungsi untuk menampilkan konten sesuai section yang dipilih
function showContent(section) {
    // Daftar semua section yang ada
    var sections = ['Produk', 'Deposito', 'MasaPertanggungan', 'Premi', 'Jenis', 'Informasi'];
    
    // Untuk setiap section dalam daftar:
    sections.forEach(function(id) {
        var element = document.getElementById(id);
        
        // Jika section ini yang dipilih:
        // - Hapus class 'hidden'
        // - Tambah class 'visible'
        // Jika bukan section yang dipilih:
        // - Hapus class 'visible'
        // - Tambah class 'hidden'
        if (id === section) {
            element.classList.remove('hidden');
            element.classList.add('visible');
        } else {
            element.classList.remove('visible');
            element.classList.add('hidden');
        }
    });
}