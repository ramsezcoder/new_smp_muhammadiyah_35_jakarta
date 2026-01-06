<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$title = trim((string)($input['title'] ?? ''));
$youtubeId = trim((string)($input['youtube_id'] ?? ''));
$thumbnail = trim((string)($input['thumbnail_url'] ?? ''));
$description = trim((string)($input['description'] ?? ''));

if ($title === '' || $youtubeId === '') {
  respond(false, 'Title and YouTube ID required', [], 400);
}

try {
  $pdo->beginTransaction();
  $maxSort = (int)$pdo->query('SELECT IFNULL(MAX(sort_order), 0) FROM videos')->fetchColumn();
  $stmt = $pdo->prepare('INSERT INTO videos (title, youtube_id, thumbnail_url, description, sort_order, is_published) VALUES (?, ?, ?, ?, ?, 1)');
  $stmt->execute([$title, $youtubeId, $thumbnail, $description, $maxSort + 1]);
  $id = (int)$pdo->lastInsertId();
  $pdo->commit();
  respond(true, 'Created', [
    'id' => $id,
    'title' => $title,
    'youtube_id' => $youtubeId,
    'thumbnail_url' => $thumbnail,
    'description' => $description
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Create failed', ['error' => $e->getMessage()], 500);
}
