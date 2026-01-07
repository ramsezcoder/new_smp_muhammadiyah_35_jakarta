<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// Auth: only Admin/Author/Superadmin can create
$user = require_auth($config, ['Admin','Author','Superadmin']);

// ---------- INPUT PARSING ----------
$title = trim((string)($_POST['title'] ?? ''));
$slug = trim((string)($_POST['slug'] ?? ''));
$content = trim((string)($_POST['content'] ?? ''));
$excerpt = trim((string)($_POST['excerpt'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));
$status = trim((string)($_POST['status'] ?? 'draft'));
$seoTitle = trim((string)($_POST['seo_title'] ?? ''));
$seoDescription = trim((string)($_POST['seo_description'] ?? ''));
$featuredImageAlt = trim((string)($_POST['featured_image_alt'] ?? ''));

// ---------- VALIDATION ----------
if ($title === '' || $content === '') {
  respond(false, 'Title and content required', [], 400);
}

// ---------- SLUG ----------
if ($slug === '') {
  $slug = strtolower(trim(preg_replace('/[^a-z0-9\-]+/i', '-', $title), '-'));
}
$slug = preg_replace('/[^a-z0-9\-]/i', '', $slug) ?: 'article-' . time();

// ---------- TAGS HANDLING (HARD FIX) ----------
$tagsRaw = $_POST['tags'] ?? '[]';
$tagsDecoded = json_decode($tagsRaw, true);
$tags = is_array($tagsDecoded) ? json_encode($tagsDecoded, JSON_UNESCAPED_UNICODE) : '[]';

// ---------- NORMALISE EMPTY VALUES ----------
$category = $category !== '' ? $category : null;
$featuredImageAlt = $featuredImageAlt !== '' ? $featuredImageAlt : null;
$seoTitle = $seoTitle !== '' ? $seoTitle : null;
$seoDescription = $seoDescription !== '' ? $seoDescription : null;

// ---------- IMAGE UPLOAD ----------
$featuredImage = null;

if (isset($_FILES['featured_image'])) {
  $errorCode = $_FILES['featured_image']['error'] ?? UPLOAD_ERR_NO_FILE;
  if ($errorCode === UPLOAD_ERR_NO_FILE) {
    // Optional upload: skip without error
  } elseif ($errorCode === UPLOAD_ERR_OK) {
    // --- HARD FIX: Ensure uploads directory exists and is writable ---
    $uploadsDir = $config['uploads']['articles'] ?? '';
    error_log('ARTICLE CONFIG PATH: ' . $uploadsDir);
    if ($uploadsDir === '') {
      respond(false, 'Uploads directory not configured', [], 500);
    }

    if (!is_dir($uploadsDir)) {
      @mkdir($uploadsDir, 0775, true);
    }

    // Best-effort: ensure .htaccess prevents indexing and disables PHP execution
    $htaccessPath = rtrim($uploadsDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($htaccessPath)) {
      @file_put_contents($htaccessPath, "Options -Indexes\nphp_flag engine off\n");
    }

    // Verify directory writable
    if (!is_writable($uploadsDir)) {
      error_log('ARTICLE UPLOAD WRITABLE: NO');
      respond(false, 'Uploads directory is not writable', [], 500);
    }

    // Enforce upload_max_filesize and image type
    $maxSizeRaw = ini_get('upload_max_filesize');
    $suffix = strtoupper(trim((string)preg_replace('/[^bkmg]/i', '', $maxSizeRaw))); // K/M/G
    $num = (float)preg_replace('/[^0-9\.]/', '', (string)$maxSizeRaw);
    $mult = 1;
    if ($suffix === 'K') $mult = 1024;
    elseif ($suffix === 'M') $mult = 1024 * 1024;
    elseif ($suffix === 'G') $mult = 1024 * 1024 * 1024;
    $maxSizeBytes = (int)($num * $mult);

    $file = $_FILES['featured_image'] ?? null;
    if (!$file) {
      respond(false, 'No file uploaded', [], 400);
    }

    if (!isset($file['size']) || (int)$file['size'] <= 0) {
      respond(false, 'Invalid upload size', [], 400);
    }
    if ($maxSizeBytes > 0 && (int)$file['size'] > $maxSizeBytes) {
      respond(false, 'Uploaded file exceeds server limit', [], 400);
    }

    // Validate image MIME/type strictly in addition to validate_image_upload
    $tmpPath = $file['tmp_name'] ?? '';
    $isImage = false;
    if ($tmpPath && function_exists('exif_imagetype')) {
      $type = @exif_imagetype($tmpPath);
      $isImage = $type !== false;
    } else {
      $info = @getimagesize($tmpPath);
      $isImage = $info !== false;
    }
    if (!$isImage) {
      respond(false, 'Only image uploads are allowed', [], 400);
    }

    $check = validate_image_upload($_FILES['featured_image']);
    if (!$check['ok']) {
      respond(false, $check['error'], [], 400);
    }

    $pathinfo = pathinfo($_FILES['featured_image']['name']);
    $ext = strtolower($pathinfo['extension'] ?? 'jpg');
    $baseSlug = slugify($title);

    [$featuredImage, $target] = unique_filename(
      $uploadsDir,
      $baseSlug,
      $ext
    );

    // Debug logs before moving the file
    error_log('ARTICLE UPLOAD PATH: ' . $target);
    error_log('ARTICLE UPLOAD WRITABLE: ' . (is_writable($uploadsDir) ? 'YES' : 'NO'));
    error_log('ARTICLE UPLOAD ERROR CODE: ' . ($_FILES['featured_image']['error'] ?? 'N/A'));

    // Safe guard: move only if directory exists and writable
    if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
      @unlink($_FILES['featured_image']['tmp_name'] ?? '');
      respond(false, 'Uploads directory is not ready', [], 500);
    }
    if (!@move_uploaded_file($_FILES['featured_image']['tmp_name'], $target)) {
      @unlink($_FILES['featured_image']['tmp_name'] ?? '');
      respond(false, 'Failed to save featured image', [], 500);
    }
  } else {
    // Other upload errors
    error_log('ARTICLE UPLOAD ERROR CODE: ' . $errorCode);
    respond(false, 'Upload error', ['code' => $errorCode], 400);
  }
}

// ---------- DB OPERATION ----------
try {
  $pdo->beginTransaction();

  $maxSort = (int)$pdo
    ->query('SELECT IFNULL(MAX(sort_order), 0) FROM articles')
    ->fetchColumn();

  $publishedAt = ($status === 'published')
    ? date('Y-m-d H:i:s')
    : null;

  $stmt = $pdo->prepare(
    'INSERT INTO articles (
      title,
      slug,
      content_html,
      excerpt,
      featured_image,
      featured_image_alt,
      category,
      tags_json,
      status,
      seo_title,
      seo_description,
      author_id,
      author_name,
      sort_order,
      published_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  $stmt->execute([
    $title,
    $slug,
    $content,
    $excerpt !== '' ? $excerpt : null,
    $featuredImage ?: null,
    $featuredImageAlt,
    $category,
    $tags,
    $status,
    $seoTitle,
    $seoDescription,
    $user['sub'],
    $user['name'] ?? 'Unknown',
    $maxSort + 1,
    $publishedAt
  ]);

  $id = (int)$pdo->lastInsertId();

  $pdo->commit();

  respond(true, 'Article created', [
    'id' => $id,
    'slug' => $slug,
    'featured_image' => $featuredImage,
    'featured_image_url' =>
      $featuredImage ? '/uploads/articles/' . $featuredImage : null,
    'featured_image_alt' => $featuredImageAlt
  ]);

} catch (Throwable $e) {

  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }

  if ($featuredImage) {
    @unlink($config['uploads']['articles'] . DIRECTORY_SEPARATOR . $featuredImage);
  }

  error_log("ARTICLE CREATE ERROR: " . $e->getMessage());

  respond(false, 'Create failed', [
    'error' => $e->getMessage()
  ], 500);
}
