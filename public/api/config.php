<?php
// Copy this file to config.local.php and fill your DB credentials in production.
return [
  'db' => [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'name' => getenv('DB_NAME') ?: 'smpmuh35',
    'user' => getenv('DB_USER') ?: 'dbuser',
    'pass' => getenv('DB_PASS') ?: 'dbpass',
    'charset' => 'utf8mb4'
  ],
  'uploads' => [
    'base' => dirname(__DIR__) . '/uploads',
    'articles' => dirname(__DIR__) . '/uploads/articles',
    'gallery'  => dirname(__DIR__) . '/uploads/gallery',
    'staff'    => dirname(__DIR__) . '/uploads/staff',
    'videos'   => dirname(__DIR__) . '/uploads/videos',
  ]
];
?>
