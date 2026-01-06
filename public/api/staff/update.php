<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$id = (int)($_POST['id'] ?? 0);
$name = trim((string)($_POST['name'] ?? ''));
$role = trim((string)($_POST['role'] ?? ''));
$bio = trim((string)($_POST['bio'] ?? ''));
$keepPhoto = isset($_POST['keep_photo']) ? (int)$_POST['keep_photo'] : 1;

if ($id <= 0 || $name === '') {
  respond(false, 'Invalid input', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT photo_filename FROM staff WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    respond(false, 'Not found', [], 404);
  }

  $oldPhoto = $row['photo_filename'];
  $newPhoto = $keepPhoto ? $oldPhoto : null;

  if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $check = validate_image_upload($_FILES['photo']);
    if (!$check['ok']) {
      respond(false, $check['error'], [], 400);
    }
    $pathinfo = pathinfo($_FILES['photo']['name']);
    $ext = strtolower($pathinfo['extension'] ?? 'jpg');
    $baseSlug = slugify($name);
    [$newPhoto, $target] = unique_filename($config['uploads']['staff'], $baseSlug, $ext);
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
      respond(false, 'Failed to save photo', [], 500);
    }
    if ($oldPhoto && $oldPhoto !== $newPhoto) {
      @unlink($config['uploads']['staff'] . DIRECTORY_SEPARATOR . $oldPhoto);
    }
  }

  $pdo->beginTransaction();
  $stmt = $pdo->prepare('UPDATE staff SET name = ?, role = ?, photo_filename = ?, bio = ? WHERE id = ?');
  $stmt->execute([$name, $role, $newPhoto, $bio, $id]);
  $pdo->commit();
  respond(true, 'Updated', [
    'id' => $id,
    'name' => $name,
    'role' => $role,
    'photo_filename' => $newPhoto,
    'photo_url' => $newPhoto ? uploads_url_path('staff') . '/' . $newPhoto : null,
    'bio' => $bio
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
