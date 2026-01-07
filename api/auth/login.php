<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$email = strtolower(trim((string)($input['email'] ?? '')));
$password = (string)($input['password'] ?? '');

if ($email === '' || $password === '') {
  respond(false, 'Email and password required', [], 400);
}

try {
  // Query user by email
  $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $user = $stmt->fetch();
  
  if (!$user) {
    // User not found - don't reveal this for security
    respond(false, 'Invalid email or password', [], 401);
  }
  
  if (!password_verify($password, $user['password_hash'])) {
    // Password mismatch
    respond(false, 'Invalid email or password', [], 401);
  }
  
  if ($user['status'] !== 'active') {
    respond(false, 'Account is disabled. Contact administrator.', [], 403);
  }

  // Create JWT token
  $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $payload = base64_encode(json_encode([
    'sub' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'iat' => time(),
    'exp' => time() + 60 * 60 * 6 // 6 hours expiry
  ]));
  $header = rtrim(strtr($header, '+/', '-_'), '=');
  $payload = rtrim(strtr($payload, '+/', '-_'), '=');
  $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $header . '.' . $payload, $config['jwt_secret'], true)), '+/', '-_'), '=');
  $token = $header . '.' . $payload . '.' . $signature;

  // Log login attempt to sessions table if desired
  try {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $expiresAt = date('Y-m-d H:i:s', time() + 60 * 60 * 6);
    
    $sessionStmt = $pdo->prepare('
      INSERT INTO sessions (user_id, session_token, user_agent, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    ');
    $sessionStmt->execute([$user['id'], $token, $userAgent, $ipAddress, $expiresAt]);
  } catch (Throwable $e) {
    // Session logging is optional; don't fail login if it fails
    error_log('Session insert failed: ' . $e->getMessage());
  }

  // Update last_login timestamp
  $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

  respond(true, 'Login successful', [
    'token' => $token,
    'user' => [
      'id' => (int)$user['id'],
      'name' => $user['name'],
      'email' => $user['email'],
      'role' => $user['role']
    ]
  ]);
} catch (Throwable $e) {
  error_log('Login error: ' . $e->getMessage());
  respond(false, 'Login failed. Please try again.', [], 500);
}
?>
