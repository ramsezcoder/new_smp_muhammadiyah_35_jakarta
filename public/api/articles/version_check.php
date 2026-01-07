<?php
// Version check script - DELETE after verifying
header('Content-Type: application/json');
echo json_encode([
  'version' => 'v2_2026-01-08',
  'features' => [
    'status_validation' => 'enabled',
    'fetch_assoc' => 'enabled',
    'error_logging' => 'enabled',
    'safe_json_decode' => 'enabled'
  ],
  'file_path' => __FILE__,
  'timestamp' => date('Y-m-d H:i:s')
]);
