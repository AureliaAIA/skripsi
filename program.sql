-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 08, 2024 at 06:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `program`
--

-- --------------------------------------------------------

--
-- Table structure for table `data`
--

CREATE TABLE `data` (
  `ID_Data` varchar(50) NOT NULL,
  `Jenis_Kelamin_In` varchar(50) NOT NULL,
  `Usia_In` varchar(50) NOT NULL,
  `Pekerjaan_In` varchar(50) NOT NULL,
  `Premi_In` varchar(50) NOT NULL,
  `Sumber_Dana_In` varchar(50) NOT NULL,
  `Masa_Pertanggungan_In` varchar(50) NOT NULL,
  `Sumber_Dana_Tambahan_In` varchar(50) NOT NULL,
  `Penghasilan_Bersih_per_Bulan_In` varchar(50) NOT NULL,
  `Tujuan_In` varchar(50) NOT NULL,
  `Jenis_Deposito_In` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `data`
--

INSERT INTO `data` (`ID_Data`, `Jenis_Kelamin_In`, `Usia_In`, `Pekerjaan_In`, `Premi_In`, `Sumber_Dana_In`, `Masa_Pertanggungan_In`, `Sumber_Dana_Tambahan_In`, `Penghasilan_Bersih_per_Bulan_In`, `Tujuan_In`, `Jenis_Deposito_In`) VALUES
('0', 'Laki-laki', '28 - 38', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Tabungan', 'Rp5.000.000 - Rp10.000.000', 'Dana Darurat', 'ARO'),
('1', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Investasi', 'Non ARO'),
('10', 'Perempuan', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Tabungan', 'Rp5.000.000 - Rp10.000.000', 'Dana Darurat', 'ARO'),
('11', 'Perempuan', '50 - 60', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'ARO+'),
('12', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Dana Darurat', 'Non ARO'),
('13', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('14', 'Laki-laki', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '6 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'ARO'),
('15', 'Perempuan', '39 - 49', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Rp25.000.001 - Rp100.000.000', 'Dana Pensiun', 'ARO+'),
('16', 'Laki-laki', '17 - 27', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO'),
('17', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '36 bulan', 'Investasi', 'Lebih dari Rp100.000.001', 'Investasi', 'ARO+'),
('18', 'Laki-laki', '39 - 49', 'Pegawai Negeri', 'Lebih dari Rp100.000.001', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('19', 'Perempuan', '28 - 38', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Dana Darurat', 'ARO'),
('2', 'Perempuan', '39 - 49', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Warisan', 'Rp25.000.001 - Rp100.000.000', 'Dana Pensiun', 'ARO+'),
('20', 'Perempuan', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '3 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO'),
('21', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Pembelian aset', 'ARO'),
('22', 'Perempuan', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '12 bulan', 'Warisan', 'Rp25.000.001 - Rp100.000.000', 'Dana Pensiun', 'ARO+'),
('23', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO'),
('24', 'Laki-laki', '28 - 38', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO'),
('25', 'Perempuan', '39 - 49', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'ARO+'),
('26', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '12 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Investasi', 'Non ARO'),
('27', 'Perempuan', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '6 bulan', 'Tabungan', 'Rp25.000.001 - Rp100.000.000', 'Dana Darurat', 'ARO'),
('28', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO'),
('29', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '36 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('3', 'Laki-laki', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '3 bulan', 'Tabungan', 'Rp5.000.000 - Rp10.000.000', 'Dana Darurat', 'Non ARO'),
('30', 'Laki-laki', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('31', 'Perempuan', '28 - 38', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Pembelian aset', 'ARO'),
('32', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '12 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('33', 'Laki-laki', '39 - 49', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('34', 'Perempuan', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Tabungan', 'Rp5.000.000 - Rp10.000.000', 'Dana Darurat', 'ARO'),
('35', 'Perempuan', '39 - 49', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '12 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Investasi', 'ARO+'),
('36', 'Laki-laki', '39 - 49', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO'),
('37', 'Perempuan', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Warisan', 'Rp25.000.001 - Rp100.000.000', 'Dana Pensiun', 'ARO'),
('38', 'Laki-laki', '28 - 38', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '12 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Pembelian aset', 'Non ARO'),
('39', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '36 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('4', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '36 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Pembelian aset', 'ARO+'),
('40', 'Laki-laki', '17 - 27', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '3 bulan', 'Tabungan', 'Rp5.000.000 - Rp10.000.000', 'Dana Darurat', 'ARO'),
('41', 'Perempuan', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('42', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Pembelian aset', 'ARO'),
('43', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '12 bulan', 'Tabungan', 'Rp25.000.001 - Rp100.000.000', 'Pembelian aset', 'ARO+'),
('44', 'Perempuan', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('45', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'ARO'),
('46', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp50.000.001 - Rp100.000.000', 'Bisnis', '36 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('47', 'Laki-laki', '28 - 38', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Dana Pensiun', 'Non ARO'),
('48', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '3 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'ARO+'),
('49', 'Laki-laki', '39 - 49', 'Mahasiswa', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Investasi', 'ARO+'),
('5', 'Laki-laki', '39 - 49', 'Karyawan Swasta', 'Rp25.000.000 - Rp50.000.000', 'Gaji', '6 bulan', 'Investasi', 'Rp10.000.001 - Rp25.000.000', 'Investasi', 'ARO'),
('6', 'Perempuan', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Pembelian aset', 'Non ARO'),
('7', 'Laki-laki', '39 - 49', 'Pegawai Negeri', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '60 bulan', 'Warisan', 'Lebih dari Rp100.000.001', 'Investasi', 'ARO+'),
('8', 'Laki-laki', '28 - 38', 'Karyawan Swasta', 'Rp50.000.001 - Rp100.000.000', 'Gaji', '24 bulan', 'Investasi', 'Rp25.000.001 - Rp100.000.000', 'Dana Pensiun', 'ARO'),
('9', 'Laki-laki', '28 - 38', 'Wirausaha', 'Rp25.000.000 - Rp50.000.000', 'Bisnis', '12 bulan', 'Tabungan', 'Rp10.000.001 - Rp25.000.000', 'Dana Darurat', 'Non ARO');

-- --------------------------------------------------------

--
-- Table structure for table `highest_matches`
--

CREATE TABLE `highest_matches` (
  `id` int(11) NOT NULL,
  `id_premi` int(11) DEFAULT NULL,
  `matching_score` int(11) DEFAULT NULL,
  `num_matches` int(11) DEFAULT NULL,
  `premi_actual` varchar(255) DEFAULT NULL,
  `premi_predicted` varchar(255) DEFAULT NULL,
  `variables_matched` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `informasi`
--

CREATE TABLE `informasi` (
  `ID_DD` int(50) NOT NULL,
  `Jenis_Kelamin_DD` int(50) NOT NULL,
  `Usia_DD` int(50) NOT NULL,
  `Pekerjaan_DD` int(50) NOT NULL,
  `Sumber_Dana_DD` int(50) NOT NULL,
  `Sumber_Dana_Tambahan_DD` int(50) NOT NULL,
  `Penghasilan_Bersih_per_Bulan_DD` int(50) NOT NULL,
  `Tujuan_DD` int(50) NOT NULL,
  `Jenis_Deposito_DD` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `masa_pertanggungan`
--

CREATE TABLE `masa_pertanggungan` (
  `ID_Masa_Pertanggungan_Mp` int(50) NOT NULL,
  `Jenis_Kelamin_Mp` int(50) NOT NULL,
  `Usia_Mp` int(50) NOT NULL,
  `Pekerjaan_Mp` int(50) NOT NULL,
  `Premi_Mp` int(50) NOT NULL,
  `Sumber_Dana_Mp` int(50) NOT NULL,
  `Sumber_Dana_Tambahan_Mp` int(50) NOT NULL,
  `Penghasilan_Bersih_per_Bulan_Mp` int(50) NOT NULL,
  `Tujuan_Mp` int(50) NOT NULL,
  `Jenis_Deposito_Mp` int(50) NOT NULL,
  `ID_DD` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matching_results`
--

CREATE TABLE `matching_results` (
  `id` int(11) NOT NULL,
  `premi` varchar(255) DEFAULT NULL,
  `sumber_dana_tambahan` varchar(255) DEFAULT NULL,
  `penghasilan_bersih` varchar(255) DEFAULT NULL,
  `jenis_kelamin` varchar(255) DEFAULT NULL,
  `usia` varchar(255) DEFAULT NULL,
  `pekerjaan` varchar(255) DEFAULT NULL,
  `sumber_dana` varchar(255) DEFAULT NULL,
  `tujuan` varchar(255) DEFAULT NULL,
  `jenis_deposito` varchar(255) DEFAULT NULL,
  `masa_pertanggungan` varchar(255) DEFAULT NULL,
  `matching_score` int(11) DEFAULT NULL,
  `kategori_kesesuaian` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `premi`
--

CREATE TABLE `premi` (
  `ID_Premi` int(50) NOT NULL,
  `Jenis_Kelamin_Pr` int(50) NOT NULL,
  `Usia_Pr` int(50) NOT NULL,
  `Pekerjaan_Pr` int(50) NOT NULL,
  `Sumber_Dana_Pr` int(50) NOT NULL,
  `Masa_Pertanggungan_Pr` int(50) NOT NULL,
  `Sumber_Dana_Tambahan_Pr` int(50) NOT NULL,
  `Penghasilan_Bersih_per_Bulan_Pr` int(50) NOT NULL,
  `Tujuan_Pr` int(50) NOT NULL,
  `Jenis_Deposito_Pr` int(50) NOT NULL,
  `ID_DD` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rekomendasi`
--

CREATE TABLE `rekomendasi` (
  `ID_Rekomendasi` int(50) NOT NULL,
  `ID_Masa_Pertanggungan_Mp` int(50) DEFAULT NULL,
  `ID_Premi` int(50) DEFAULT NULL,
  `Masa_Pertanggungan_Rekomendasi` int(50) NOT NULL,
  `Premi_Rekomendasi` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `data`
--
ALTER TABLE `data`
  ADD PRIMARY KEY (`ID_Data`);

--
-- Indexes for table `highest_matches`
--
ALTER TABLE `highest_matches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_premi` (`id_premi`);

--
-- Indexes for table `informasi`
--
ALTER TABLE `informasi`
  ADD PRIMARY KEY (`ID_DD`);

--
-- Indexes for table `masa_pertanggungan`
--
ALTER TABLE `masa_pertanggungan`
  ADD PRIMARY KEY (`ID_Masa_Pertanggungan_Mp`);

--
-- Indexes for table `matching_results`
--
ALTER TABLE `matching_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `premi`
--
ALTER TABLE `premi`
  ADD PRIMARY KEY (`ID_Premi`);

--
-- Indexes for table `rekomendasi`
--
ALTER TABLE `rekomendasi`
  ADD PRIMARY KEY (`ID_Rekomendasi`),
  ADD KEY `ID_Premi` (`ID_Premi`),
  ADD KEY `ID_Masa_Pertanggungan` (`ID_Masa_Pertanggungan_Mp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `highest_matches`
--
ALTER TABLE `highest_matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6437;

--
-- AUTO_INCREMENT for table `matching_results`
--
ALTER TABLE `matching_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9033;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `highest_matches`
--
ALTER TABLE `highest_matches`
  ADD CONSTRAINT `highest_matches_ibfk_1` FOREIGN KEY (`id_premi`) REFERENCES `premi` (`ID_Premi`);

--
-- Constraints for table `rekomendasi`
--
ALTER TABLE `rekomendasi`
  ADD CONSTRAINT `ID_Masa_Pertanggungan` FOREIGN KEY (`ID_Masa_Pertanggungan_Mp`) REFERENCES `masa_pertanggungan` (`ID_Masa_Pertanggungan_Mp`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `ID_Premi` FOREIGN KEY (`ID_Premi`) REFERENCES `premi` (`ID_Premi`) ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
