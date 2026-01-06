<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Superadmin can update system settings
require_auth($config, ['Superadmin']);

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$allowed = [
  'site_name','school_name','identity','address','contact_email','contact_phone','office_hours',
  'social_links','footer_text','seo_defaults','og_defaults','favicon','logo','theme'
];

try {
  $pdo->beginTransaction();
  $upsert = $pdo->prepare('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)');
  foreach ($allowed as $k) {
    if (!array_key_exists($k, $input)) continue;
    $val = $input[$k];
    // Store complex structures as JSON
    if (is_array($val) || is_object($val)) {
      $val = json_encode($val, JSON_UNESCAPED_SLASHES);
    } else {
      $val = (string)$val;
    }
    $upsert->execute([$k, $val]);
  }
  $pdo->commit();
  respond(true, 'Settings updated');
} catch (Throwable $e) {
  if ($pdo->inTransaction()) { $pdo->rollBack(); }
  respond(false, 'Failed to update settings', ['error' => $e->getMessage()], 500);
}
