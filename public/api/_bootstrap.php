<?php
declare(strict_types=1);

// --- Error logging to file (no display) ---
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
  @mkdir($logDir, 0755, true);
}
ini_set('log_errors', '1');
ini_set('display_errors', '0');
ini_set('error_log', $logDir . '/error.log');
error_reporting(E_ALL);

// Basic security and response headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// CORS (adjust allowed origin in production if needed)
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
  header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$config = require __DIR__ . '/config.php';
if (file_exists(__DIR__ . '/config.local.php')) {
  $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}

// Detect production environment
$isProduction = (getenv('APP_ENV') === 'production') || (getenv('APP_ENV') === 'prod');
$isDebug = filter_var(getenv('APP_DEBUG') ?: '0', FILTER_VALIDATE_BOOLEAN);

// Production ENV validation (fail-fast)
if ($isProduction) {
  $requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET'];
  $missing = [];
  
  foreach ($requiredEnvVars as $var) {
    $value = getenv($var);
    if ($value === false || $value === '') {
      $missing[] = $var;
    }
  }
  
  if (!empty($missing)) {
    error_log('FATAL: Missing required environment variables in production: ' . implode(', ', $missing));
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Server configuration error',
      'data' => []
    ]);
    exit(1);
  }
  
  // Validate JWT secret strength
  $jwtSecret = getenv('JWT_SECRET');
  if (strlen($jwtSecret) < 32 || $jwtSecret === 'change-this-secret' || $jwtSecret === 'ganti_dengan_secret_random') {
    error_log('FATAL: JWT_SECRET is weak or default in production');
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Server configuration error',
      'data' => []
    ]);
    exit(1);
  }
}

function respond($success, $message = '', $data = [], $code = 200) {
  http_response_code($code);
  echo json_encode(['success' => (bool)$success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_SLASHES);
  exit;
}

/**
 * Production-safe error response helper
 * 
 * @param bool $success Response status
 * @param string $genericMessage Generic error message for clients
 * @param Throwable|null $exception Optional exception for logging
 * @param int $code HTTP status code
 */
function respond_error(bool $success, string $genericMessage, ?Throwable $exception = null, int $code = 500) {
  global $isProduction, $isDebug;
  
  // Log full exception details (always)
  if ($exception) {
    error_log(sprintf(
      '[%s] %s in %s:%d',
      get_class($exception),
      $exception->getMessage(),
      $exception->getFile(),
      $exception->getLine()
    ));
    
    // Log stack trace in debug mode
    if ($isDebug) {
      error_log('Stack trace: ' . $exception->getTraceAsString());
    }
  }
  
  // Return sanitized response to client
  $data = [];
  if (!$isProduction && $exception) {
    // Dev/staging: Include exception class (but not full message/trace)
    $data['error_type'] = get_class($exception);
    if ($isDebug) {
      $data['error_message'] = $exception->getMessage();
    }
  }
  
  respond($success, $genericMessage, $data, $code);
}

function db_connect(array $cfg) {
  $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $cfg['db']['host'], $cfg['db']['name'], $cfg['db']['charset']);
  try {
    $pdo = new PDO($dsn, $cfg['db']['user'], $cfg['db']['pass'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } catch (Throwable $e) {
    respond(false, 'DB connection failed', ['error' => $e->getMessage()], 500);
  }
  return $pdo;
}

function slugify($text) {
  $text = strtolower(trim($text));
  $text = preg_replace('~[^\pL\d]+~u', '-', $text);
  $text = trim($text, '-');
  $text = preg_replace('~-+~', '-', $text);
  return $text ?: 'file';
}

function ensure_dirs(array $paths) {
  foreach ($paths as $p) {
    if (!is_dir($p)) {
      @mkdir($p, 0755, true);
    }
  }
}

function unique_filename($dir, $base, $ext) {
  $i = 0;
  do {
    $name = $base . ($i ? '-' . $i : '') . '.' . $ext;
    $full = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $name;
    if (!file_exists($full)) return [$name, $full];
    $i++;
  } while ($i < 1000);
  $uniq = $base . '-' . uniqid() . '.' . $ext;
  return [$uniq, rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $uniq];
}

function validate_image_upload(array $file, int $maxBytes = 4000000) {
  if (!isset($file['error']) || is_array($file['error'])) {
    return ['ok' => false, 'error' => 'Invalid upload'];
  }
  if ($file['error'] !== UPLOAD_ERR_OK) {
    return ['ok' => false, 'error' => 'Upload error'];
  }
  if ($file['size'] > $maxBytes) {
    return ['ok' => false, 'error' => 'File too large (max 4MB)'];
  }
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);
  $allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!in_array($mime, $allowed, true)) {
    return ['ok' => false, 'error' => 'Unsupported type'];
  }
  if (preg_match('/\.(php|phtml|phar)$/i', $file['name'])) {
    return ['ok' => false, 'error' => 'Executable file not allowed'];
  }
  $imgInfo = @getimagesize($file['tmp_name']);
  if ($imgInfo === false) {
    return ['ok' => false, 'error' => 'Invalid image'];
  }
  return ['ok' => true, 'mime' => $mime];
}

$pdo = db_connect($config);
ensure_dirs([$config['uploads']['base'], $config['uploads']['articles'], $config['uploads']['gallery'], $config['uploads']['staff'], $config['uploads']['videos']]);

// Helper to get public URL path for a given uploads subdir
function uploads_url_path(string $subdir): string {
  return '/uploads/' . trim($subdir, '/');
}

// --- Auth helpers ---
function get_auth_user(array $config) {
  global $pdo;
  
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
    $payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'));
    $payload = json_decode($payloadJson, true);
    if (!$payload || ($payload['exp'] ?? 0) < time()) {
      respond(false, 'Token expired', [], 401);
    }
    
    // PHASE 7: Validate token against sessions table (server-side revocation)
    try {
      $stmt = $pdo->prepare('SELECT id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1');
      $stmt->execute([$token]);
      if (!$stmt->fetch()) {
        error_log('AUTH: Session not found or expired for token hash=' . substr($token, 0, 20));
        respond(false, 'Session invalid or revoked', [], 401);
      }
    } catch (Throwable $dbError) {
      error_log('AUTH: Session validation failed: ' . $dbError->getMessage());
      respond(false, 'Session validation error', [], 500);
    }
    
    return $payload;
  } catch (Throwable $e) {
    respond(false, 'Invalid token', ['error' => $e->getMessage()], 401);
  }
}

function require_auth(array $config, array $roles = []) {
  $user = get_auth_user($config);
  if (!empty($roles)) {
    $role = $user['role'] ?? '';
    if (!in_array($role, $roles, true)) {
      respond(false, 'Forbidden', [], 403);
    }
  }
  return $user;
}
