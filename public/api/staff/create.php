<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Auth: only Admin/Superadmin can create
require_auth($config, ['Admin','Superadmin']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$name = trim((string)($_POST['name'] ?? ''));
$role = trim((string)($_POST['role'] ?? ''));
$bio = trim((string)($_POST['bio'] ?? ''));

if ($name === '') {
  respond(false, 'Name required', [], 400);
}

$photoFilename = null;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
  $check = validate_image_upload($_FILES['photo']);
  if (!$check['ok']) {
    respond(false, $check['error'], [], 400);
  }
  $orig = $_FILES['photo']['name'];
  $pathinfo = pathinfo($orig);
  $ext = strtolower($pathinfo['extension'] ?? 'jpg');
  $baseSlug = slugify($name);
  [$photoFilename, $target] = unique_filename($config['uploads']['staff'], $baseSlug, $ext);
  if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
    respond(false, 'Failed to save photo', [], 500);
  }
}

try {
  $pdo->beginTransaction();
  $maxSort = (int)$pdo->query('SELECT IFNULL(MAX(sort_order), 0) FROM staff')->fetchColumn();
  $stmt = $pdo->prepare('INSERT INTO staff (name, role, photo_filename, bio, sort_order, is_published) VALUES (?, ?, ?, ?, ?, 1)');
  $stmt->execute([$name, $role, $photoFilename, $bio, $maxSort + 1]);
  $id = (int)$pdo->lastInsertId();
  $pdo->commit();
  respond(true, 'Created', [
    'id' => $id,
    'name' => $name,
    'role' => $role,
    'photo_filename' => $photoFilename,
    'photo_url' => $photoFilename ? uploads_url_path('staff') . '/' . $photoFilename : null,
    'bio' => $bio
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  if ($photoFilename) @unlink($config['uploads']['staff'] . DIRECTORY_SEPARATOR . $photoFilename);
  respond(false, 'Create failed', ['error' => $e->getMessage()], 500);
}
