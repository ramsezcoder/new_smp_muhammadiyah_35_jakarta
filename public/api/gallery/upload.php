<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$title = trim((string)($_POST['title'] ?? ''));
$alt = trim((string)($_POST['alt'] ?? ''));

if (!isset($_FILES['image'])) {
  respond(false, 'No image provided', [], 400);
}

$check = validate_image_upload($_FILES['image']);
if (!$check['ok']) {
  respond(false, $check['error'], [], 400);
}

$orig = $_FILES['image']['name'];
$pathinfo = pathinfo($orig);
$ext = strtolower($pathinfo['extension'] ?? 'jpg');
$baseSlug = slugify($title !== '' ? $title : ($pathinfo['filename'] ?? 'image'));
[$filename, $target] = unique_filename($config['uploads']['gallery'], $baseSlug, $ext);

try {
  if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
    respond(false, 'Failed to save file', [], 500);
  }
  $pdo->beginTransaction();
  $maxSort = (int)$pdo->query('SELECT IFNULL(MAX(sort_order), 0) FROM gallery_images')->fetchColumn();
  $stmt = $pdo->prepare('INSERT INTO gallery_images (title, alt_text, filename, sort_order, is_published) VALUES (?, ?, ?, ?, 1)');
  $stmt->execute([$title !== '' ? $title : $baseSlug, $alt, $filename, $maxSort + 1]);
  $id = (int)$pdo->lastInsertId();
  $pdo->commit();
  respond(true, 'Uploaded', [
    'id' => $id,
    'title' => $title !== '' ? $title : $baseSlug,
    'alt_text' => $alt,
    'filename' => $filename,
    'url' => uploads_url_path('gallery') . '/' . $filename
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  @unlink($target);
  respond(false, 'Upload failed', ['error' => $e->getMessage()], 500);
}
