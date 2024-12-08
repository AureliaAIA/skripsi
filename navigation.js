// File: navigation.js

// Menunggu sampai DOM (Document Object Model) selesai dimuat sepenuhnya
document.addEventListener('DOMContentLoaded', function() {
    // Mencari elemen tombol dengan href ke MasaPertanggungan.html
  const masaPertanggunganButton = document.querySelector('a[href="MasaPertanggungan.html"]');
    // Mencari elemen tombol dengan href ke Premi.html
  const premiButton = document.querySelector('a[href="Premi.html"]');

// Mengecek apakah tombol Masa Pertanggungan ada di halaman
  if (masaPertanggunganButton) {
        // Menambahkan event listener untuk menangani klik pada tombol Masa Pertanggungan
      masaPertanggunganButton.addEventListener('click', function(e) {
            // Mencegah perilaku default link (mencegah navigasi langsung)
          e.preventDefault();
            // Mengarahkan ke halaman MasaPertanggungan.html
          window.location.href = 'MasaPertanggungan.html';
            // Memuat file PHP untuk data Masa Pertanggungan
          loadPHPFile('dataMP1.php');
            // Memuat file JavaScript untuk fungsi-fungsi Masa Pertanggungan
          loadJSFile('scriptMasaPertanggungan.js');
      });
  }

      // Mengecek apakah tombol Premi ada di halaman
  if (premiButton) {
        // Menambahkan event listener untuk menangani klik pada tombol Premi
      premiButton.addEventListener('click', function(e) {
            // Mencegah perilaku default link
          e.preventDefault();
            // Mengarahkan ke halaman Premi.html
          window.location.href = 'Premi.html';
            // Memuat file PHP untuk data Premi
          loadPHPFile('dataPR2.php');
            // Memuat file JavaScript untuk fungsi-fungsi Premi
          loadJSFile('scriptPremi.js');
      });
  }
});

// function loadPHPFile(filename) {
//   // This function would be implemented server-side
//   // to include the appropriate PHP file
//   console.log('Loading PHP file:', filename);
// }

// function loadJSFile(filename) {
//   const script = document.createElement('script');
//   script.src = filename;
//   document.body.appendChild(script);
// }