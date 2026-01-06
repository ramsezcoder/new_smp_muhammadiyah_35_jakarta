<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$ids = $input['ids'] ?? null;
if (!is_array($ids) || empty($ids)) {
  respond(false, 'Invalid ids', [], 400);
}

try {
  $pdo->beginTransaction();
  $order = 1;
  $stmt = $pdo->prepare('UPDATE videos SET sort_order = ? WHERE id = ?');
  foreach ($ids as $id) {
    $stmt->execute([$order++, (int)$id]);
  }
  $pdo->commit();
  respond(true, 'Reordered');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Reorder failed', ['error' => $e->getMessage()], 500);
}
