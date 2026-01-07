<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

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
