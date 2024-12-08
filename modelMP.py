# Import library yang dibutuhkan
import pandas as pd # Untuk manipulasi data dan analisis
import numpy as np  # Untuk operasi numerik
from sklearn.ensemble import RandomForestRegressor  # Model Random Forest untuk regresi
from sklearn.model_selection import cross_validate  # Untuk validasi silang model
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score  # Metrik evaluasi model
from sklearn.preprocessing import LabelEncoder  # Untuk mengubah data kategorikal menjadi numerik
import mysql.connector  # Untuk koneksi ke database MySQL
from math import sqrt  # Untuk perhitungan akar kuadrat
import re  # Untuk operasi regex
import logging  # Untuk pencatatan log aplikasi
from sklearn.utils import resample # Untuk melakukan resampling data

# Konfigurasi logging untuk mencatat aktivitas program
logging.basicConfig(filename='model.log', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Inisialisasi variabel global
valid_id_premi = None 
latest_id_premi = None  
premi_pr = None  

# Mencoba melakukan koneksi ke database MySQL
try:
    connection = mysql.connector.connect(
        host="localhost", # Nama server database
        user="root", # Username database
        password="", # Password database (kosong untuk development)
        database="program" # Nama database yang digunakan
    )
    cursor = connection.cursor()
    logging.info("Koneksi database berhasil")
except mysql.connector.Error as error:
    logging.error(f"Gagal terhubung ke database: {error}")
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
    cursor.execute("SELECT * FROM data")
    results_tabel_pertama = cursor.fetchall()
    # Membuat DataFrame dari hasil query dengan nama kolom yang sesuai
    df_data = pd.DataFrame(results_tabel_pertama, columns=[desc[0] for desc in cursor.description])
    logging.info(f"Data pelatihan berhasil diambil. Shape: {df_data.shape}")
except mysql.connector.Error as error:
    logging.error(f"Error saat mengambil data pelatihan: {error}")
    exit(1)

# Mengambil data pengujian terbaru dari tabel 'masa_pertanggungan'
try:
    query = "SELECT * FROM masa_pertanggungan WHERE ID_Masa_Pertanggungan_Mp = (SELECT MAX(ID_Masa_Pertanggungan_Mp) FROM masa_pertanggungan)"
    cursor.execute(query)
    result_tabel_kedua = cursor.fetchone()

    if result_tabel_kedua is None:
        logging.error("Data pengujian tidak ditemukan di tabel masa_pertanggungan")
        exit(1)

    # Membuat DataFrame dari hasil query
    columns = [desc[0] for desc in cursor.description]
    df_data2 = pd.DataFrame([result_tabel_kedua], columns=columns)
    logging.info(f"Data pengujian berhasil diambil. Shape: {df_data2.shape}")
except mysql.connector.Error as error:
    logging.error(f"Error saat mengambil data pengujian: {error}")
    exit(1)

# Menyiapkan data untuk pelatihan model
X_train_columns = ['Jenis_Kelamin_In', 'Pekerjaan_In', 'Sumber_Dana_In', 
                   'Sumber_Dana_Tambahan_In', 'Tujuan_In', 'Jenis_Deposito_In', 
                   'Penghasilan_Bersih_per_Bulan_In', 'Usia_In', 'Premi_In']
X_train = df_data[X_train_columns].copy() #Fitur untuk pelatihan
# Mengekstrak angka dari kolom Masa_Pertanggungan_In untuk target variabel
y_train = df_data['Masa_Pertanggungan_In'].str.extract(r'(\d+)').astype(int).values.ravel()

# Fungsi untuk memproses nilai premi
def process_premi(premi_str):
    try:
        # Membersihkan string dari karakter khusus
        cleaned = premi_str.replace('Rp', '').replace('.', '').replace(',', '')
        
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

# Proses dan normalisasi target variable
y_train_raw = df_data['Masa_Pertanggungan_In'].str.extract(r'(\d+)').astype(int).values.ravel()
y_train = normalize_premi(y_train_raw)

# Menyiapkan data pengujian
X_test_columns = ['Jenis_Kelamin_Mp', 'Pekerjaan_Mp', 'Sumber_Dana_Mp',
                  'Sumber_Dana_Tambahan_Mp', 'Tujuan_Mp', 'Jenis_Deposito_Mp',
                  'Penghasilan_Bersih_per_Bulan_Mp', 'Usia_Mp', 'Premi_Mp']
X_test = df_data2[X_test_columns].copy()

# Melakukan encoding untuk variabel kategorikal
le = LabelEncoder()
for col in X_train.columns:
    X_train[col] = le.fit_transform(X_train[col].astype(str))

# Menyamakan nama kolom test dengan train
# Memastikan urutan dan nama kolom sama 
X_test.columns = X_train.columns

# Inisialisasi dan melatih model Random Forest dengan bootstrap
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
num_bootstrap = 40 # Jumlah iterasi bootstrap
predictions = []
all_train_predictions = []
all_train_actual = []
mse_scores = []
rmse_scores = []
mae_scores = []
r2_scores = []

for _ in range(num_bootstrap):
    # Buat sampel bootstrap dari data training
    X_boot, y_boot = resample(X_train, y_train, replace=True, n_samples=len(X_train))
    
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
final_prediction = (sum(predictions) / num_bootstrap) * (max_val - min_val) + min_val
rounded_prediction = round(final_prediction)

# Logging untuk evaluasi model secara detail
logging.info("\n=== MODEL EVALUATION RESULTS ===")
logging.info(f"Number of bootstrap iterations: {num_bootstrap}")
logging.info("\nTraining Metrics:")
logging.info(f"Mean Squared Error (MSE)     : {mse_train:.4f}")
logging.info(f"Root Mean Squared Error (RMSE): {rmse_train:.4f}")
logging.info(f"Mean Absolute Error (MAE)     : {mae_train:.4f}")
logging.info(f"R-squared Score              : {r2_train:.4f}")

# Menyimpan hasil prediksi ke database
try:
    # Mendapatkan ID rekomendasi berikutnya
    cursor.execute("SELECT MAX(ID_Rekomendasi) FROM rekomendasi")
    max_id_rekomendasi = cursor.fetchone()[0]
    next_id_rekomendasi = 1 if max_id_rekomendasi is None else max_id_rekomendasi + 1
    # Mendapatkan ID masa pertanggungan terbaru
    cursor.execute("SELECT MAX(ID_Masa_Pertanggungan_Mp) FROM masa_pertanggungan")
    latest_id_masa_pertanggungan = cursor.fetchone()[0]
    
    # Mencatat nilai-nilai yang akan dimasukkan
    logging.info(f"Inserting: ID_Rekomendasi={next_id_rekomendasi}, ID_Masa_Pertanggungan={latest_id_masa_pertanggungan}, ID_Premi={valid_id_premi}, Masa_Pertanggungan_Rekomendasi={rounded_prediction}, Premi_Rekomendasi=0")
    
    # Query untuk menyimpan hasil prediksi
    insert_query = """
    INSERT INTO rekomendasi (ID_Rekomendasi, ID_Masa_Pertanggungan_Mp, ID_Premi, Masa_Pertanggungan_Rekomendasi, Premi_Rekomendasi)
    VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (next_id_rekomendasi, latest_id_masa_pertanggungan, valid_id_premi, rounded_prediction, 0))
    connection.commit()
    logging.info(f"Prediksi {rounded_prediction} bulan berhasil disimpan ke database.")
except mysql.connector.Error as error:
    logging.error(f"Gagal menyimpan prediksi ke database: {error}")
    connection.rollback()

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

# # BUAT TABEL PENGUJIAN PROPOSAL
# print(X_train)
# print(df_data)
# print(df_data2)

# # Mengambil data untuk tabel pengujian
# try:
#     cursor.execute("SELECT * FROM data")
#     results_tabel_pertama = cursor.fetchall()
#     df_data3 = pd.DataFrame(results_tabel_pertama, columns=[desc[0] for desc in cursor.description])
#     logging.info(f"Data pelatihan berhasil diambil. Shape: {df_data3.shape}")
# except mysql.connector.Error as error:
#     logging.error(f"Error saat mengambil data pelatihan: {error}")
#     exit(1)

# #Menyiapkan kolom untuk nilai aktual
# Nilai_Aktual_Columns = ['Jenis_Kelamin_In', 'Pekerjaan_In', 'Sumber_Dana_In', 'Masa_Pertanggungan_In', 
#                    'Sumber_Dana_Tambahan_In', 'Tujuan_In', 'Jenis_Deposito_In', 
#                    'Penghasilan_Bersih_per_Bulan_In', 'Usia_In', 'Premi_In']
# Z_train = df_data3[Nilai_Aktual_Columns].copy()

#  # Hilangkan kata "bulan" dari kolom Masa_Pertanggungan_In
# df_data3['Masa_Pertanggungan_In'] = df_data3['Masa_Pertanggungan_In'].str.replace(' bulan', '', regex=False)
    
# # Encoding variabel kategorikal untuk pengujian
# le = LabelEncoder()
# columns_to_encode = [col for col in Nilai_Aktual_Columns if col != 'Masa_Pertanggungan_In']
# for col in columns_to_encode:
#     df_data3[col] = le.fit_transform(Z_train[col].astype(str))
    
# # print("\nTabel data 3")
# # print(df_data3) 

# # Fungsi untuk mengecek kesesuaian data
# def check_matching_criteria(row, global_vars):
#     matches = 0
    
#     # Memeriksa setiap kriteria
#     if str(row['Premi_In']) == str(global_vars['premi_mp']):
#         matches += 1

#     if str(row['Sumber_Dana_Tambahan_In']) == str(global_vars['sumber_dana_tambahan_mp']):
#         matches += 1

#     if str(row['Penghasilan_Bersih_per_Bulan_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1

#     if str(row['Jenis_Kelamin_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1
        
#     if str(row['Usia_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1

#     if str(row['Pekerjaan_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1

#     if str(row['Sumber_Dana_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1

#     if str(row['Tujuan_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1

#     if str(row['Jenis_Deposito_In']) == str(global_vars['penghasilan_bersih_per_bulan_mp']):
#         matches += 1
    
#     return matches

# # Fungsi untuk mendapatkan kategori kesesuaian
# def get_matching_category(matches):
#     if matches == 9:
#         return "Sama dengan sembilan variabel"
#     if matches == 8:
#         return "Sama dengan delapan variabel"
#     if matches == 7:
#         return "Sama dengan tujuh variabel"
#     if matches == 6:
#         return "Sama dengan enam variabel"
#     if matches == 5:
#         return "Sama dengan lima variabel"
#     if matches == 4:
#         return "Sama dengan empat variabel"
#     if matches == 3:
#         return "Sama dengan ketiga variabel"
#     elif matches == 2:
#         return "Sama dengan dua variabel"
#     elif matches == 1:
#         return "Sama dengan satu variabel"
#     else:
#         return "Tidak ada"
    
# try:
#     # Mengambil data dari DataFrame df_data2 dan menyimpannya ke dalam variabel
#     premi = df_data2['Premi_Mp'].iloc[0]
#     sumber_dana_tambahan = df_data2['Sumber_Dana_Tambahan_Mp'].iloc[0]
#     penghasilan = df_data2['Penghasilan_Bersih_per_Bulan_Mp'].iloc[0]
#     jenis_kelamin = df_data2['Jenis_Kelamin_Mp'].iloc[0]
#     usia = df_data2['Usia_Mp'].iloc[0]
#     sumber_dana = df_data2['Sumber_Dana_Mp'].iloc[0]
#     tujuan = df_data2['Tujuan_Mp'].iloc[0]
#     jenis_deposito = df_data2['Jenis_Deposito_Mp'].iloc[0]
#     pekerjaan = df_data2['Pekerjaan_Mp'].iloc[0]
    
#     # Mencatat (logging) semua variabel yang berhasil disimpan untuk keperluan debugging
#     logging.info(f"Premi: {premi}")
#     logging.info(f"Sumber Dana Tambahan: {sumber_dana_tambahan}")
#     logging.info(f"Penghasilan Bersih per Bulan: {penghasilan}")
#     logging.info(f"Jenis_Kelamin: {jenis_kelamin}")
#     logging.info(f"Usia: {usia}")
#     logging.info(f"Sumber_Dana: {sumber_dana}")
#     logging.info(f"Tujuan: {tujuan}")
#     logging.info(f"Pekerjaan: {pekerjaan}")
#     logging.info(f"Jenis_Deposito: {jenis_deposito}")
    
#     # Menyimpan semua variabel ke dalam dictionary untuk memudahkan penggunaan
#     global_variables = {
#         'premi_mp': premi,
#         'sumber_dana_tambahan_mp': sumber_dana_tambahan,
#         'penghasilan_bersih_per_bulan_mp': penghasilan,
#         'jenis_kelamin_mp': jenis_kelamin,
#         'sumber_dana_mp': sumber_dana,
#         'usia_mp': usia,
#         'pekerjaan_mp': pekerjaan,
#         'tujuan_mp': tujuan,
#         'jenis_deposito_mp': jenis_deposito
#     }
    
#     # Menjadikan variabel-variabel tersebut sebagai variabel global
#     globals().update(global_variables)
    
#      # Membuat list kosong untuk menyimpan hasil pencocokan dan masa pertanggungan
#     matching_results = []
#     masa_pertanggungan_values = []
    
#     # Melakukan pengecekan kesesuaian untuk setiap baris di df_data3
#     for index, row in df_data3.iterrows():
#         # Mengecek kriteria yang cocok
#         matches = check_matching_criteria(row, global_variables)
#         # Menentukan kategori kesesuaian berdasarkan jumlah kriteria yang cocok
#         category = get_matching_category(matches)
        
#         # Simpan hasil pengecekan dan masa pertanggungan
#         matching_results.append(category)
#         # Jika ada kecocokan, simpan masa pertanggungannya
#         if category != "Tidak ada":
#             masa_pertanggungan_values.append(row['Masa_Pertanggungan_In'])
#         else:
#             masa_pertanggungan_values.append(None)
    
#     # Menambahkan kolom baru ke df_data3 untuk hasil pencocokan
#     df_data3['Kategori_Kesesuaian'] = matching_results
#     df_data3['Masa_Pertanggungan_Match'] = masa_pertanggungan_values
    
# # Mencatat bahwa proses pengecekan telah selesai
#     logging.info("Hasil pengecekan kesesuaian variabel selesai")
    
#     # Tampilkan ringkasan hasil
#     # print("\nRingkasan Hasil Pengecekan:")
#     # print("-" * 40)
#     # print(df_data3['Kategori_Kesesuaian'].value_counts())
    
#     # Menyaring data yang memiliki kecocokan (tidak termasuk kategori "Tidak ada")
#     matching_data = df_data3[df_data3['Kategori_Kesesuaian'] != "Tidak ada"]
#     if not matching_data.empty:
#         # print("\nDetail data yang sesuai:")
#         # print("-" * 40)
#         # print(matching_data[['Premi_In', 'Sumber_Dana_Tambahan_In', 
#         #                    'Penghasilan_Bersih_per_Bulan_In', 'Jenis_Kelamin_In', 'Usia_In', 'Pekerjaan_In', 'Sumber_Dana_In', 'Tujuan_In', 'Jenis_Deposito_In', 
#         #                    'Masa_Pertanggungan_In', 
#         #                    'Kategori_Kesesuaian']])
        
#         # Mencatat data yang cocok ke dalam log
#         logging.info("Data yang memiliki kecocokan ditemukan:")
#         for idx, row in matching_data.iterrows():
#             logging.info(f"Baris {idx}: {row['Kategori_Kesesuaian']} - Masa Pertanggungan: {row['Masa_Pertanggungan_In']}")
#     else:
#         print("\nTidak ada data yang cocok dengan kriteria")
#         logging.info("Tidak ada data yang memiliki kecocokan")
        
# except Exception as e:
#     # Mencatat error jika terjadi masalah saat menyimpan variabel
#     logging.error(f"Error saat menyimpan variabel dari df_data2: {e}")
#     raise

# # Verifikasi variabel tersimpan
# print("Variabel yang berhasil disimpan:")
# print(f"Premi_Mp: {premi}")
# print(f"Sumber_Dana_Tambahan_Mp: {sumber_dana_tambahan}")
# print(f"Penghasilan_Bersih_per_Bulan_Mp: {penghasilan}")
# print(f"Jenis_Kelamin_Mp: {jenis_kelamin}")
# print(f"Usia_Mp: {usia}")
# print(f"Pekerjaan_Mp: {pekerjaan}")
# print(f"Sumber_Dana_Mp: {sumber_dana}")
# print(f"Tujuan_Mp: {tujuan}")
# print(f"Jenis_Deposito_Mp: {jenis_deposito}")

# # Fungsi untuk mengubah kategori kesesuaian menjadi nilai numerik
# def get_matching_score(category):
#     # Dictionary yang menentukan nilai score untuk setiap kategori
#     matching_scores = {
#         "Sama dengan sembilan variabel": 9,
#         "Sama dengan delapan variabel": 8,
#         "Sama dengan tujuh variabel": 7,
#         "Sama dengan enam variabel": 6,
#         "Sama dengan lima variabel": 5,
#         "Sama dengan empat variabel": 4,
#         "Sama dengan ketiga variabel": 3,
#         "Sama dengan dua variabel": 2,
#         "Sama dengan satu variabel": 1,
#         "Tidak ada": 0
#     }
#     return matching_scores.get(category, 0)

# # Filter data yang memiliki kecocokan
# matching_data = df_data3[df_data3['Kategori_Kesesuaian'] != "Tidak ada"].copy()

# # Menambahkan kolom score berdasarkan kategori kesesuaian
# matching_data['matching_score'] = matching_data['Kategori_Kesesuaian'].apply(get_matching_score)

# # Mengurutkan data berdasarkan score tertinggi
# most_matching_data = matching_data.sort_values(by='matching_score', ascending=False)

# # Mengambil data dengan matching score tertinggi
# highest_matching_score = most_matching_data['matching_score'].max()
# best_matches = most_matching_data[most_matching_data['matching_score'] == highest_matching_score]

# # Proses penyimpanan ke database MySQL
# try:
#     # Membuat koneksi ke database MySQL
#     connection = mysql.connector.connect(
#         host="localhost",
#         user="root",
#         password="",
#         database="program"
#     )
#     cursor = connection.cursor()
    
#     # Buat tabel baru jika belum ada
#     # Tabel ini akan menyimpan hasil pencocokan
#     create_table_query = """
#     CREATE TABLE IF NOT EXISTS matching_results (
#         id INT AUTO_INCREMENT PRIMARY KEY,
#         premi VARCHAR(255),
#         sumber_dana_tambahan VARCHAR(255),
#         penghasilan_bersih VARCHAR(255),
#         jenis_kelamin VARCHAR(255),
#         usia VARCHAR(255),
#         pekerjaan VARCHAR(255),
#         sumber_dana VARCHAR(255),
#         tujuan VARCHAR(255),
#         jenis_deposito VARCHAR(255),
#         masa_pertanggungan VARCHAR(255),
#         matching_score INT,
#         kategori_kesesuaian VARCHAR(255),
#         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#     )
#     """
#     cursor.execute(create_table_query)
    
#     # Simpan setiap data yang memiliki matching score tertinggi
#     for _, row in best_matches.iterrows():
#         insert_query = """
#         INSERT INTO matching_results 
#         (premi, sumber_dana_tambahan, penghasilan_bersih, jenis_kelamin, usia, pekerjaan, sumber_dana, tujuan, jenis_deposito, masa_pertanggungan, 
#          matching_score, kategori_kesesuaian)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """
#         values = (
#             str(row['Premi_In']),
#             str(row['Sumber_Dana_Tambahan_In']),
#             str(row['Penghasilan_Bersih_per_Bulan_In']),
#             str(row['Jenis_Kelamin_In']),
#             str(row['Usia_In']),
#             str(row['Pekerjaan_In']),
#             str(row['Sumber_Dana_In']),
#             str(row['Tujuan_In']),
#             str(row['Jenis_Deposito_In']),
#             str(row['Masa_Pertanggungan_In']),
#             int(row['matching_score']),
#             str(row['Kategori_Kesesuaian'])
#         )
#         cursor.execute(insert_query, values)
    
#     # Menyimpan perubahan ke database
#     connection.commit()
#     logging.info(f"Berhasil menyimpan {len(best_matches)} data dengan matching score tertinggi")
    
#     # Fungsi untuk mengekstrak angka dari string masa pertanggungan
#     def extract_months(masa_pertanggungan):
#         if isinstance(masa_pertanggungan, str):
#             # Mengekstrak angka dari string (misalnya "60 bulan" menjadi 60)
#             return int(re.findall(r'\d+', masa_pertanggungan)[0])
#         return masa_pertanggungan

# except mysql.connector.Error as error:
#     # Mencatat error jika terjadi masalah dengan database
#     logging.error(f"Error saat menyimpan data matching ke database: {error}")
#     connection.rollback()

# # Menghitung statistik dan akurasi
# try:
#     # Hitung mean dari masa_pertanggungan_In dari data terbaik
#     masa_pertanggungan_values = [extract_months(mp) for mp in best_matches['Masa_Pertanggungan_In']]
#     nilai_aktual = sum(masa_pertanggungan_values) / len(masa_pertanggungan_values)  # Menggunakan mean

#     # Hitung error absolut (selisih antara prediksi dan aktual)
#     absolute_error = abs(nilai_aktual - rounded_prediction)
    
#     # Hitung error dalam bentuk persentase
#     percentage_error = (absolute_error / nilai_aktual) * 100
    
#     # Menghitung akurasi (100% - percentage_error)
#     accuracy = 100 - percentage_error
    
#     # Tampilkan ringkasan hasil
#     print("\nRingkasan Data Matching Terbaik:")
#     print("-" * 60)
#     print(f"Total data dengan matching score tertinggi: {len(best_matches)}")
#     print(f"Nilai Aktual (Mean): {nilai_aktual:.2f}")  # Menampilkan dengan 2 desimal
#     print(f"Nilai Prediksi: {rounded_prediction}")
#     print(f"Error Absolut: {absolute_error:.2f} bulan")
#     print(f"Error Persentase: {percentage_error:.2f}%")
#     print(f"Akurasi: {accuracy:.2f}%")
#     print(f"Matching score: {highest_matching_score}")
#     print(f"Kategori kesesuaian: {best_matches['Kategori_Kesesuaian'].iloc[0]}")
#     # print("\nDetail data matching terbaik:")
#     # print(best_matches[[
#     #     'Premi_In', 
#     #     'Sumber_Dana_Tambahan_In',
#     #     'Penghasilan_Bersih_per_Bulan_In',
#     #     'Jenis_Kelamin_In',
#     #     'Usia_In',
#     #     'Pekerjaan_In',
#     #     'Sumber_Dana_In',
#     #     'Tujuan_In',
#     #     'Jenis_Deposito_In',
#     #     'Masa_Pertanggungan_In',
#     #     'Kategori_Kesesuaian',
#     #     'matching_score'
#     # ]].to_string())

# except Exception as e:
#     # Mencatat error jika terjadi masalah dalam perhitungan
#     logging.error(f"Error dalam menghitung mean: {e}")
#     print(f"Terjadi error: {e}")

# # Mengambil dan menganalisis data masa pertanggungan dari database
# try:
#     # Mengambil data masa pertanggungan dengan matching score tertinggi
#     cursor.execute("""
#         SELECT masa_pertanggungan 
#         FROM matching_results 
#         WHERE matching_score = (
#             SELECT MAX(matching_score) 
#             FROM matching_results
#         )
#     """)
    
#     results = cursor.fetchall()
    
#     if results:
#         # Mengekstrak angka dari string masa pertanggungan
#         masa_pertanggungan_values = [int(re.findall(r'\d+', result[0])[0]) for result in results]

#         # Menghitung rata-rata
#         mean_value = sum(masa_pertanggungan_values) / len(masa_pertanggungan_values)
        
#         # print("\nAnalisis Mean Masa Pertanggungan:")
#         # print("-" * 40)
#         # print(f"Mean: {mean_value:.2f} bulan")
#         # print("\nDistribusi Masa Pertanggungan:")
#         # print(f"Jumlah data: {len(masa_pertanggungan_values)}")
#         # print(f"Nilai minimum: {min(masa_pertanggungan_values)} bulan")
#         # print(f"Nilai maksimum: {max(masa_pertanggungan_values)} bulan")
            
#         # Log the results
#         logging.info(f"Mean masa pertanggungan: {mean_value:.2f} bulan")
        
#     else:
#         print("Tidak ada data matching yang ditemukan")
#         logging.warning("Tidak ada data untuk menghitung mean")

# except mysql.connector.Error as error:
#     print(f"Error saat mengakses database: {error}")
#     logging.error(f"Database error: {error}")

# Menutup koneksi database
cursor.close()
connection.close()

# #BUAT DIAGRAM
# # Create JSON data for visualizations
# import json

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

