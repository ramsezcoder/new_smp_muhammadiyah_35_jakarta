<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can create
$user = require_auth($config, ['Admin','Author','Superadmin']);

$title = trim((string)($_POST['title'] ?? ''));
$slug = trim((string)($_POST['slug'] ?? ''));
$content = trim((string)($_POST['content'] ?? ''));
$excerpt = trim((string)($_POST['excerpt'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));
$tags = isset($_POST['tags']) ? json_encode((array)json_decode($_POST['tags'], true)) : '[]';
$status = trim((string)($_POST['status'] ?? 'draft'));
$seoTitle = trim((string)($_POST['seo_title'] ?? ''));
$seoDescription = trim((string)($_POST['seo_description'] ?? ''));

if ($title === '' || $content === '') {
  respond(false, 'Title and content required', [], 400);
}

// Validate slug format
if ($slug === '') {
  $slug = strtolower(trim(preg_replace('/[^a-z0-9\-]+/i', '-', $title), '-'));
}
$slug = preg_replace('/[^a-z0-9\-]/i', '', $slug) ?: 'article-' . time();

$featuredImage = null;
if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
  $check = validate_image_upload($_FILES['featured_image']);
  if (!$check['ok']) {
    respond(false, $check['error'], [], 400);
  }
  $pathinfo = pathinfo($_FILES['featured_image']['name']);
  $ext = strtolower($pathinfo['extension'] ?? 'jpg');
  $baseSlug = slugify($title);
  [$featuredImage, $target] = unique_filename($config['uploads']['articles'], $baseSlug, $ext);
  if (!move_uploaded_file($_FILES['featured_image']['tmp_name'], $target)) {
    respond(false, 'Failed to save featured image', [], 500);
  }
}

try {
  $pdo->beginTransaction();
  $maxSort = (int)$pdo->query('SELECT IFNULL(MAX(sort_order), 0) FROM articles')->fetchColumn();
  $publishedAt = ($status === 'published') ? date('Y-m-d H:i:s') : null;
  
  $stmt = $pdo->prepare('INSERT INTO articles (title, slug, content_html, excerpt, featured_image, category, tags_json, status, seo_title, seo_description, author_id, author_name, sort_order, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$title, $slug, $content, $excerpt, $featuredImage, $category, $tags, $status, $seoTitle, $seoDescription, $user['sub'], $user['name'] ?? 'Unknown', $maxSort + 1, $publishedAt]);
  $id = (int)$pdo->lastInsertId();
  $pdo->commit();
  
  respond(true, 'Article created', [
    'id' => $id,
    'slug' => $slug,
    'featured_image_url' => $featuredImage ? '/uploads/articles/' . $featuredImage : null
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  if ($featuredImage) @unlink($config['uploads']['articles'] . DIRECTORY_SEPARATOR . $featuredImage);
  respond(false, 'Create failed', ['error' => $e->getMessage()], 500);
}
