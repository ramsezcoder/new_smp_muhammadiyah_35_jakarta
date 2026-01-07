<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(false, 'Invalid method', [], 405);
}

// Check if file was uploaded
if (!isset($_FILES['featured_image'])) {
  respond(false, 'No file uploaded', [], 400);
}

$file = $_FILES['featured_image'];

// Validate MIME type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
  respond(false, 'Invalid file type. Only JPG, PNG, and WebP allowed', [], 400);
}

// Validate file size (max 4MB)
if ($file['size'] > 4 * 1024 * 1024) {
  respond(false, 'File too large. Maximum 4MB allowed', [], 400);
}

// Generate unique filename
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename = uniqid('img_', true) . '.' . $ext;

// Ensure upload directory exists
$uploadDir = __DIR__ . '/../../uploads/articles';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

$destination = $uploadDir . '/' . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destination)) {
  respond(false, 'Failed to save file', [], 500);
}

// Return success with file info
respond(true, 'Image uploaded successfully', [
  'filename' => $filename,
  'url' => '/uploads/articles/' . $filename
]);
