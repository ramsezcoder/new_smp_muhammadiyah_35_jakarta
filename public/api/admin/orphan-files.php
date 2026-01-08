<?php
declare(strict_types=1);

// ADMIN-ONLY ORPHAN FILE DETECTION
// Scans /public/uploads/ and cross-checks with database
// READ-ONLY: Returns orphan list without deletion

require_once dirname(__DIR__) . '/_bootstrap.php';
require_auth($config, ['Admin', 'Superadmin']);

/**
 * Scan directory recursively for files
 * @param string $dir Directory path
 * @param string $baseDir Base directory for relative paths
 * @return array [['path' => 'full/path', 'rel' => 'relative/path', 'subdir' => 'articles'], ...]
 */
function scan_files(string $dir, string $baseDir): array {
  $files = [];
  if (!is_dir($dir)) return $files;
  
  $items = scandir($dir);
  foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    
    $path = $dir . DIRECTORY_SEPARATOR . $item;
    if (is_dir($path)) {
      $files = array_merge($files, scan_files($path, $baseDir));
    } elseif (is_file($path)) {
      // Skip .htaccess files
      if ($item === '.htaccess') continue;
      
      $relPath = str_replace($baseDir . DIRECTORY_SEPARATOR, '', $path);
      $relPath = str_replace(DIRECTORY_SEPARATOR, '/', $relPath); // Normalize to forward slashes
      
      // Extract subdirectory (articles, gallery, staff)
      $parts = explode('/', $relPath);
      $subdir = $parts[0] ?? '';
      
      $files[] = [
        'path' => $path,
        'rel' => $relPath,
        'subdir' => $subdir,
        'filename' => basename($path),
        'size' => filesize($path)
      ];
    }
  }
  return $files;
}

try {
  $pdo = get_db($config);
  
  // Scan /public/uploads/ recursively
  $uploadBase = $config['uploads']['base'];
  $diskFiles = scan_files($uploadBase, $uploadBase);
  
  // Load all database file references
  $stmt = $pdo->query('SELECT filename FROM gallery_images WHERE filename IS NOT NULL');
  $galleryDB = array_flip($stmt->fetchAll(PDO::FETCH_COLUMN));
  
  $stmt = $pdo->query('SELECT photo_filename FROM staff WHERE photo_filename IS NOT NULL');
  $staffDB = array_flip($stmt->fetchAll(PDO::FETCH_COLUMN));
  
  $stmt = $pdo->query('SELECT featured_image FROM articles WHERE featured_image IS NOT NULL');
  $articlesDB = array_flip($stmt->fetchAll(PDO::FETCH_COLUMN));
  
  // Cross-check each disk file against DB
  $matched = [];
  $orphaned = [];
  
  foreach ($diskFiles as $file) {
    $filename = $file['filename'];
    $subdir = $file['subdir'];
    
    $isMatched = false;
    
    // Check in appropriate DB table based on subdirectory
    if ($subdir === 'gallery' && isset($galleryDB[$filename])) {
      $isMatched = true;
      $file['db_table'] = 'gallery_images';
    } elseif ($subdir === 'staff' && isset($staffDB[$filename])) {
      $isMatched = true;
      $file['db_table'] = 'staff';
    } elseif ($subdir === 'articles' && isset($articlesDB[$filename])) {
      $isMatched = true;
      $file['db_table'] = 'articles';
    }
    
    if ($isMatched) {
      $matched[] = $file;
    } else {
      $orphaned[] = $file;
    }
  }
  
  // Calculate totals
  $totalSize = array_reduce($diskFiles, fn($sum, $f) => $sum + $f['size'], 0);
  $orphanSize = array_reduce($orphaned, fn($sum, $f) => $sum + $f['size'], 0);
  
  respond(true, 'Orphan scan complete', [
    'summary' => [
      'total_files' => count($diskFiles),
      'matched_files' => count($matched),
      'orphan_files' => count($orphaned),
      'total_size_bytes' => $totalSize,
      'orphan_size_bytes' => $orphanSize
    ],
    'matched' => $matched,
    'orphaned' => $orphaned
  ]);
  
} catch (Throwable $e) {
  respond(false, 'Orphan scan failed', ['error' => $e->getMessage()], 500);
}
