<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

try {
  $sql = file_get_contents(__DIR__ . '/schema.sql');
  if ($sql === false) {
    respond(false, 'Failed to read schema.sql', [], 500);
  }
  $pdo->exec($sql);
  respond(true, 'Database schema ensured');
} catch (Throwable $e) {
  respond(false, 'Migration failed', ['error' => $e->getMessage()], 500);
}
