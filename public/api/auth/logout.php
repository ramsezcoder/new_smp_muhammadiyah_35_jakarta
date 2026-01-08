<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Get current user via token to validate logout request
$user = require_auth($config);

// PHASE 7: Revoke session token server-side
try {
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    $token = $m[1];
    $stmt = $pdo->prepare('DELETE FROM sessions WHERE session_token = ?');
    $stmt->execute([$token]);
    error_log('LOGOUT: Token revoked for user_id=' . $user['sub'] . ' affected_rows=' . $stmt->rowCount());
  }
} catch (Throwable $e) {
  // Log but don't block logout
  error_log('LOGOUT: Session revoke failed: ' . $e->getMessage());
}

respond(true, 'Logged out successfully', []);
?>
