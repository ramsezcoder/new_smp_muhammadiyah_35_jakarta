<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$token = trim((string)($input['token'] ?? ''));

if ($token === '') {
  respond(false, 'Missing reCAPTCHA token', [], 400);
}

// Server-side verification with Google
$recaptcha_secret = getenv('RECAPTCHA_SECRET_KEY') ?: 'CHANGE_ME_IN_PRODUCTION';
if ($recaptcha_secret === 'CHANGE_ME_IN_PRODUCTION') {
  respond(false, 'reCAPTCHA not configured', [], 500);
}

try {
  $verify_url = 'https://www.google.com/recaptcha/api/siteverify';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $verify_url);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['secret' => $recaptcha_secret, 'response' => $token]));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);
  $response = curl_exec($ch);
  $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($http_code !== 200 || !$response) {
    respond(false, 'Failed to verify reCAPTCHA', [], 500);
  }

  $result = json_decode($response, true);
  if (!is_array($result) || !isset($result['success'])) {
    respond(false, 'Invalid verification response', [], 500);
  }

  // Require score > 0.5 for v3; v2 checkbox doesn't include score
  $score = $result['score'] ?? 1.0;
  $success = (bool)$result['success'] && $score >= 0.5;

  respond(true, '', ['success' => $success, 'score' => $score]);
} catch (Throwable $e) {
  respond(false, 'Verification error', ['error' => $e->getMessage()], 500);
}
