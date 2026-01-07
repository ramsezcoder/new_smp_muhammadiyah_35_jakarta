<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}
$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
  respond(false, 'ID required', [], 400);
}

try {
  $stmt = $pdo->prepare('DELETE FROM ppdb_registrants WHERE id = ?');
  $stmt->execute([$id]);
  respond(true, 'Deleted', []);
} catch (Throwable $e) {
  error_log('PPDB delete error: ' . $e->getMessage());
  respond(false, 'Gagal menghapus data', [], 500);
}
?>
