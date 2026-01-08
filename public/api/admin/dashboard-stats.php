<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Ensure required tables exist (defensive)
try {
  $pdo->exec('CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content_html MEDIUMTEXT,
    excerpt TEXT,
    featured_image VARCHAR(255),
    featured_image_alt VARCHAR(255),
    category VARCHAR(64),
    tags_json TEXT,
    status VARCHAR(32) NOT NULL DEFAULT "pending",
    seo_title VARCHAR(255),
    seo_description VARCHAR(255),
    author_id INT,
    author_name VARCHAR(120),
    sort_order INT DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

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
} catch (Throwable $e) {
  respond(false, 'Failed to ensure tables', ['error' => $e->getMessage()], 500);
}

try {
  $articlesTotal = (int)$pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();
  $articlesPending = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'pending'")->fetchColumn();
  $registrantsTotal = (int)$pdo->query("SELECT COUNT(*) FROM ppdb_registrants")->fetchColumn();
  $registrantsNew = (int)$pdo->query("SELECT COUNT(*) FROM ppdb_registrants WHERE status = 'new'")->fetchColumn();

  respond(true, 'OK', [
    'articles_total' => $articlesTotal,
    'articles_pending' => $articlesPending,
    'registrants_total' => $registrantsTotal,
    'registrants_new' => $registrantsNew,
  ]);
} catch (Throwable $e) {
  error_log('dashboard-stats error: ' . $e->getMessage());
  respond(false, 'Failed to load stats', ['error' => $e->getMessage()], 500);
}
