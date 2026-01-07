<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;
$publishedOnly = isset($_GET['published']) ? (int)($_GET['published'] === '1') : 1;

$where = $publishedOnly ? 'WHERE is_published = 1' : '';

try {
  $total = (int)$pdo->query("SELECT COUNT(*) FROM gallery_images " . ($publishedOnly ? "WHERE is_published = 1" : ""))->fetchColumn();
  $stmt = $pdo->prepare("SELECT id, title, alt_text, filename, sort_order, is_published, created_at, updated_at
                         FROM gallery_images $where ORDER BY sort_order ASC, id ASC LIMIT :limit OFFSET :offset");
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $items = $stmt->fetchAll();
  $baseUrl = uploads_url_path('gallery');
  foreach ($items as &$it) {
    $it['url'] = $baseUrl . '/' . $it['filename'];
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
  respond(false, 'Failed to list images', ['error' => $e->getMessage()], 500);
}
