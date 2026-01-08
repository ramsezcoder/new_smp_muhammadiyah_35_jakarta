<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$category = trim((string)($_GET['category'] ?? ''));
$allowedCategories = ['school', 'student'];
$categoryFilter = in_array($category, $allowedCategories, true) ? $category : null;

try {
  // Count total
  if ($categoryFilter) {
    $stmtCount = $pdo->prepare('SELECT COUNT(*) FROM articles WHERE status = "published" AND category = ?');
    $stmtCount->execute([$categoryFilter]);
  } else {
    $stmtCount = $pdo->query('SELECT COUNT(*) FROM articles WHERE status = "published"');
  }
  $total = (int)$stmtCount->fetchColumn();

  // Fetch rows
  $sql = 'SELECT id, title, slug, excerpt, content_html, featured_image, featured_image_alt, author_name, category, published_at, created_at
          FROM articles
          WHERE status = "published"' . ($categoryFilter ? ' AND category = ?' : '') . '
          ORDER BY published_at DESC, id DESC
          LIMIT :limit OFFSET :offset';
  $stmt = $pdo->prepare($sql);
  if ($categoryFilter) {
    $stmt->bindValue(1, $categoryFilter, PDO::PARAM_STR);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $baseUrl = '/uploads/articles/';
  $items = [];
  foreach ($rows as $row) {
    $items[] = [
      'id' => $row['id'],
      'title' => $row['title'],
      'slug' => $row['slug'],
      'excerpt' => $row['excerpt'],
      'content' => $row['content_html'],
      'featuredImage' => $row['featured_image'] ? $baseUrl . $row['featured_image'] : null,
      'featuredImageAlt' => $row['featured_image_alt'],
      'authorName' => $row['author_name'],
      'category' => $row['category'],
      'publishedAt' => $row['published_at'],
      'createdAt' => $row['created_at'],
    ];
  }

  http_response_code(200);
  echo json_encode([
    'items' => $items,
    'pagination' => [
      'page' => $page,
      'pages' => $limit > 0 ? (int)ceil($total / $limit) : 0,
      'total' => $total,
    ],
  ], JSON_UNESCAPED_SLASHES);
  exit;
} catch (Throwable $e) {
  error_log('news/list error: ' . $e->getMessage());
  respond(false, 'Failed to fetch news', ['error' => $e->getMessage()], 500);
}
