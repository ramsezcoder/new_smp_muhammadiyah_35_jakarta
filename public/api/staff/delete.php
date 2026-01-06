<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
  respond(false, 'Invalid id', [], 400);
}

try {
  $stmt = $pdo->prepare('SELECT photo_filename FROM staff WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    respond(false, 'Not found', [], 404);
  }
  $filepath = $row['photo_filename'] ? $config['uploads']['staff'] . DIRECTORY_SEPARATOR . $row['photo_filename'] : null;
  $pdo->beginTransaction();
  $pdo->prepare('DELETE FROM staff WHERE id = ?')->execute([$id]);
  $pdo->commit();
  if ($filepath) @unlink($filepath);
  respond(true, 'Deleted');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Delete failed', ['error' => $e->getMessage()], 500);
}
