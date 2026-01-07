<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

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

$stmt = $pdo->query('SELECT id, nama, asal_sekolah, parent_name, whatsapp, jenis, tanggal_lahir, status, created_at, updated_at FROM ppdb_registrants ORDER BY created_at DESC');
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;
?>
