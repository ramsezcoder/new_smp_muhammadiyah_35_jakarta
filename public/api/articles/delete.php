<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can delete
require_auth($config, ['Admin','Author','Superadmin']);

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
  respond(false, 'Invalid id', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT featured_image FROM articles WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    respond(false, 'Not found', [], 404);
  }
  $filepath = $row['featured_image'] ? $config['uploads']['articles'] . DIRECTORY_SEPARATOR . $row['featured_image'] : null;
  $pdo->beginTransaction();
  $pdo->prepare('DELETE FROM articles WHERE id = ?')->execute([$id]);
  $pdo->commit();
  if ($filepath) @unlink($filepath);
  respond(true, 'Deleted');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Delete failed', ['error' => $e->getMessage()], 500);
}
