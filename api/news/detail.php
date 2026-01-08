<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Determine slug from path or query
$slug = null;
if (isset($_GET['slug'])) {
  $slug = trim((string)$_GET['slug']);
} else {
  $uri = $_SERVER['REQUEST_URI'] ?? '';
  $parts = explode('/', trim($uri, '/'));
  $last = end($parts);
  if ($last !== 'detail.php' && $last !== 'detail') {
    $slug = $last;
  }
}

if ($slug === null || $slug === '') {
  respond(false, 'Slug required', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT id, title, slug, content_html, excerpt, featured_image, featured_image_alt, category, published_at, created_at FROM articles WHERE slug = ? AND status = "published" LIMIT 1');
  $stmt->execute([$slug]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    respond(false, 'Not found', [], 404);
  }

  $baseUrl = '/uploads/articles/';
  $record = [
    'id' => $row['id'],
    'title' => $row['title'],
    'slug' => $row['slug'],
    'content' => $row['content_html'],
    'excerpt' => $row['excerpt'],
    'featuredImage' => $row['featured_image'] ? $baseUrl . $row['featured_image'] : null,
    'featuredImageAlt' => $row['featured_image_alt'],
    'authorName' => $row['author_name'] ?? null,
    'category' => $row['category'],
    'publishedAt' => $row['published_at'],
    'createdAt' => $row['created_at'],
  ];

  http_response_code(200);
  echo json_encode(['record' => $record], JSON_UNESCAPED_SLASHES);
  exit;
} catch (Throwable $e) {
  error_log('news/detail error: ' . $e->getMessage());
  respond(false, 'Failed to fetch article', ['error' => $e->getMessage()], 500);
}
