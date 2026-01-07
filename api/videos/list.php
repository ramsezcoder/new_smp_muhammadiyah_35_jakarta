<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;
$publishedOnly = isset($_GET['published']) ? (int)($_GET['published'] === '1') : 1;

$where = $publishedOnly ? 'WHERE is_published = 1' : '';

try {
  $total = (int)$pdo->query("SELECT COUNT(*) FROM videos " . ($publishedOnly ? "WHERE is_published = 1" : ""))->fetchColumn();
  $stmt = $pdo->prepare("SELECT id, title, youtube_id, thumbnail_url, description, sort_order, is_published, created_at, updated_at
                         FROM videos $where ORDER BY sort_order ASC, id ASC LIMIT :limit OFFSET :offset");
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $items = $stmt->fetchAll();
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
  respond(false, 'Failed to list videos', ['error' => $e->getMessage()], 500);
}
