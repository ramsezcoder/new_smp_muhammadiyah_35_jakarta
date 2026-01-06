<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
  respond(false, 'Missing token', [], 401);
}
$token = $m[1];

try {
  [$headerB64, $payloadB64, $sigB64] = explode('.', $token);
  $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $headerB64 . '.' . $payloadB64, $config['jwt_secret'], true)), '+/', '-_'), '=');
  if (!hash_equals($expected, $sigB64)) {
    respond(false, 'Invalid signature', [], 401);
  }
  $payload = json_decode(base64_decode(strtr($payloadB64, '-_', '+/')), true);
  if (!$payload || ($payload['exp'] ?? 0) < time()) {
    respond(false, 'Token expired', [], 401);
  }
  respond(true, '', ['user' => $payload]);
} catch (Throwable $e) {
  respond(false, 'Invalid token', ['error' => $e->getMessage()], 401);
}
