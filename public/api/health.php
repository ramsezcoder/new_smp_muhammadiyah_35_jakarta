<?php
/**
 * HEALTH CHECK ENDPOINT
 * 
 * Returns system health status for monitoring/alerting
 * 
 * Usage: GET /api/health.php
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Health check",
 *   "data": {
 *     "status": "healthy|degraded|unhealthy",
 *     "checks": {
 *       "database": "ok|error",
 *       "uploads_writable": "ok|error",
 *       "logs_writable": "ok|error",
 *       "jwt_secret_configured": "ok|warning"
 *     },
 *     "timestamp": "2026-01-09T10:30:45Z"
 *   }
 * }
 */

declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$checks = [];
$errors = 0;
$warnings = 0;

// Check 1: Database connectivity
try {
  $stmt = $pdo->query('SELECT 1');
  $checks['database'] = 'ok';
} catch (Throwable $e) {
  $checks['database'] = 'error';
  $checks['database_error'] = 'Connection failed';
  error_log('[HEALTH] Database check failed: ' . $e->getMessage());
  $errors++;
}

// Check 2: Upload directory writable
$uploadBase = $config['uploads']['base'] ?? '';
if ($uploadBase === '' || !is_dir($uploadBase)) {
  $checks['uploads_writable'] = 'error';
  $errors++;
} elseif (!is_writable($uploadBase)) {
  $checks['uploads_writable'] = 'error';
  $errors++;
} else {
  $checks['uploads_writable'] = 'ok';
}

// Check 3: Log directory writable
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
  $checks['logs_writable'] = 'warning';
  $warnings++;
} elseif (!is_writable($logDir)) {
  $checks['logs_writable'] = 'error';
  $errors++;
} else {
  $checks['logs_writable'] = 'ok';
}

// Check 4: JWT secret configured (not default)
$jwtSecret = $config['jwt_secret'] ?? '';
if ($jwtSecret === 'change-this-secret' || $jwtSecret === 'ganti_dengan_secret_random' || strlen($jwtSecret) < 16) {
  $checks['jwt_secret_configured'] = 'warning';
  $warnings++;
} else {
  $checks['jwt_secret_configured'] = 'ok';
}

// Determine overall status
if ($errors > 0) {
  $status = 'unhealthy';
} elseif ($warnings > 0) {
  $status = 'degraded';
} else {
  $status = 'healthy';
}

respond(true, 'Health check', [
  'status' => $status,
  'checks' => $checks,
  'timestamp' => gmdate('Y-m-d\TH:i:s\Z')
]);
