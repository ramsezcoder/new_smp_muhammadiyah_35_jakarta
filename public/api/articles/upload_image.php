<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// SECURITY: Require authentication (Admin, Author, or Superadmin only)
require_auth($config, ['Admin', 'Author', 'Superadmin']);

// Only allow POST requests
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Check if file was uploaded
if (!isset($_FILES['featured_image'])) {
  respond(false, 'No file uploaded', [], 400);
}

// SECURITY: Use centralized validation helper
$check = validate_image_upload($_FILES['featured_image']);
if (!$check['ok']) {
  respond(false, $check['error'], [], 400);
}

// Use config-based upload directory
$uploadDir = $config['uploads']['articles'] ?? '';
if ($uploadDir === '') {
  respond(false, 'Upload directory not configured', [], 500);
}

// Ensure upload directory exists and is writable
if (!is_dir($uploadDir)) {
  if (!@mkdir($uploadDir, 0755, true)) {
    respond(false, 'Failed to create upload directory', [], 500);
  }
}

if (!is_writable($uploadDir)) {
  respond(false, 'Upload directory not writable', [], 500);
}

// SECURITY: Ensure .htaccess protection exists
$htaccessPath = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.htaccess';
if (!is_file($htaccessPath)) {
  $htaccessContent = "Options -Indexes\nphp_flag engine off\n<FilesMatch \"\\.(php|phtml|php5|phar)$\">\n  Require all denied\n</FilesMatch>\n";
  if (!@file_put_contents($htaccessPath, $htaccessContent)) {
    respond(false, 'Failed to create security protection', [], 500);
  }
}

// Generate unique filename using centralized helper
$pathinfo = pathinfo($_FILES['featured_image']['name']);
$ext = strtolower($pathinfo['extension'] ?? 'jpg');
$baseSlug = 'article-image-' . time();
[$filename, $destination] = unique_filename($uploadDir, $baseSlug, $ext);

// Move uploaded file
if (!move_uploaded_file($_FILES['featured_image']['tmp_name'], $destination)) {
  respond(false, 'Failed to save file', [], 500);
}

// Return success with file info
respond(true, 'Image uploaded successfully', [
  'filename' => $filename,
  'url' => uploads_url_path('articles') . '/' . $filename
]);
