<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can update
$user = require_auth($config, ['Admin','Author','Superadmin']);

$id = (int)($_POST['id'] ?? 0);
$title = trim((string)($_POST['title'] ?? ''));
$slug = trim((string)($_POST['slug'] ?? ''));
$content = trim((string)($_POST['content'] ?? ''));
$excerpt = trim((string)($_POST['excerpt'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));
$tags = isset($_POST['tags']) ? json_encode((array)json_decode($_POST['tags'], true)) : '[]';
$status = trim((string)($_POST['status'] ?? 'draft'));
$seoTitle = trim((string)($_POST['seo_title'] ?? ''));
$seoDescription = trim((string)($_POST['seo_description'] ?? ''));
$featuredImageAlt = trim((string)($_POST['featured_image_alt'] ?? ''));
$keepImage = isset($_POST['keep_image']) ? (bool)(int)$_POST['keep_image'] : true;

if ($id <= 0 || $title === '' || $content === '') {
  respond(false, 'Invalid input', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT featured_image FROM articles WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    respond(false, 'Article not found', [], 404);
  }

  $oldImage = $row['featured_image'];
  $newImage = $keepImage ? $oldImage : null;

  if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
    $check = validate_image_upload($_FILES['featured_image']);
    if (!$check['ok']) {
      respond(false, $check['error'], [], 400);
    }
    $pathinfo = pathinfo($_FILES['featured_image']['name']);
    $ext = strtolower($pathinfo['extension'] ?? 'jpg');
    $baseSlug = slugify($title);
    [$newImage, $target] = unique_filename($config['uploads']['articles'], $baseSlug, $ext);
    if (!move_uploaded_file($_FILES['featured_image']['tmp_name'], $target)) {
      respond(false, 'Failed to save featured image', [], 500);
    }
    if ($oldImage && $oldImage !== $newImage) {
      @unlink($config['uploads']['articles'] . DIRECTORY_SEPARATOR . $oldImage);
    }
  }

  $pdo->beginTransaction();
  $publishedAt = ($status === 'published') ? date('Y-m-d H:i:s') : null;
  
  $stmt = $pdo->prepare('UPDATE articles SET title = ?, slug = ?, content_html = ?, excerpt = ?, featured_image = ?, featured_image_alt = ?, category = ?, tags_json = ?, status = ?, seo_title = ?, seo_description = ?, published_at = ? WHERE id = ?');
  $stmt->execute([$title, $slug, $content, $excerpt, $newImage, $featuredImageAlt, $category, $tags, $status, $seoTitle, $seoDescription, $publishedAt, $id]);
  $pdo->commit();
  
  respond(true, 'Article updated', [
    'featured_image' => $newImage,
    'featured_image_url' => $newImage ? '/uploads/articles/' . $newImage : null,
    'featured_image_alt' => $featuredImageAlt
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
