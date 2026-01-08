<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// PHASE 7: Require authentication for destructive operation
require_auth($config, ['Admin', 'Superadmin']);

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
  respond(false, 'Invalid id', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT filename FROM gallery_images WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    respond(false, 'Not found', [], 404);
  }
  $filepath = $config['uploads']['gallery'] . DIRECTORY_SEPARATOR . $row['filename'];
  $pdo->beginTransaction();
  $pdo->prepare('DELETE FROM gallery_images WHERE id = ?')->execute([$id]);
  $pdo->commit();
  @unlink($filepath);
  respond(true, 'Deleted');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Delete failed', ['error' => $e->getMessage()], 500);
}
