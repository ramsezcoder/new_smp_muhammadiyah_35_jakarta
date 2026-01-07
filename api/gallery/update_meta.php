<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
$title = trim((string)($input['title'] ?? ''));
$alt = trim((string)($input['alt_text'] ?? ''));
isset($input['is_published']) ? $pub = (int)!!$input['is_published'] : $pub = null;

if ($id <= 0) {
  respond(false, 'Invalid id', [], 400);
}

try {
  if ($pub === null) {
    $stmt = $pdo->prepare('UPDATE gallery_images SET title = ?, alt_text = ? WHERE id = ?');
    $stmt->execute([$title, $alt, $id]);
  } else {
    $stmt = $pdo->prepare('UPDATE gallery_images SET title = ?, alt_text = ?, is_published = ? WHERE id = ?');
    $stmt->execute([$title, $alt, $pub, $id]);
  }
  respond(true, 'Updated');
} catch (Throwable $e) {
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
