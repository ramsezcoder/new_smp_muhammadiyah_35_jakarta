<?php
// Copy this file to config.local.php and fill your DB credentials in production.
return [
  'db' => [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'name' => getenv('DB_NAME') ?: 'u541580780_smpmuh35',
    'user' => getenv('DB_USER') ?: 'u541580780_smpmuh35',
    'pass' => getenv('DB_PASS') ?: 'Muhammadiyah_35!!',
    'charset' => 'utf8mb4'
  ],
  'jwt_secret' => getenv('JWT_SECRET') ?: 'change-this-secret',
  'uploads' => [
    'base'     => dirname(__DIR__) . '/uploads',
    'articles' => dirname(__DIR__) . '/uploads/articles',
    'gallery'  => dirname(__DIR__) . '/uploads/gallery',
    'staff'    => dirname(__DIR__) . '/uploads/staff',
    // 'videos' key retained for directory creation only
    // Videos use YouTube embeds (no file uploads)
    'videos'   => dirname(__DIR__) . '/uploads/videos',
  ]
];
?>
