# Import library yang dibutuhkan
import numpy as np  # Untuk operasi numerik
# np.random.seed(42)
import pandas as pd  # Untuk manipulasi data dan analisis
# Model Random Forest untuk regresi
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_validate  # Untuk validasi silang model
# Metrik evaluasi model
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
# Untuk mengubah data kategorikal menjadi numerik
from sklearn.preprocessing import LabelEncoder
import mysql.connector  # Untuk koneksi ke database MySQL
from math import sqrt  # Untuk perhitungan akar kuadrat
import re  # Untuk operasi regex
import logging  # Untuk pencatatan log aplikasi
import os  # untuk berinteraksi dengan sistem operasi
import json  # untuk membaca dan menulis data dalam format JSON
from sklearn.utils import resample  # Untuk melakukan resampling data

# Konfigurasi logging untuk mencatat aktivitas program
logging.basicConfig(filename='model_pr.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Mencoba melakukan koneksi ke database MySQL
try:
    connection = mysql.connector.connect(
        host="localhost",  # Nama server database
        user="root",  # Username database
        password="",  # Password database (kosong untuk development)
        database="program"  # Nama database yang digunakan
    )
    cursor = connection.cursor()
    logging.info("Database connection successful")
except mysql.connector.Error as error:
    # Jika koneksi gagal, catat error dan hentikan program
    logging.error(f"Failed to connect to database: {error}")
    exit(1)

# Fungsi ini digunakan untuk memeriksa dan mencatat struktur dari sebuah tabel database


def check_table_structure(cursor, table_name):
    # Menjalankan perintah SQL 'DESCRIBE' untuk mendapatkan informasi struktur tabel
    cursor.execute(f"DESCRIBE {table_name}")
    # Mengambil semua hasil query dan menyimpannya dalam variabel columns
    columns = cursor.fetchall()
    # Mencatat informasi nama tabel ke dalam log
    logging.info(f"Structure of table '{table_name}':")
    # Melakukan loop untuk setiap kolom yang ada
    for column in columns:
        # Mencatat nama kolom (column[0]) dan tipe datanya (column[1]) ke dalam log
        # Format output: nama_kolom - tipe_data
        logging.info(f"  {column[0]} - {column[1]}")
    # Mengembalikan informasi kolom-kolom yang sudah didapatkan
    return columns


# Mengambil data pelatihan dari tabel 'data'
try:
    # Query untuk mengambil semua data dari tabel 'data'
    query1 = "SELECT * FROM data"
    cursor.execute(query1)
    results_tabel_pertama = cursor.fetchall()

    # Membuat DataFrame dari hasil query dengan nama kolom yang sesuai
    df_data = pd.DataFrame(results_tabel_pertama, columns=[
                           desc[0] for desc in cursor.description])
    logging.info(f"Training data fetched. Shape: {df_data.shape}")
except mysql.connector.Error as error:
    logging.error(f"Error fetching training data: {error}")
    exit(1)

# Mengambil data pengujian terbaru dari tabel 'masa_pertanggungan'
try:
    # Query untuk mengambil data premi terbaru
    query2 = "SELECT * FROM premi WHERE Id_Premi = (SELECT MAX(Id_Premi) FROM premi)"
    cursor.execute(query2)
    result_tabel_kedua = cursor.fetchone()

    if result_tabel_kedua is not None:
        # Membuat DataFrame dari hasil query
        columns_from_db = [desc[0] for desc in cursor.description]
        df_data2 = pd.DataFrame([result_tabel_kedua], columns=columns_from_db)
        logging.info(f"Testing data fetched. Shape: {df_data2.shape}")
    else:
        logging.error("No data returned for the latest premi entry.")
        exit(1)
except mysql.connector.Error as error:
    logging.error(f"Error fetching testing data: {error}")
    exit(1)

# Menyiapkan data untuk pelatihan model
X_train_columns = ['Jenis_Kelamin_In', 'Pekerjaan_In', 'Sumber_Dana_In',
                   'Sumber_Dana_Tambahan_In', 'Tujuan_In', 'Jenis_Deposito_In',
                   'Penghasilan_Bersih_per_Bulan_In', 'Usia_In', 'Masa_Pertanggungan_In']
X_train = df_data[X_train_columns].copy()  # Fitur untuk pelatihan

# Fungsi untuk memproses nilai premi


def process_premi(premi_str):
    try:
        # Membersihkan string dari karakter khusus
        cleaned = premi_str.replace('Rp', '').replace('.', '').replace('.', '')

        # Menangani kasus "Lebih dari X"
        if 'Lebihdari' in cleaned:
            value = re.findall(r'\d+', cleaned)[0]
            return int(value) * 1.1

        # Menangani kasus rentang nilai (misal: "1000-2000")
        if '-' in cleaned:
            low, high = map(int, cleaned.split('-'))
            return (low + high) // 2

        return int(cleaned)
    except ValueError:
        logging.warning(f"Couldn't process value: {premi_str}. Using default.")
        return 0


def normalize_premi(premi_values):
    # Normalisasi nilai premi ke dalam skala 0-1
    min_val = min(premi_values)
    max_val = max(premi_values)
    return [(x - min_val) / (max_val - min_val) if max_val > min_val else 0 for x in premi_values]


# Setelah memproses kolom target (Premi_In)
y_train_raw = df_data['Premi_In'].apply(process_premi)
# Normalisasi nilai premi
y_train = normalize_premi(y_train_raw)

# Menyiapkan data pengujian
X_test_columns = ['Jenis_Kelamin_Pr', 'Pekerjaan_Pr', 'Sumber_Dana_Pr',
                  'Sumber_Dana_Tambahan_Pr', 'Tujuan_Pr', 'Jenis_Deposito_Pr',
                  'Penghasilan_Bersih_per_Bulan_Pr', 'Usia_Pr', 'Masa_Pertanggungan_Pr']
X_test = df_data2[X_test_columns].copy()

# Melakukan encoding untuk variabel kategorikal
le = LabelEncoder()
for col in X_train.columns:
    X_train[col] = le.fit_transform(X_train[col].astype(str))

# Menyamakan nama kolom test dengan train
X_test.columns = X_train.columns

# Inisialisasi dan melatih model Random Forest dengan bootstrap
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
num_bootstrap = 40  # Jumlah iterasi bootstrap
predictions = []
all_train_predictions = []
all_train_actual = []
mse_scores = []
rmse_scores = []
mae_scores = []
r2_scores = []

for _ in range(num_bootstrap):
    # Buat sampel bootstrap dari data training
    X_boot, y_boot = resample(
        X_train, y_train, replace=True, n_samples=len(X_train))

    # Latih model pada sampel bootstrap
    rf_model.fit(X_boot, y_boot)

    # Prediksi pada data pengujian
    y_pred = rf_model.predict(X_test)
    predictions.append(y_pred[0])

    # Simpan prediksi training untuk evaluasi
    y_train_pred = rf_model.predict(X_train)
    all_train_predictions.extend(y_train_pred)
    all_train_actual.extend(y_train)

# Hitung metrik evaluasi sekali saja menggunakan semua prediksi
mse_train = mean_squared_error(all_train_actual, all_train_predictions)
rmse_train = sqrt(mse_train)
mae_train = mean_absolute_error(all_train_actual, all_train_predictions)
r2_train = r2_score(all_train_actual, all_train_predictions)

# Denormalisasi prediksi untuk hasil akhir
min_val = min(y_train_raw)
max_val = max(y_train_raw)
final_prediction = (sum(predictions) / num_bootstrap) * \
    (max_val - min_val) + min_val
# rounded_prediction = round(final_prediction)

# Logging untuk evaluasi model secara detail
logging.info("\n=== MODEL EVALUATION RESULTS ===")
logging.info(f"Number of bootstrap iterations: {num_bootstrap}")
logging.info("\nTraining Metrics:")
logging.info(f"Mean Squared Error (MSE)     : {mse_train:.4f}")
logging.info(f"Root Mean Squared Error (RMSE): {rmse_train:.4f}")
logging.info(f"Mean Absolute Error (MAE)     : {mae_train:.4f}")
logging.info(f"R-squared Score              : {r2_train:.4f}")

# # Melatih model dengan seluruh data training
# rf_model.fit(X_train, y_train)
# logging.info("Random Forest model trained successfully")

# # Melakukan prediksi premi
# prediction = rf_model.predict(X_test)
# print(f"Predicted Insurance Period: {prediction}")

# Fungsi untuk memformat hasil prediksi premi asuransi
# Menggunakan rumus Slovin dengan margin error:
# - 0.2 (20%) untuk populasi kecil
# - 0.1 (10%) untuk populasi besar


def format_prediction(value):
    # Membulatkan nilai ke kelipatan 1 juta terdekat
    rounded = round(value / 1000000) * 1000000
    # Menghitung batas bawah (80% dari nilai pembulatan)
    lower = rounded * 0.8
    # Menghitung batas atas (120% dari nilai pembulatan)
    upper = rounded * 1.2
    # Memformat angka dengan pemisah ribuan menggunakan titik
    lower_str = f"{lower:,.0f}".replace(",", ".")
    upper_str = f"{upper:,.0f}".replace(",", ".")
    # Mengembalikan string dengan format: "RpX.XXX.XXX - RpY.YYY.YYY"
    return f"Rp{lower_str} - Rp{upper_str}"


# Memformat hasil prediksi menggunakan fungsi di atas
formatted_prediction = format_prediction(final_prediction)
print(f"\nPredicted Premium: {formatted_prediction}")
# Mencatat hasil prediksi ke dalam log
logging.info(f"Predicted Premium: {formatted_prediction}")

# Inisialisasi variabel-variabel yang akan digunakan
valid_id_masa_pertanggungan = None  # ID masa pertanggungan yang valid
next_id_rekomendasi = None          # ID rekomendasi berikutnya
latest_id_premi = None              # ID premi terakhir
masa_pertanggungan_pr = None        # Masa pertanggungan

try:
    # Memeriksa struktur tabel-tabel yang terkait
    premi_columns = check_table_structure(cursor, "premi")
    masa_pertanggungan_columns = check_table_structure(
        cursor, "masa_pertanggungan")
    rekomendasi_columns = check_table_structure(cursor, "rekomendasi")

    # Mengambil ID_Premi terakhir dari tabel premi
    cursor.execute("SELECT MAX(ID_Premi) FROM premi")
    latest_id_premi = cursor.fetchone()[0]
    if latest_id_premi is None:
        logging.error("No records found in premi table")
        exit(1)
    logging.info(f"Latest ID_Premi: {latest_id_premi}")

    # Menentukan ID_Rekomendasi berikutnya
    cursor.execute("SELECT MAX(ID_Rekomendasi) FROM rekomendasi")
    max_id_rekomendasi = cursor.fetchone()[0]
    next_id_rekomendasi = (max_id_rekomendasi +
                           1) if max_id_rekomendasi is not None else 1
    logging.info(f"Next ID_Rekomendasi: {next_id_rekomendasi}")

    # Mengambil data premi terakhir
    cursor.execute("""
    SELECT Jenis_Kelamin_Pr, Usia_Pr, Pekerjaan_Pr, Sumber_Dana_Pr, Sumber_Dana_Tambahan_Pr,
           Penghasilan_Bersih_per_Bulan_Pr, Tujuan_Pr, Jenis_Deposito_Pr, Masa_Pertanggungan_Pr
    FROM premi WHERE ID_Premi = %s
    """, (latest_id_premi,))
    premi_result = cursor.fetchone()
    if not premi_result:
        logging.error(f"No premi data found for ID_Premi: {latest_id_premi}")
        exit(1)

    # Membuat dictionary dari data premi
    premi_data = dict(
        zip([col[0] for col in cursor.description], premi_result))
    logging.info(f"Premi data: {premi_data}")

    # Membuat query untuk mencari masa pertanggungan yang sesuai
    query_conditions = []
    query_params = []
    for col in masa_pertanggungan_columns:
        if col[0].endswith('_Mp') and col[0][:-3] + '_Pr' in premi_data:
            query_conditions.append(f"{col[0]} = %s")
            query_params.append(premi_data[col[0][:-3] + '_Pr'])

    if not query_conditions:
        logging.error(
            "No matching columns found between premi and masa_pertanggungan")
        exit(1)

    # Menyusun dan menjalankan query untuk mencari ID_Masa_Pertanggungan yang sesuai
    masa_pertanggungan_query = f"""
    SELECT ID_Masa_Pertanggungan_Mp
    FROM masa_pertanggungan
    WHERE {' AND '.join(query_conditions)}
    """
    logging.info(f"Masa pertanggungan query: {masa_pertanggungan_query}")
    logging.info(f"Query parameters: {query_params}")

    cursor.execute(masa_pertanggungan_query, tuple(query_params))
    masa_pertanggungan_result = cursor.fetchone()

    # Menyimpan ID_Masa_Pertanggungan jika ditemukan
    if masa_pertanggungan_result:
        valid_id_masa_pertanggungan = masa_pertanggungan_result[0]
        logging.info(f"Valid ID_Masa_Pertanggungan: {
                     valid_id_masa_pertanggungan}")
    else:
        logging.warning(
            "No matching masa_pertanggungan found. Setting ID_Masa_Pertanggungan to NULL.")
        valid_id_masa_pertanggungan = None

    # Mencatat semua nilai sebelum dimasukkan ke database
    logging.info(f"Inserting: ID_Rekomendasi={next_id_rekomendasi}, ID_Masa_Pertanggungan={valid_id_masa_pertanggungan}, ID_Premi={
                 latest_id_premi}, Masa_Pertanggungan_Rekomendasi=0, Premi_Rekomendasi={formatted_prediction}")

    # Memasukkan hasil prediksi ke dalam tabel rekomendasi
    insert_query = """
    INSERT INTO rekomendasi 
    (ID_Rekomendasi, ID_Masa_Pertanggungan_Mp, ID_Premi, Masa_Pertanggungan_Rekomendasi, Premi_Rekomendasi)
    VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (next_id_rekomendasi,
                   valid_id_masa_pertanggungan, latest_id_premi, 0, formatted_prediction))

    # Memeriksa apakah proses insert berhasil
    if cursor.rowcount > 0:
        logging.info(f"Successfully inserted {
                     cursor.rowcount} row(s) into rekomendasi table.")
    else:
        logging.warning("No rows were inserted into rekomendasi table.")

    # Melakukan commit transaksi
    connection.commit()
    logging.info("Transaction committed successfully.")

    # Memverifikasi hasil insert
    cursor.execute(
        "SELECT * FROM rekomendasi WHERE ID_Rekomendasi = %s", (next_id_rekomendasi,))
    verification_result = cursor.fetchone()
    if verification_result:
        logging.info(f"Verification successful. Inserted row: {
                     verification_result}")
    else:
        logging.error(f"Verification failed. No row found with ID_Rekomendasi = {
                      next_id_rekomendasi}")

# Menangani error yang mungkin terjadi
except mysql.connector.Error as error:
    # Error yang berkaitan dengan MySQL
    # Membatalkan transaksi jika terjadi error
    logging.error(f"MySQL Error: {error}")
    connection.rollback()
except Exception as e:
    # Error umum lainnya
    logging.error(f"An unexpected error occurred: {e}")
    connection.rollback()  # Membatalkan transaksi jika terjadi error

# Print out values for debugging
# print(f"Next ID Rekomendasi: {next_id_rekomendasi}, Latest ID Premi: {latest_id_premi}, Valid ID Masa Pertanggungan: {valid_id_masa_pertanggungan}, Predicted Premium: {formatted_prediction}")

# Menghitung dan mencatat variable importance
feature_importances = rf_model.feature_importances_
feature_importance_df = pd.DataFrame({
    'Feature': X_train.columns,
    'Importance': feature_importances
}).sort_values(by='Importance', ascending=False)

# Mencatat variable importance ke log
logging.info("Variable Importance:")
for i, row in feature_importance_df.iterrows():
    logging.info(f"{row['Feature']}: {row['Importance']:.4f}")

# BUAT TABEL PENGUJIAN PROPOSAL
# print(X_train)
# print(df_data)
# print(df_data2)

# Mengambil data untuk tabel pengujian
try:
    cursor.execute("SELECT * FROM data")
    results_tabel_pertama = cursor.fetchall()
    df_data3 = pd.DataFrame(results_tabel_pertama, columns=[
                            desc[0] for desc in cursor.description])
    logging.info(f"Data pelatihan berhasil diambil. Shape: {df_data3.shape}")
except mysql.connector.Error as error:
    logging.error(f"Error saat mengambil data pelatihan: {error}")
    exit(1)

# Menyiapkan kolom untuk nilai aktual
Nilai_Aktual_Columns = ['Jenis_Kelamin_In', 'Pekerjaan_In', 'Sumber_Dana_In', 'Masa_Pertanggungan_In',
                        'Sumber_Dana_Tambahan_In', 'Tujuan_In', 'Jenis_Deposito_In',
                        'Penghasilan_Bersih_per_Bulan_In', 'Usia_In', 'Premi_In']
Z_train = df_data3[Nilai_Aktual_Columns].copy()

# Encoding variabel kategorikal untuk pengujian
le = LabelEncoder()
columns_to_encode = [col for col in Nilai_Aktual_Columns if col != 'Premi_In']
for col in columns_to_encode:
    df_data3[col] = le.fit_transform(Z_train[col].astype(str))

# print("\nTabel data 3")
# print(df_data3)

# Fungsi untuk mengecek kesesuaian data


def check_matching_criteria(row, global_vars):
    matches = 0

    # Memeriksa setiap kriteria
    if str(row['Masa_Pertanggungan_In']) == str(global_vars['masa_pertanggungan_pr']):
        matches += 1

    if str(row['Sumber_Dana_Tambahan_In']) == str(global_vars['sumber_dana_tambahan_pr']):
        matches += 1

    if str(row['Penghasilan_Bersih_per_Bulan_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Jenis_Kelamin_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Usia_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Pekerjaan_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Sumber_Dana_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Tujuan_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    if str(row['Jenis_Deposito_In']) == str(global_vars['penghasilan_bersih_per_bulan_pr']):
        matches += 1

    return matches

# Fungsi untuk mendapatkan kategori kesesuaian


def get_matching_category(matches):
    if matches == 9:
        return "Sama dengan sembilan variabel"
    if matches == 8:
        return "Sama dengan delapn variabel"
    if matches == 7:
        return "Sama dengan tujuh variabel"
    if matches == 6:
        return "Sama dengan enam variabel"
    if matches == 5:
        return "Sama dengan lima variabel"
    if matches == 4:
        return "Sama dengan empat variabel"
    if matches == 3:
        return "Sama dengan ketiga variabel"
    elif matches == 2:
        return "Sama dengan dua variabel"
    elif matches == 1:
        return "Sama dengan satu variabel"
    else:
        return "Tidak ada"


try:
    # Mengambil data dari DataFrame df_data2 dan menyimpannya ke dalam variabel
    masa_pertanggungan = df_data2['Masa_Pertanggungan_Pr'].iloc[0]
    sumber_dana_tambahan = df_data2['Sumber_Dana_Tambahan_Pr'].iloc[0]
    penghasilan = df_data2['Penghasilan_Bersih_per_Bulan_Pr'].iloc[0]
    jenis_kelamin = df_data2['Jenis_Kelamin_Pr'].iloc[0]
    usia = df_data2['Usia_Pr'].iloc[0]
    sumber_dana = df_data2['Sumber_Dana_Pr'].iloc[0]
    tujuan = df_data2['Tujuan_Pr'].iloc[0]
    jenis_deposito = df_data2['Jenis_Deposito_Pr'].iloc[0]
    pekerjaan = df_data2['Pekerjaan_Pr'].iloc[0]

    # Mencatat (logging) semua variabel yang berhasil disimpan untuk keperluan debugging
    logging.info(f"Masa_Pertanggungan: {masa_pertanggungan}")
    logging.info(f"Sumber Dana Tambahan: {sumber_dana_tambahan}")
    logging.info(f"Penghasilan Bersih per Bulan: {penghasilan}")
    logging.info(f"Jenis_Kelamin: {jenis_kelamin}")
    logging.info(f"Usia: {usia}")
    logging.info(f"Sumber_Dana: {sumber_dana}")
    logging.info(f"Tujuan: {tujuan}")
    logging.info(f"Pekerjaan: {pekerjaan}")
    logging.info(f"Jenis_Deposito: {jenis_deposito}")

    # Menyimpan semua variabel ke dalam dictionary untuk memudahkan penggunaan
    global_variables = {
        'masa_pertanggungan_pr': masa_pertanggungan,
        'sumber_dana_tambahan_pr': sumber_dana_tambahan,
        'penghasilan_bersih_per_bulan_pr': penghasilan,
        'jenis_kelamin_pr': jenis_kelamin,
        'sumber_dana_pr': sumber_dana,
        'usia_pr': usia,
        'pekerjaan_pr': pekerjaan,
        'tujuan_pr': tujuan,
        'jenis_deposito_pr': jenis_deposito
    }

    # Menjadikan variabel-variabel tersebut sebagai variabel global
    globals().update(global_variables)

    # Membuat list kosong untuk menyimpan hasil pencocokan dan masa pertanggungan
    matching_results = []
    premi_values = []

    # Melakukan pengecekan kesesuaian untuk setiap baris di df_data3
    for index, row in df_data3.iterrows():
        # Mengecek kriteria yang cocok
        matches = check_matching_criteria(row, global_variables)
        # Menentukan kategori kesesuaian berdasarkan jumlah kriteria yang cocok
        category = get_matching_category(matches)

        # Simpan hasil pengecekan dan premi
        matching_results.append(category)
        # Jika ada kecocokan, simpan premi
        if category != "Tidak ada":
            premi_values.append(row['Premi_In'])
        else:
            premi_values.append(None)

    # Menambahkan kolom baru ke df_data3 untuk hasil pencocokan
    df_data3['Kategori_Kesesuaian'] = matching_results
    df_data3['Premi_Match'] = premi_values

    # Mencatat bahwa proses pengecekan telah selesai
    logging.info("Hasil pengecekan kesesuaian variabel selesai")

    # Tampilkan ringkasan hasil
    # print("\nRingkasan Hasil Pengecekan:")
    # print("-" * 40)
    # print(df_data3['Kategori_Kesesuaian'].value_counts())

    # Menyaring data yang memiliki kecocokan (tidak termasuk kategori "Tidak ada")
    matching_data = df_data3[df_data3['Kategori_Kesesuaian'] != "Tidak ada"]
    if not matching_data.empty:
        # print("\nDetail data yang sesuai:")
        # print("-" * 40)
        # print(matching_data[['Masa_Pertanggungan_In', 'Sumber_Dana_Tambahan_In',
        #                    'Penghasilan_Bersih_per_Bulan_In', 'Jenis_Kelamin_In', 'Usia_In', 'Pekerjaan_In', 'Sumber_Dana_In', 'Tujuan_In', 'Jenis_Deposito_In',
        #                    'Premi_In',
        #                    'Kategori_Kesesuaian']])

        # Mencatat data yang cocok ke dalam log
        logging.info("Data yang memiliki kecocokan ditemukan:")
        for idx, row in matching_data.iterrows():
            logging.info(f"Baris {idx}: {
                         row['Kategori_Kesesuaian']} - Premi: {row['Premi_In']}")
    else:
        print("\nTidak ada data yang cocok dengan kriteria")
        logging.info("Tidak ada data yang memiliki kecocokan")

except Exception as e:
    # Mencatat error jika terjadi masalah saat menyimpan variabel
    logging.error(f"Error saat menyimpan variabel dari df_data2: {e}")
    raise

# Verifikasi variabel tersimpan
# print("Variabel yang berhasil disimpan:")
# print(f"Masa_Pertanggungan_Pr: {masa_pertanggungan}")
# print(f"Sumber_Dana_Tambahan_Pr: {sumber_dana_tambahan}")
# print(f"Penghasilan_Bersih_per_Bulan_Pr: {penghasilan}")
# print(f"Jenis_Kelamin_Pr: {jenis_kelamin}")
# print(f"Usia_Pr: {usia}")
# print(f"Pekerjaan_Pr: {pekerjaan}")
# print(f"Sumber_Dana_Pr: {sumber_dana}")
# print(f"Tujuan_Pr: {tujuan}")
# print(f"Jenis_Deposito_Pr: {jenis_deposito}")

# Fungsi untuk mengubah kategori kesesuaian menjadi nilai numerik


def get_matching_score(category):
    # Dictionary yang menentukan nilai score untuk setiap kategori
    matching_scores = {
        "Sama dengan sembilan variabel": 9,
        "Sama dengan delapan variabel": 8,
        "Sama dengan tujuh variabel": 7,
        "Sama dengan enam variabel": 6,
        "Sama dengan lima variabel": 5,
        "Sama dengan empat variabel": 4,
        "Sama dengan ketiga variabel": 3,
        "Sama dengan dua variabel": 2,
        "Sama dengan satu variabel": 1,
        "Tidak ada": 0
    }
    return matching_scores.get(category, 0)


# Filter data yang memiliki kecocokan
matching_data = df_data3[df_data3['Kategori_Kesesuaian'] != "Tidak ada"].copy()

# Menambahkan kolom score berdasarkan kategori kesesuaian
matching_data['matching_score'] = matching_data['Kategori_Kesesuaian'].apply(
    get_matching_score)

# Mengurutkan data berdasarkan score tertinggi
most_matching_data = matching_data.sort_values(
    by='matching_score', ascending=False)

# Mengambil data dengan matching score tertinggi
highest_score = most_matching_data['matching_score'].max()
highest_matches = most_matching_data[most_matching_data['matching_score'] == highest_score]

# Fungsi untuk memproses rentang premi dari data yang memiliki skor kecocokan tertinggi


def process_premi_ranges(highest_matches):
    # Inisialisasi list untuk menyimpan nilai premi dan rentangnya
    premi_highest_matches = []
    premi_ranges = []

    # Fungsi untuk membersihkan dan mengkonversi nilai premi
    def clean_premi_value(value):
        cleaned = value.replace('Rp', '').replace(
            ' ', '').replace('.', '').strip()
        if 'Lebihdari' in cleaned:
            return cleaned.split('Lebihdari')[1]
        elif '-' in cleaned:
            return cleaned.split('-')[1].strip()
        else:
            return cleaned

    # Memproses setiap baris data match tertinggi
    for _, row in highest_matches.iterrows():
        premi_value = str(row['Premi_In'])

        # Jika nilai premi berupa rentang (contoh: "Rp1.000.000 - Rp2.000.000")
        if " - " in premi_value:
            # Memisah dan membersihkan nilai minimum dan maksimum
            min_val, max_val = map(clean_premi_value, premi_value.split(" - "))
            min_val = int(min_val)
            max_val = int(max_val)

            # Menghitung nilai tengah untuk premi
            premi_int = (min_val + max_val) // 2
            premi_highest_matches.append(premi_int)

            # Menyimpan rentang asli
            premi_ranges.append({
                'min': min_val,
                'max': max_val
            })
        else:
            # Proses seperti sebelumnya untuk nilai tunggal
            premi_value = clean_premi_value(premi_value)
            premi_int = int(premi_value)
            premi_highest_matches.append(premi_int)

            # # Membuat rentang ±20% dari nilai tunggal
            # premi_ranges.append({
            #     'min': int(premi_int * 0.8),  # 20% lebih rendah
            #     'max': int(premi_int * 1.2)   # 20% lebih tinggi
            # })

    # Tampilkan hasil premi original
    print("\nNilai Premi Original:")
    print("-" * 30)
    for i, premi in enumerate(premi_highest_matches, 1):
        print(f"Premi {i}: Rp {premi:,}")

    # Tampilkan hasil rentang
    print("\nRentang Premi (Min-Max):")
    print("-" * 50)
    print(f"{'No.':<4} {'Minimum':>15} {'Maximum':>15}")
    print("-" * 50)
    for i, range_dict in enumerate(premi_ranges, 1):
        print(f"{i:<4} Rp {range_dict['min']:>13,d} Rp {
              range_dict['max']:>13,d}")

    # Menghitung dan menampilkan statistik jika ada data rentang premi
    if premi_ranges:
        # Nilai minimum dari semua rentang
        min_all = min(r['min'] for r in premi_ranges)
        # Nilai maksimum dari semua rentang
        max_all = max(r['max'] for r in premi_ranges)
        avg_min = sum(r['min'] for r in premi_ranges) / \
            len(premi_ranges)  # Rata-rata minimum
        avg_max = sum(r['max'] for r in premi_ranges) / \
            len(premi_ranges)  # Rata-rata maksimum
        # Mengekstrak nilai prediksi dari string format currency
        min_prediction, max_prediction = map(lambda x: float(
            x.replace("Rp", "").replace(".", "")), formatted_prediction.split(" - "))

        # Menghitung akurasi prediksi
        min_accuracy = 1 - abs(avg_min - min_prediction) / \
            avg_min     # Akurasi prediksi minimum
        max_accuracy = 1 - abs(avg_max - max_prediction) / \
            avg_max     # Akurasi prediksi maksimum
        # Hitung akurasi minimum dan maksimum keseluruhan
        overall_accuracy_min = min_accuracy
        overall_accuracy_max = max_accuracy
        # Rata-rata akurasi
        avg_overall_accuracy = (min_accuracy + max_accuracy) / 2

        # Menampilkan hasil statistik
        print("\nStatistik Rentang Premi:")
        print("-" * 50)
        # print(f"Rentang minimum keseluruhan : Rp {min_all:,}")
        # print(f"Rentang maximum keseluruhan : Rp {max_all:,}")
        print(f"Rata-rata minimum          : Rp {int(avg_min):,}")
        print(f"Rata-rata maximum          : Rp {int(avg_max):,}")
        print(f"Hasil Prediksi {formatted_prediction}")
        print(f"Nilai prediksi premi minimum: Rp {min_prediction:,.0f}")
        print(f"Nilai prediksi premi maksimum: Rp {max_prediction:,.0f}")
        print(f"Akurasi minimum: {min_accuracy:.2%}")
        print(f"Akurasi maksimum: {max_accuracy:.2%}")
        print(f"Rata-rata akurasi keseluruhan: {avg_overall_accuracy:.2%}")
    return premi_highest_matches, premi_ranges


# Memanggil fungsi untuk memproses rentang premi
premi_matches, premi_ranges = process_premi_ranges(highest_matches)

# Proses penyimpanan ke database MySQL
try:
    # Membuat set untuk menyimpan variabel yang cocok
    all_matched_vars = set()  # Using a set to avoid duplicates

    # Memproses setiap record dengan kecocokan tertinggi
    for _, row in highest_matches.iterrows():
        # Menyimpan variabel yang cocok
        matched_vars = []

        # Memeriksa kecocokan untuk setiap variabel
        if str(row['Masa_Pertanggungan_In']) == str(masa_pertanggungan):
            matched_vars.append('Masa_Pertanggungan')
        if str(row['Sumber_Dana_Tambahan_In']) == str(sumber_dana_tambahan):
            matched_vars.append('Sumber_Dana_Tambahan')
        if str(row['Penghasilan_Bersih_per_Bulan_In']) == str(penghasilan):
            matched_vars.append('Penghasilan_Bersih')
        if str(row['Jenis_Kelamin_In']) == str(jenis_kelamin):
            matched_vars.append('Jenis_Kelamin')
        if str(row['Usia_In']) == str(usia):
            matched_vars.append('Usia')
        if str(row['Pekerjaan_In']) == str(pekerjaan):
            matched_vars.append('Pekerjaan')
        if str(row['Sumber_Dana_In']) == str(sumber_dana):
            matched_vars.append('Sumber_Dana')
        if str(row['Tujuan_In']) == str(tujuan):
            matched_vars.append('Tujuan')
        if str(row['Jenis_Deposito_In']) == str(jenis_deposito):
            matched_vars.append('Jenis_Deposito')

        # Menambahkan variabel yang cocok ke set keseluruhan
        all_matched_vars.update(matched_vars)

        # Menyimpan record ke dalam tabel highest_matches
        insert_highest_match = """
        INSERT INTO highest_matches 
        (id_premi, matching_score, num_matches, premi_actual, premi_predicted, variables_matched)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            latest_id_premi,
            int(row['matching_score']),
            len(matched_vars),
            str(row['Premi_In']),
            formatted_prediction,
            ', '.join(matched_vars)
        )

        cursor.execute(insert_highest_match, values)

    # Commit perubahan ke database
    connection.commit()
    logging.info(f"Successfully stored {
                 len(highest_matches)} highest matching records")

    # Now print all matched variables outside the loop
    # print(f"\nAll Variables matched: {', '.join(sorted(all_matched_vars))}")
    # print(f"Total number of matched variables: {len(all_matched_vars)}")
    # # Print summary of highest matches
    # print("\nHighest Matching Scores Summary:")
    # print("-" * 60)
    # print(f"Number of records with highest score ({highest_score}): {len(highest_matches)}")
    # print("\nMatched Records:")
    # print(highest_matches[['Premi_In', 'matching_score', 'Kategori_Kesesuaian']].to_string())

except mysql.connector.Error as error:
    # Menangani error database
    logging.error(f"Database error while storing highest matches: {error}")
    connection.rollback()
except Exception as e:
    # Menangani error umum
    logging.error(f"Unexpected error while processing highest matches: {e}")
    connection.rollback()

# Menutup koneksi database
cursor.close()
connection.close()
# print(f"Current working directory: {os.getcwd()}")

# #BUAT DIAGRAM
# # Prepare cross-validation metrics data
# cv_metrics_data = [
#     {"name": "MSE", "value": float(mse_train)},
#     {"name": "RMSE", "value": float(rmse_train)},
#     {"name": "MAE", "value": float(mae_train)},
#     {"name": "R²", "value": float(r2_train)}
# ]

# # Prepare feature importance data
# feature_importance_data = [
#     {"name": str(feature), "value": float(importance)}
#     for feature, importance in zip(X_train.columns, feature_importances)
# ]

# # Sort feature importance data by value
# feature_importance_data = sorted(feature_importance_data, key=lambda x: x["value"], reverse=True)

# # Save visualization data to JSON files
# try:
#     with open('cv_metrics.json', 'w') as f:
#         json.dump(cv_metrics_data, f)
#     with open('feature_importance.json', 'w') as f:
#         json.dump(feature_importance_data, f)
#     logging.info("Visualization data successfully saved to JSON files")
# except Exception as e:
#     logging.error(f"Error saving visualization data: {e}")

# import json
# import plotly.graph_objects as go

# # Baca data
# with open('cv_metrics.json', 'r') as f:
#     cv_data = json.load(f)

# with open('feature_importance.json', 'r') as f:
#     feature_data = json.load(f)

# # Plot Cross Validation Metrics
# fig1 = go.Figure(data=[
#     go.Bar(
#         x=[d['name'] for d in cv_data],
#         y=[d['value'] for d in cv_data],
#         text=[f"{d['value']:.4f}" for d in cv_data],  # Menambahkan teks nilai
#         textposition='outside',  # Posisi teks di luar bar
#         textangle=0  # Rotasi teks
#     )
# ])
# fig1.update_layout(
#     title='Cross Validation Metrics',
#     yaxis_title='Value',
#     xaxis_title='Metric',
#     showlegend=False,
#     width=800,
#     height=500,
#     # Menambahkan margin untuk memastikan label tidak terpotong
#     margin=dict(t=50, b=50, l=50, r=50)
# )

# # Tampilkan plot metrics
# fig1.show()

# # Plot Feature Importance
# fig2 = go.Figure(data=[
#     go.Bar(
#         x=[d['value'] for d in feature_data],
#         y=[d['name'] for d in feature_data],
#         orientation='h',
#         text=[f"{d['value']:.4f}" for d in feature_data],  # Menambahkan teks nilai
#         textposition='auto',  # Posisi teks otomatis
#     )
# ])
# fig2.update_layout(
#     title='Feature Importance',
#     xaxis_title='Importance Score',
#     yaxis_title='Feature',
#     showlegend=False,
#     width=1000,  # Lebar grafik lebih besar untuk nama fitur yang panjang
#     height=600,  # Tinggi grafik disesuaikan
#     # Menambahkan margin untuk memastikan label tidak terpotong
#     margin=dict(t=50, b=50, l=250, r=50)
# )

# # Tampilkan plot feature importance
# fig2.show()

# # Tambahan: Tampilkan nilai dalam format tabel
# print("\nCross Validation Metrics:")
# print("-" * 40)
# print(f"{'Metric':<10} {'Value':>10}")
# print("-" * 40)
# for d in cv_data:
#     print(f"{d['name']:<10} {d['value']:>10.4f}")

# print("\nFeature Importance Scores:")
# print("-" * 50)
# print(f"{'Feature':<30} {'Importance':>10}")
# print("-" * 50)
# for d in feature_data:
#     print(f"{d['name']:<30} {d['value']:>10.4f}")
