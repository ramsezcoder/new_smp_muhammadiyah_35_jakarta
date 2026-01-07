<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Ensure articles table exists
$pdo->exec('CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content_html MEDIUMTEXT NOT NULL,
  excerpt TEXT DEFAULT NULL,
  featured_image VARCHAR(255) DEFAULT NULL,
  featured_image_alt VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  tags_json VARCHAR(500) DEFAULT NULL,
  status ENUM("draft","pending","published","archived") NOT NULL DEFAULT "draft",
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description VARCHAR(255) DEFAULT NULL,
  og_image VARCHAR(255) DEFAULT NULL,
  author_id INT UNSIGNED DEFAULT NULL,
  author_name VARCHAR(255) DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_sort (sort_order),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$status = trim((string)($_GET['status'] ?? 'published'));
$publishedOnly = $status === 'published';

$where = $publishedOnly ? 'WHERE status = "published"' : '';

try {
  $total = (int)$pdo->query("SELECT COUNT(*) FROM articles " . ($publishedOnly ? "WHERE status = 'published'" : ""))->fetchColumn();
  $stmt = $pdo->prepare("SELECT id, title, slug, excerpt, featured_image, featured_image_alt, category, tags_json, status, seo_title, seo_description, author_name, published_at, created_at
                         FROM articles $where ORDER BY sort_order DESC, published_at DESC, id DESC LIMIT :limit OFFSET :offset");
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $items = $stmt->fetchAll();
  
  $baseUrl = '/uploads/articles';
  foreach ($items as &$it) {
    $it['featured_image_url'] = $it['featured_image'] ? $baseUrl . '/' . $it['featured_image'] : null;
    $it['tags'] = $it['tags_json'] ? json_decode($it['tags_json'], true) : [];
  }
  
  respond(true, '', [
    'items' => $items,
    'pagination' => [
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'pages' => (int)ceil($total / $limit)
    ]
  ]);
} catch (Throwable $e) {
  respond(false, 'Failed to list articles', ['error' => $e->getMessage()], 500);
}
