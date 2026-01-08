<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can delete
$user = require_auth($config, ['Admin','Author','Superadmin']);

// PHASE 7: Enforce Author ownership (Author cannot delete others' articles)
$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);

if ($user['role'] === 'Author') {
  // Check if article exists and belongs to this author
  $ownershipStmt = $pdo->prepare('SELECT author_id FROM articles WHERE id = ?');
  $ownershipStmt->execute([$id]);
  $ownershipRow = $ownershipStmt->fetch();
  
  if (!$ownershipRow) {
    respond(false, 'Article not found', [], 404);
  }
  
  if ((int)$ownershipRow['author_id'] !== (int)$user['sub']) {
    error_log('OWNERSHIP DENIED: user_id=' . $user['sub'] . ' attempted to delete article_id=' . $id . ' owned by user_id=' . $ownershipRow['author_id']);
    respond(false, 'You can only delete your own articles', [], 403);
  }
}
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
