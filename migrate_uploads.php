<?php
declare(strict_types=1);

/**
 * MIGRATION SCRIPT: /uploads/ → /public/uploads/
 * 
 * PURPOSE: Consolidate legacy duplicate directory into authoritative location
 * SAFETY: Fail-closed, verbose logging, collision handling via unique_filename
 * 
 * USAGE: php migrate_uploads.php
 */

require_once __DIR__ . '/public/api/_bootstrap.php';

echo "=== UPLOAD DIRECTORY MIGRATION ===\n";
echo "Source: /uploads/\n";
echo "Target: /public/uploads/\n\n";

$legacyBase = dirname(__DIR__) . '/uploads';
$authBase = $config['uploads']['base'];

if (!is_dir($legacyBase)) {
  echo "ERROR: Legacy directory not found: $legacyBase\n";
  exit(1);
}

if (!is_dir($authBase)) {
  echo "ERROR: Authoritative directory not found: $authBase\n";
  exit(1);
}

/**
 * Recursively scan and migrate files
 */
function migrate_directory(string $sourceDir, string $targetDir, string $subdir = '') {
  $items = scandir($sourceDir);
  $migrated = 0;
  $skipped = 0;
  $errors = 0;
  
  foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    
    $sourcePath = $sourceDir . DIRECTORY_SEPARATOR . $item;
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $item;
    
    if (is_dir($sourcePath)) {
      // Recurse into subdirectory
      if (!is_dir($targetPath)) {
        mkdir($targetPath, 0775, true);
        echo "  [DIR] Created $targetPath\n";
      }
      $result = migrate_directory($sourcePath, $targetPath, $subdir . '/' . $item);
      $migrated += $result['migrated'];
      $skipped += $result['skipped'];
      $errors += $result['errors'];
    } elseif (is_file($sourcePath)) {
      // Skip .htaccess (will be recreated by upload endpoints)
      if ($item === '.htaccess') {
        echo "  [SKIP] .htaccess (will be recreated)\n";
        $skipped++;
        continue;
      }
      
      // Check for collision
      if (file_exists($targetPath)) {
        // Generate unique filename
        $pathinfo = pathinfo($item);
        $ext = strtolower($pathinfo['extension'] ?? '');
        $base = $pathinfo['filename'] ?? $item;
        
        [$uniqueName, $uniquePath] = unique_filename($targetDir, $base, $ext);
        $targetPath = $uniquePath;
        
        echo "  [COLLISION] $item → $uniqueName\n";
      }
      
      // Copy file (preserve original until verification)
      if (copy($sourcePath, $targetPath)) {
        echo "  [COPY] $item → " . basename($targetPath) . "\n";
        $migrated++;
      } else {
        echo "  [ERROR] Failed to copy $item\n";
        $errors++;
      }
    }
  }
  
  return ['migrated' => $migrated, 'skipped' => $skipped, 'errors' => $errors];
}

echo "Starting migration...\n\n";
$result = migrate_directory($legacyBase, $authBase);

echo "\n=== MIGRATION SUMMARY ===\n";
echo "Migrated: {$result['migrated']} files\n";
echo "Skipped: {$result['skipped']} files\n";
echo "Errors: {$result['errors']} files\n";

if ($result['errors'] > 0) {
  echo "\n[FAIL] Migration completed with errors. Review logs and retry.\n";
  echo "Legacy directory NOT deleted for safety.\n";
  exit(1);
}

echo "\n[SUCCESS] Migration complete without errors.\n";
echo "\nNEXT STEPS:\n";
echo "1. Verify files in /public/uploads/\n";
echo "2. Test image loading in frontend\n";
echo "3. Once verified, delete legacy /uploads/ directory manually\n";
echo "   Command: rm -rf " . escapeshellarg($legacyBase) . "\n";
