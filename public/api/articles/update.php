<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can update
$user = require_auth($config, ['Admin','Author','Superadmin']);

// PHASE 7: Enforce Author ownership (Author cannot edit others' articles)
if ($user['role'] === 'Author') {
  // Check if article exists and belongs to this author
  $ownershipStmt = $pdo->prepare('SELECT author_id FROM articles WHERE id = ?');
  $ownershipStmt->execute([(int)($_POST['id'] ?? 0)]);
  $ownershipRow = $ownershipStmt->fetch();
  
  if (!$ownershipRow) {
    respond(false, 'Article not found', [], 404);
  }
  
  if ((int)$ownershipRow['author_id'] !== (int)$user['sub']) {
    error_log('OWNERSHIP DENIED: user_id=' . $user['sub'] . ' attempted to update article_id=' . (int)($_POST['id'] ?? 0) . ' owned by user_id=' . $ownershipRow['author_id']);
    respond(false, 'You can only edit your own articles', [], 403);
  }
}

$id = (int)($_POST['id'] ?? 0);
$title = trim((string)($_POST['title'] ?? ''));
$slug = trim((string)($_POST['slug'] ?? ''));
$content = trim((string)(
  $_POST['content']
  ?? $_POST['content_html']
  ?? ''
));
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
  $uploadedNewFile = null; // Track new file for rollback

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
    $uploadedNewFile = $target; // Track for rollback
  }

  // ATOMIC: DB update + file cleanup in single transaction
  try {
    $pdo->beginTransaction();
    $publishedAt = ($status === 'published') ? date('Y-m-d H:i:s') : null;
    
    $stmt = $pdo->prepare('UPDATE articles SET title = ?, slug = ?, content_html = ?, excerpt = ?, featured_image = ?, featured_image_alt = ?, category = ?, tags_json = ?, status = ?, seo_title = ?, seo_description = ?, published_at = ? WHERE id = ?');
    $stmt->execute([$title, $slug, $content, $excerpt, $newImage, $featuredImageAlt, $category, $tags, $status, $seoTitle, $seoDescription, $publishedAt, $id]);
    $pdo->commit();
    
    // Only delete old image AFTER successful DB commit
    if ($uploadedNewFile && $oldImage && $oldImage !== $newImage) {
      @unlink($config['uploads']['articles'] . DIRECTORY_SEPARATOR . $oldImage);
    }
    
    respond(true, 'Article updated', [
      'featured_image' => $newImage,
      'featured_image_url' => $newImage ? '/uploads/articles/' . $newImage : null,
      'featured_image_alt' => $featuredImageAlt
    ]);
  } catch (Throwable $dbError) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    // ROLLBACK: Delete newly uploaded file if DB failed
    if ($uploadedNewFile) {
      @unlink($uploadedNewFile);
    }
    respond(false, 'Update failed', ['error' => $dbError->getMessage()], 500);
  }
} catch (Throwable $e) {
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
