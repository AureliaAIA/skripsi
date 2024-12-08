<?php
// Mengatur agar data yang dikirimkan ke pengguna berbentuk JSON
header("Content-Type: application/json");

// Mengizinkan permintaan dari semua alamat situs (domain) lain
header("Access-Control-Allow-Origin: *");

// Mengizinkan hanya metode HTTP tertentu seperti POST, GET, dan OPTIONS untuk dipakai
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Mengizinkan penggunaan header "Content-Type" dalam permintaan, untuk menentukan jenis data
header("Access-Control-Allow-Headers: Content-Type");


// Konfigurasi koneksi ke database mySQL
$servername = "localhost";    // Nama server database
$username = "root";          // Username database
$password = "";              // Password database (kosong untuk development)
$dbname = "program";         // Nama database yang digunakan

// Fungsi untuk mencatat log aktivitas sistem
function logMessage($message) {
    $logFile = 'app.log';                    // Nama file log
    $timestamp = date('Y-m-d H:i:s');        // Timestamp untuk setiap log
    // Menulis pesan log ke file
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

// Membuat koneksi baru ke database mySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Memeriksa koneksi database
if ($conn->connect_error) {
    // Mencatat error koneksi ke log
    logMessage("Connection failed: " . $conn->connect_error);
    // Menghentikan eksekusi dan mengirim pesan error
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Memeriksa apakah permintaan adalah OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Memeriksa apakah permintaan adalah POST (untuk menyimpan data)
    $data = json_decode(file_get_contents('php://input'), true);

    // Memeriksa apakah data kosong
    if (empty($data)) {
        logMessage("No data received");
        die(json_encode(["error" => "No data received"]));
    }

    // Mengambil ID terakhir dari database untuk generate ID baru
    $query = "SELECT MAX(ID_Premi) as max_id FROM premi";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'];
    // Jika maxId tidak ada, ID baru dimulai dari 0, jika ada, ID baru adalah maxId + 1
    $newId = ($maxId === null) ? 0 : $maxId + 1;

    // Menambahkan ID baru ke array data
    $data['ID_Premi'] = $newId;

    //query ambil data dari table informasi dan di simpan dalam variable sendiri
    // Query untuk mengambil data dari tabel informasi dengan ID_DD terbesar
    $queryInformasi = "SELECT ID_DD, Jenis_Kelamin_DD, Usia_DD, Pekerjaan_DD, Sumber_Dana_DD, Sumber_Dana_Tambahan_DD, Penghasilan_Bersih_per_Bulan_DD, Tujuan_DD, Jenis_Deposito_DD 
    FROM informasi 
    ORDER BY ID_DD DESC 
    LIMIT 1";

    $resultInformasi = $conn->query($queryInformasi);

    if ($resultInformasi->num_rows > 0) {
    // Menyimpan data ke dalam variabel masing-masing
    $informasi = $resultInformasi->fetch_assoc();
    $id_dd = $informasi['ID_DD'];
    $jenis_kelamin_dd = $informasi['Jenis_Kelamin_DD'];
    $usia_dd = $informasi['Usia_DD'];
    $pekerjaan_dd = $informasi['Pekerjaan_DD'];
    $sumber_dana_dd = $informasi['Sumber_Dana_DD'];
    $sumber_dana_tambahan_dd = $informasi['Sumber_Dana_Tambahan_DD'];
    $penghasilan_bersih_per_bulan_dd = $informasi['Penghasilan_Bersih_per_Bulan_DD'];
    $tujuan_dd = $informasi['Tujuan_DD'];
    $jenis_deposito_dd = $informasi['Jenis_Deposito_DD'];

    logMessage("Data informasi dengan ID_DD terbesar berhasil diambil");
    } else {
    logMessage("Tidak ada data ditemukan di tabel informasi");
    }

    // Mempersiapkan dan mengeksekusi pernyataan SQL untuk memasukkan data baru
    $stmt = $conn->prepare("INSERT INTO premi
    (ID_Premi, Jenis_Kelamin_Pr, Usia_Pr, Pekerjaan_Pr, Masa_Pertanggungan_Pr, Sumber_Dana_Pr, Sumber_Dana_Tambahan_Pr, Penghasilan_Bersih_per_Bulan_Pr, Tujuan_Pr, Jenis_Deposito_Pr, ID_DD) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // Memeriksa apakah persiapan pernyataan berhasil
    if (!$stmt) {
        logMessage("Prepare failed: " . $conn->error);
        die(json_encode(value: ["error" => "Prepare failed: " . $conn->error]));
    }

    // Mengikat parameter untuk dimasukkan ke dalam basis data
    $stmt->bind_param("isssssssssi",
    $data['ID_Premi'],
    $jenis_kelamin_dd,         // String
    $usia_dd,                  // Integer
    $pekerjaan_dd,             // String
    $data['Masa_Pertanggungan_Pr'],         // String
    $sumber_dana_dd,           // String
    $sumber_dana_tambahan_dd,  // String
    $penghasilan_bersih_per_bulan_dd, // String
    $tujuan_dd,                // String
    $jenis_deposito_dd,        // String
    $id_dd                     // Integer
);

    // Menjalankan pernyataan yang telah disiapkan
if ($stmt->execute()) {
    // Menjalankan skrip Python untuk melakukan perhitungan rekomendasi
    $command = 'python "C:\\xampp\\htdocs\\SKRIPSI\\PROGRAM - Copy (6)\\modelPR.py"';
    exec($command . ' 2>&1', $output, $return_var);

    // Memeriksa hasil eksekusi Python script
    if ($return_var !== 0) {
        logMessage("Error running Python script: " . implode("\n", $output));
        echo json_encode([
            "error" => "Failed to run prediction model",
            "details" => implode("\n", $output),
            "command" => $command,
            "return_var" => $return_var
        ]);
    } else {
        logMessage("Python script executed successfully");
        echo json_encode(["message" => "Data saved and processed successfully", "newId" => $newId]);
    }
} else {
    logMessage("Execute failed: " . $stmt->error);
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
}

// Menangani GET request untuk mengambil rekomendasi
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Menunggu sebentar untuk memastikan script Python selesai
    sleep(2);
    
    // Mengambil data terbaru dari tabel premi dan rekomendasi
    $sql = "SELECT pr.*, r.Premi_Rekomendasi 
            FROM premi pr 
            LEFT JOIN rekomendasi r ON r.ID_Rekomendasi = (
                SELECT MAX(ID_Rekomendasi) FROM rekomendasi
            )
            WHERE pr.ID_Premi = (
                SELECT MAX(ID_Premi) 
                FROM premi
            )";

    $result = $conn->query($sql);
    $response = array();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Menyiapkan data untuk response
        $response['premi'] = array(
            'max_id' => $row['ID_Premi'],
            'Jenis_Kelamin_Pr' => $row['Jenis_Kelamin_Pr'],
            'Usia_Pr' => $row['Usia_Pr'],
            'Pekerjaan_Pr' => $row['Pekerjaan_Pr'],
            'Sumber_Dana_Pr' => $row['Sumber_Dana_Pr'],
            'Sumber_Dana_Tambahan_Pr' => $row['Sumber_Dana_Tambahan_Pr'],
            'Masa_Pertanggungan_Pr' => $row['Masa_Pertanggungan_Pr'],
            'Penghasilan_Bersih_per_Bulan_Pr' => $row['Penghasilan_Bersih_per_Bulan_Pr'],
            'Tujuan_Pr' => $row['Tujuan_Pr'],
            'Jenis_Deposito_Pr' => $row['Jenis_Deposito_Pr']
        );

        // Menambahkan rekomendasi ke response
        $response['recommendation'] = $row['Premi_Rekomendasi'] ? 
            $row['Premi_Rekomendasi'] : 
            "Tidak ada rekomendasi";

        logMessage("Data berhasil diambil: " . json_encode($response));
    } else {
        $response['error'] = "Tidak ada data ditemukan";
        logMessage("Tidak ada data ditemukan");
    }

    // Mengirim response
    echo json_encode($response);
}

// Menutup koneksi database
$conn->close();
?>