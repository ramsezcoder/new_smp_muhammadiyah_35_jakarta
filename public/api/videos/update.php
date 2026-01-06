<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$id = (int)($input['id'] ?? 0);
$title = trim((string)($input['title'] ?? ''));
$youtubeId = trim((string)($input['youtube_id'] ?? ''));
$thumbnail = trim((string)($input['thumbnail_url'] ?? ''));
$description = trim((string)($input['description'] ?? ''));

if ($id <= 0 || $title === '' || $youtubeId === '') {
  respond(false, 'Invalid input', [], 400);
}

try {
  $pdo->beginTransaction();
  $stmt = $pdo->prepare('UPDATE videos SET title = ?, youtube_id = ?, thumbnail_url = ?, description = ? WHERE id = ?');
  $stmt->execute([$title, $youtubeId, $thumbnail, $description, $id]);
  $pdo->commit();
  respond(true, 'Updated');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
