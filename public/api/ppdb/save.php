<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}
$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];

function clean($v) { return trim((string)$v); }
$id   = (int)($input['id'] ?? 0);
$nama = clean($input['namaLengkap'] ?? $input['nama'] ?? '');
$asal = clean($input['asalSekolah'] ?? '');
$tgl  = clean($input['tanggalLahir'] ?? '');
$ortu = clean($input['orangTua'] ?? $input['parent_name'] ?? '');
$wa   = preg_replace('/[^0-9]/', '', (string)($input['nomorWA'] ?? $input['whatsapp'] ?? ''));
$jenis= clean($input['jenisRegistrasi'] ?? $input['jenis'] ?? '');
$status = clean($input['status'] ?? 'new');

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

if ($nama === '' || $asal === '' || $tgl === '' || $ortu === '' || $wa === '' || $jenis === '') {
  respond(false, 'Semua field wajib diisi', [], 400);
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tgl)) {
  respond(false, 'Format tanggal tidak valid (YYYY-MM-DD)', [], 400);
}

try {
  if ($id > 0) {
    $stmt = $pdo->prepare('UPDATE ppdb_registrants SET nama=?, asal_sekolah=?, parent_name=?, whatsapp=?, jenis=?, tanggal_lahir=?, status=? WHERE id=?');
    $stmt->execute([$nama, $asal, $ortu, $wa, $jenis, $tgl, $status, $id]);
    respond(true, 'Updated', ['id' => $id]);
  } else {
    $stmt = $pdo->prepare('INSERT INTO ppdb_registrants (nama, asal_sekolah, parent_name, whatsapp, jenis, tanggal_lahir, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$nama, $asal, $ortu, $wa, $jenis, $tgl, $status]);
    respond(true, 'Created', ['id' => (int)$pdo->lastInsertId()]);
  }
} catch (Throwable $e) {
  error_log('PPDB save error: ' . $e->getMessage());
  respond(false, 'Gagal menyimpan data', [], 500);
}
?>
