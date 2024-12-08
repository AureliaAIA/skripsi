1. Unduh Kode Program
- Buka repository GitHub.
- Klik tombol hijau "Code".
- Pilih "Download ZIP" untuk mengunduh seluruh kode.
- Tunggu proses unduhan selesai.

2. Ekstraksi Kode Program
- Buka folder tempat file ZIP diunduh.
- Ekstrak file ZIP ke lokasi:
    Windows: C:\xampp\htdocs\nama_proyek
    MacOS/Linux: /opt/lampp/htdocs/nama_proyek
- Gunakan nama folder lowercase tanpa spasi.

3. Unduh Database
- Temukan file .sql di repository GitHub.
- Download atau salin isi file .sql.
- Simpan file di komputer.

4. Persiapkan XAMPP
- Buka XAMPP Control Panel.
- Aktifkan layanan Apache dan MySQL.
- Pastikan keduanya berstatus "Running".

5. Konfigurasi Database
-Buka phpMyAdmin: http://localhost/phpmyadmin
-Buat database baru:
  Nama: "Program"
-Collation: utf8mb4_general_ci

6. Import Database
- Pilih database yang dibuat.
- Gunakan tab "Import".
- Upload file .sql.
- Konfirmasi pengaturan UTF-8.
- Jalankan proses impor.

7. Akses Program
- Buka browser.
- Kunjungi: http://localhost/nama_proyek
- Pilih program.html sebagai halaman utama.
