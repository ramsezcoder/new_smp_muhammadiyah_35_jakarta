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
  error_log('LOGIN: start email=' . $email);

  // Query user by email (prepared statement)
  $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $user = $stmt->fetch();

  if (!$user) {
    error_log('LOGIN: user not found for email ' . $email);
    respond(false, 'Invalid email or password', [], 401);
  }

  if ($user['status'] !== 'active') {
    error_log('LOGIN: user inactive email=' . $email . ' status=' . $user['status']);
    respond(false, 'Account is disabled. Contact administrator.', [], 403);
  }

  if (!password_verify($password, $user['password_hash'])) {
    error_log('LOGIN: password mismatch for email ' . $email);
    respond(false, 'Invalid email or password', [], 401);
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

  // Log login attempt to sessions table (best effort)
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
    error_log('LOGIN: session insert failed: ' . $e->getMessage());
  }

  // Update last_login timestamp (best effort)
  try {
    $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);
  } catch (Throwable $e) {
    error_log('LOGIN: last_login update failed: ' . $e->getMessage());
  }

  error_log('LOGIN: success email=' . $email . ' role=' . $user['role']);

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
  error_log('LOGIN: fatal error ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
  error_log('LOGIN: stack trace: ' . $e->getTraceAsString());
  respond(false, 'Login failed. Please try again later.', [], 500);
}
?>
