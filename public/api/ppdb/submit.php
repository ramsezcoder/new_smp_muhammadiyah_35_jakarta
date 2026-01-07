<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];

// Basic sanitization
function clean($v) { return trim((string)$v); }
$nama = clean($input['namaLengkap'] ?? '');
$asal = clean($input['asalSekolah'] ?? '');
$tgl  = clean($input['tanggalLahir'] ?? '');
$ortu = clean($input['orangTua'] ?? '');
$wa   = preg_replace('/[^0-9]/', '', (string)($input['nomorWA'] ?? ''));
$jenis= clean($input['jenisRegistrasi'] ?? '');

if ($nama === '' || $asal === '' || $tgl === '' || $ortu === '' || $wa === '' || $jenis === '') {
  respond(false, 'Semua field wajib diisi', [], 400);
}

// Ensure table exists
$pdo->exec('CREATE TABLE IF NOT EXISTS ppdb_registrants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  asal_sekolah VARCHAR(160) NOT NULL,
  parent_name VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(32) NOT NULL,
  jenis VARCHAR(40) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT "new",
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

// Validate date format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tgl)) {
  respond(false, 'Format tanggal tidak valid (YYYY-MM-DD)', [], 400);
}

try {
  $stmt = $pdo->prepare('INSERT INTO ppdb_registrants (nama, asal_sekolah, parent_name, whatsapp, jenis, tanggal_lahir, status) VALUES (?, ?, ?, ?, ?, ?, "new")');
  $stmt->execute([$nama, $asal, $ortu, $wa, $jenis, $tgl]);
  $id = (int)$pdo->lastInsertId();
  respond(true, 'Pendaftaran berhasil', ['id' => $id]);
} catch (Throwable $e) {
  error_log('PPDB submit error: ' . $e->getMessage());
  respond(false, 'Gagal menyimpan pendaftaran', [], 500);
}
?>
