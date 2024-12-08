<?php
// Mengatur agar data yang dikirimkan ke pengguna berbentuk JSON
header("Content-Type: application/json");

// Mengizinkan permintaan dari semua alamat situs (domain) lain
header("Access-Control-Allow-Origin: *");

// Mengizinkan hanya metode HTTP tertentu seperti POST, GET, dan OPTIONS untuk dipakai
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Mengizinkan penggunaan header "Content-Type" dalam permintaan, untuk menentukan jenis data
header("Access-Control-Allow-Headers: Content-Type");


// Konfigurasi koneksi ke database MySQL
$servername = "localhost";    // Nama server database
$username = "root";          // Username database
$password = "";              // Password database (kosong untuk development)
$dbname = "program";         // Nama database yang digunakan

// Fungsi untuk membulatkan bulan ke nilai yang valid (3, 6, 12, 24, 36, 60)
function roundToValidMonth($months) {
    // Daftar bulan yang valid dalam sistem
    $validMonths = [3, 6, 12, 24, 36, 60];
    // Mencari bulan terdekat dari input yang diberikan
    return $validMonths[array_reduce(array_keys($validMonths), function($carry, $idx) use ($validMonths, $months) {
        return (abs($validMonths[$idx] - $months) < abs($validMonths[$carry] - $months)) ? $idx : $carry;
    }, 0)];
}

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
    $query = "SELECT MAX(ID_Masa_Pertanggungan_Mp) as max_id FROM masa_pertanggungan";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'];
    // Jika maxId tidak ada, ID baru dimulai dari 0, jika ada, ID baru adalah maxId + 1
    $newId = ($maxId === null) ? 0 : $maxId + 1;

    // Menambahkan ID baru ke array data
    $data['ID_Masa_Pertanggungan_Mp'] = $newId;


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
    $stmt = $conn->prepare("INSERT INTO masa_pertanggungan 
    (ID_Masa_Pertanggungan_Mp, Jenis_Kelamin_Mp, Usia_Mp, Pekerjaan_Mp, Premi_Mp, Sumber_Dana_Mp, Sumber_Dana_Tambahan_Mp, Penghasilan_Bersih_per_Bulan_Mp, Tujuan_Mp, Jenis_Deposito_Mp, ID_DD) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // Memeriksa apakah persiapan pernyataan berhasil
    if (!$stmt) {
        logMessage("Prepare failed: " . $conn->error);
        die(json_encode(value: ["error" => "Prepare failed: " . $conn->error]));
    }

    // Mengikat parameter untuk dimasukkan ke dalam basis data
    $stmt->bind_param("isssssssssi",
    $data['ID_Masa_Pertanggungan_Mp'],
    $jenis_kelamin_dd,         // String
    $usia_dd,                  // Integer
    $pekerjaan_dd,             // String
    $data['Premi_Mp'],         // String
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
    $command = 'python "C:\\xampp\\htdocs\\SKRIPSI\\PROGRAM - Copy (6)\\modelMP.py"';
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
    sleep(1);
    
      // Mengambil data terbaru dari tabel masa_pertanggungan
    $sql = "SELECT mp.*, r.Masa_Pertanggungan_Rekomendasi 
            FROM masa_pertanggungan mp 
            LEFT JOIN rekomendasi r ON r.ID_Rekomendasi = (
                SELECT MAX(ID_Rekomendasi) FROM rekomendasi
            )
            WHERE mp.ID_Masa_Pertanggungan_Mp = (
                SELECT MAX(ID_Masa_Pertanggungan_Mp) 
                FROM masa_pertanggungan
            )";
    
    $result = $conn->query($sql);
    $response = array();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Menyiapkan data untuk response
        $response['masa_pertanggungan'] = array(
            'max_id' => $row['ID_Masa_Pertanggungan_Mp'],
            'Jenis_Kelamin_MP' => $row['Jenis_Kelamin_Mp'],
            'Usia_MP' => $row['Usia_Mp'],
            'Pekerjaan_MP' => $row['Pekerjaan_Mp'],
            'Sumber_Dana_MP' => $row['Sumber_Dana_Mp'],
            'Sumber_Dana_Tambahan_MP' => $row['Sumber_Dana_Tambahan_Mp'],
            'Premi_MP' => $row['Premi_Mp'],
            'Penghasilan_Bersih_per_Bulan_MP' => $row['Penghasilan_Bersih_per_Bulan_Mp'],
            'Tujuan_MP' => $row['Tujuan_Mp'],
            'Jenis_Deposito_MP' => $row['Jenis_Deposito_Mp']
        );
        
        // Menambahkan rekomendasi ke response
        $response['recommendation'] = $row['Masa_Pertanggungan_Rekomendasi'] ? 
            roundToValidMonth((int)$row['Masa_Pertanggungan_Rekomendasi']) : 
            "Tidak ada rekomendasi";
            
        logMessage("Data berhasil diambil: " . json_encode($response));
    } else {
        $response['error'] = "Tidak ada data ditemukan";
        logMessage("Tidak ada data ditemukan");
    }

    // Mengambil rekomendasi terbaru dari database
    $sql = "SELECT Masa_Pertanggungan_Rekomendasi FROM rekomendasi ORDER BY ID_Rekomendasi DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $recommendation = roundToValidMonth((int)$row["Masa_Pertanggungan_Rekomendasi"]);
        logMessage("Recommendation fetched and rounded: $recommendation");
    } else {
        $recommendation = "Tidak ada rekomendasi";
        logMessage("No recommendation found in database");
    }

    // Mengirim response
    echo json_encode($response);
}
 $conn->close();

?>