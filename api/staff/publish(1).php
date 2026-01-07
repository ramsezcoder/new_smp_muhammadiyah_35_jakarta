<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Superadmin can toggle publish
require_auth($config, ['Admin','Superadmin']);

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
$published = isset($input['is_published']) ? (bool)$input['is_published'] : null;

if ($id <= 0 || $published === null) {
  respond(false, 'Invalid input', [], 400);
}

try {
  $stmt = $pdo->prepare('UPDATE staff SET is_published = ? WHERE id = ?');
  $stmt->execute([$published ? 1 : 0, $id]);
  respond(true, 'Published status updated');
} catch (Throwable $e) {
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
