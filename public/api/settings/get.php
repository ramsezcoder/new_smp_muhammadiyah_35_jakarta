<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Auth required to read dashboard settings
require_auth($config, ['Admin','Superadmin','Author']);

try {
  $stmt = $pdo->query('SELECT `key`, `value` FROM settings');
  $rows = $stmt->fetchAll();
  $out = [];
  foreach ($rows as $r) {
    $val = $r['value'];
    $decoded = json_decode($val, true);
    $out[$r['key']] = $decoded === null ? $val : $decoded;
  }
  respond(true, '', ['settings' => $out]);
} catch (Throwable $e) {
  respond(false, 'Failed to read settings', ['error' => $e->getMessage()], 500);
}
