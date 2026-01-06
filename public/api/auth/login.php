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
  $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $user = $stmt->fetch();
  if (!$user || !password_verify($password, $user['password_hash'])) {
    respond(false, 'Invalid credentials', [], 401);
  }
  if ($user['status'] !== 'active') {
    respond(false, 'Account disabled', [], 403);
  }

  // Create JWT
  $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $payload = base64_encode(json_encode([
    'sub' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'iat' => time(),
    'exp' => time() + 60 * 60 * 6 // 6 hours
  ]));
  $header = rtrim(strtr($header, '+/', '-_'), '=');
  $payload = rtrim(strtr($payload, '+/', '-_'), '=');
  $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $header . '.' . $payload, $config['jwt_secret'], true)), '+/', '-_'), '=');
  $token = $header . '.' . $payload . '.' . $signature;

  // Update last_login
  $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

  respond(true, 'Logged in', [
    'token' => $token,
    'user' => [
      'id' => (int)$user['id'],
      'name' => $user['name'],
      'email' => $user['email'],
      'role' => $user['role']
    ]
  ]);
} catch (Throwable $e) {
  respond(false, 'Login failed', ['error' => $e->getMessage()], 500);
}
