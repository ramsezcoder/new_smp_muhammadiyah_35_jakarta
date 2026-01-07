<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Get current user via token to validate logout request
$user = require_auth($config);

// Optional: Delete session from database if using sessions table
try {
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    $token = $m[1];
    // Optionally log token to blacklist or delete from sessions table
    // For JWT, expiration is client-side, so no server-side cleanup needed
    // But if using sessions table, you could:
    // $pdo->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$user['sub']]);
  }
} catch (Throwable $e) {
  // Token validation already happened in require_auth
}

respond(true, 'Logged out successfully', []);
?>
