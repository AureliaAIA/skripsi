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
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "program";

// Membuat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    $response = array("message" => "Koneksi database gagal: " . $conn->connect_error, "success" => false);
    echo json_encode($response);
    exit;
}

// Menerima data dari JavaScript
$data = json_decode(file_get_contents('php://input'), true);

// Periksa apakah ada data yang sudah disimpan sebelumnya
$sql = "SELECT MAX(ID_DD) AS max_id FROM informasi";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$max_id = $row["max_id"] ?? -1;

// Prepare SQL query
$sql = "INSERT INTO informasi (
    ID_DD,
    Jenis_Kelamin_DD,
    Usia_DD,
    Pekerjaan_DD,
    Sumber_Dana_DD,
    Sumber_Dana_Tambahan_DD,
    Penghasilan_Bersih_per_Bulan_DD,
    Tujuan_DD,
    Jenis_Deposito_DD
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

// Variabel untuk menyimpan status keberhasilan penyimpanan data
$savedData = [];
$failedData = [];
$errorLog = [];

// Loop untuk menyimpan seluruh data yang diterima
foreach ($data as $row) {
    $id = $max_id + 1;
    if ($max_id == -1) {
        $id = 0;
    }
    $stmt->bind_param(
        "sssssssss",
        $id,
        $row["Jenis_Kelamin_DD"],
        $row["Usia_DD"],
        $row["Pekerjaan_DD"],
        $row["Sumber_Dana_DD"],
        $row["Sumber_Dana_Tambahan_DD"],
        $row["Penghasilan_Bersih_per_Bulan_DD"],
        $row["Tujuan_DD"],
        $row["Jenis_Deposito_DD"]
    );

    if ($stmt->execute()) {
        $savedData[] = array_merge($row, ["ID_DD" => $id]);
        $max_id = $id;
    } else {
        $failedData[] = $row;
        $errorLog[] = array(
            "error" => $stmt->error,
            "data" => $row
        );
    }
}

// Mengembalikan respons sesuai dengan hasil penyimpanan data
if (count($failedData) == 0) {
    $response = array("message" => "Semua data berhasil disimpan", "success" => true, "data" => $savedData);
} else {
    $response = array(
        "message" => "Beberapa data gagal disimpan",
        "success" => false,
        "saved" => $savedData,
        "failed" => $failedData,
        "errorLog" => $errorLog
    );
}

echo json_encode($response);

$stmt->close();
$conn->close();
?>