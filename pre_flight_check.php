<?php
/**
 * PRODUCTION PRE-FLIGHT VALIDATION
 * 
 * Run this script BEFORE deployment to verify:
 * - Required ENV variables present
 * - Database connectivity
 * - Upload directories writable
 * - PHP configuration safe
 * 
 * Usage: php pre_flight_check.php
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: Critical failure (abort deployment)
 */

declare(strict_types=1);

echo "═══════════════════════════════════════════════════════════\n";
echo "  PRODUCTION PRE-FLIGHT VALIDATION\n";
echo "═══════════════════════════════════════════════════════════\n\n";

$failures = [];
$warnings = [];

// ─────────────────────────────────────────────────────────────
// 1. CHECK REQUIRED ENVIRONMENT VARIABLES
// ─────────────────────────────────────────────────────────────
echo "[1/5] Environment Variables...\n";

$requiredEnvVars = [
  'DB_HOST' => 'Database host',
  'DB_NAME' => 'Database name',
  'DB_USER' => 'Database user',
  'DB_PASS' => 'Database password',
  'JWT_SECRET' => 'JWT signing secret',
];

$optionalEnvVars = [
  'APP_ENV' => 'Environment (production/staging/local)',
  'RECAPTCHA_SECRET_KEY' => 'reCAPTCHA secret (if enabled)',
];

foreach ($requiredEnvVars as $var => $desc) {
  $value = getenv($var);
  if ($value === false || $value === '') {
    $failures[] = "    ❌ $var not set ($desc)";
  } else {
    // Validate JWT_SECRET strength
    if ($var === 'JWT_SECRET') {
      if (strlen($value) < 32) {
        $warnings[] = "    ⚠️  $var is too short (< 32 chars)";
      } elseif ($value === 'change-this-secret' || $value === 'ganti_dengan_secret_random') {
        $failures[] = "    ❌ $var is default value (not changed)";
      }
    }
    echo "    ✅ $var: set\n";
  }
}

foreach ($optionalEnvVars as $var => $desc) {
  $value = getenv($var);
  if ($value === false || $value === '') {
    $warnings[] = "    ⚠️  $var not set ($desc) - using default";
  } else {
    echo "    ✅ $var: set\n";
  }
}

// ─────────────────────────────────────────────────────────────
// 2. CHECK DATABASE CONNECTIVITY
// ─────────────────────────────────────────────────────────────
echo "\n[2/5] Database Connectivity...\n";

try {
  require __DIR__ . '/public/api/_bootstrap.php';
  
  $stmt = $pdo->query('SELECT VERSION() as version');
  $dbVersion = $stmt->fetch();
  echo "    ✅ Database connection: OK\n";
  echo "    ℹ️  MySQL version: " . ($dbVersion['version'] ?? 'unknown') . "\n";
  
  // Check required tables
  $requiredTables = ['users', 'articles', 'gallery_images', 'staff', 'sessions'];
  $stmt = $pdo->query('SHOW TABLES');
  $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
  
  foreach ($requiredTables as $table) {
    if (!in_array($table, $existingTables, true)) {
      $failures[] = "    ❌ Required table missing: $table";
    }
  }
  
  if (count($failures) === 0 || !str_contains(implode("\n", $failures), 'table missing')) {
    echo "    ✅ Required tables exist\n";
  }
  
} catch (Throwable $e) {
  $failures[] = "    ❌ Database connection FAILED: " . $e->getMessage();
}

// ─────────────────────────────────────────────────────────────
// 3. CHECK UPLOAD DIRECTORIES
// ─────────────────────────────────────────────────────────────
echo "\n[3/5] Upload Directories...\n";

$uploadDirs = [
  'base' => $config['uploads']['base'] ?? '',
  'articles' => $config['uploads']['articles'] ?? '',
  'gallery' => $config['uploads']['gallery'] ?? '',
  'staff' => $config['uploads']['staff'] ?? '',
];

foreach ($uploadDirs as $name => $path) {
  if ($path === '') {
    $failures[] = "    ❌ Upload path not configured: $name";
    continue;
  }
  
  if (!is_dir($path)) {
    $failures[] = "    ❌ Directory missing: $path";
    continue;
  }
  
  if (!is_writable($path)) {
    $failures[] = "    ❌ Directory not writable: $path";
    continue;
  }
  
  echo "    ✅ $name: writable\n";
}

// Check for .htaccess protection
$htaccessBase = rtrim($config['uploads']['base'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.htaccess';
if (is_file($htaccessBase)) {
  echo "    ✅ .htaccess protection: present\n";
} else {
  $warnings[] = "    ⚠️  .htaccess missing in uploads root (will be created on first upload)";
}

// ─────────────────────────────────────────────────────────────
// 4. CHECK PHP CONFIGURATION
// ─────────────────────────────────────────────────────────────
echo "\n[4/5] PHP Configuration...\n";

$phpChecks = [
  'display_errors' => ['expected' => '0', 'critical' => true],
  'log_errors' => ['expected' => '1', 'critical' => true],
  'file_uploads' => ['expected' => '1', 'critical' => true],
  'post_max_size' => ['min_mb' => 10, 'critical' => false],
  'upload_max_filesize' => ['min_mb' => 5, 'critical' => false],
];

foreach ($phpChecks as $key => $check) {
  $actual = ini_get($key);
  
  if (isset($check['expected'])) {
    if ($actual === $check['expected']) {
      echo "    ✅ $key = $actual\n";
    } else {
      $msg = "    ❌ $key = $actual (expected {$check['expected']})";
      if ($check['critical']) {
        $failures[] = $msg;
      } else {
        $warnings[] = $msg;
      }
    }
  } elseif (isset($check['min_mb'])) {
    $actualBytes = return_bytes($actual);
    $minBytes = $check['min_mb'] * 1024 * 1024;
    
    if ($actualBytes >= $minBytes) {
      echo "    ✅ $key = $actual\n";
    } else {
      $msg = "    ⚠️  $key = $actual (recommended >= {$check['min_mb']}M)";
      $warnings[] = $msg;
    }
  }
}

echo "    ℹ️  PHP version: " . PHP_VERSION . "\n";

// ─────────────────────────────────────────────────────────────
// 5. CHECK LOG DIRECTORY
// ─────────────────────────────────────────────────────────────
echo "\n[5/5] Log Directory...\n";

$logDir = dirname(__FILE__) . '/public/logs';
if (!is_dir($logDir)) {
  echo "    ⚠️  Log directory missing (will be created at runtime)\n";
} elseif (!is_writable($logDir)) {
  $failures[] = "    ❌ Log directory not writable: $logDir";
} else {
  echo "    ✅ Log directory: writable\n";
}

// ═════════════════════════════════════════════════════════════
// SUMMARY
// ═════════════════════════════════════════════════════════════
echo "\n═══════════════════════════════════════════════════════════\n";
echo "  VALIDATION SUMMARY\n";
echo "═══════════════════════════════════════════════════════════\n\n";

if (count($failures) > 0) {
  echo "❌ CRITICAL FAILURES (" . count($failures) . "):\n";
  foreach ($failures as $failure) {
    echo "$failure\n";
  }
  echo "\n";
}

if (count($warnings) > 0) {
  echo "⚠️  WARNINGS (" . count($warnings) . "):\n";
  foreach ($warnings as $warning) {
    echo "$warning\n";
  }
  echo "\n";
}

if (count($failures) === 0) {
  echo "✅ ALL CRITICAL CHECKS PASSED\n\n";
  if (count($warnings) > 0) {
    echo "⚠️  Warnings present but deployment can proceed\n";
    echo "   Review warnings and address if possible\n\n";
    exit(0);
  } else {
    echo "🎉 SYSTEM READY FOR DEPLOYMENT\n\n";
    exit(0);
  }
} else {
  echo "❌ DEPLOYMENT ABORTED\n";
  echo "   Fix critical failures before deploying\n\n";
  exit(1);
}

// ═════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════

function return_bytes(string $val): int {
  $val = trim($val);
  $last = strtolower($val[strlen($val)-1]);
  $val = (int)$val;
  switch($last) {
    case 'g': $val *= 1024;
    case 'm': $val *= 1024;
    case 'k': $val *= 1024;
  }
  return $val;
}
