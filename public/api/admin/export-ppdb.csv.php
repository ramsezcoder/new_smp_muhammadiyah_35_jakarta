<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// CSV headers
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="ppdb_registrants.csv"');

// Ensure table exists to avoid errors
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

$out = fopen('php://output', 'w');
// CSV columns
fputcsv($out, ['Name','Asal Sekolah','Parent','WhatsApp','Jenis','Date','Status']);

$stmt = $pdo->query('SELECT nama, asal_sekolah, parent_name, whatsapp, jenis, created_at, status FROM ppdb_registrants ORDER BY created_at DESC');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
  fputcsv($out, [
    $row['nama'],
    $row['asal_sekolah'],
    $row['parent_name'],
    $row['whatsapp'],
    $row['jenis'],
    $row['created_at'],
    $row['status'],
  ]);
}
fclose($out);
exit;
?>
