<?php
return [
  'db' => [
    'host' => 'localhost',
    'name' => 'u541580780_smpmuh35',
    'user' => 'u541580780_smpmuh35',
    'pass' => 'Muhammadiyah_35!!',
    'charset' => 'utf8mb4'
  ],
  'jwt_secret' => 'ganti_dengan_secret_random',
  'uploads' => [
    'base'     => dirname(__DIR__) . '/public/uploads',
    'articles' => dirname(__DIR__) . '/public/uploads/articles',
    'gallery'  => dirname(__DIR__) . '/public/uploads/gallery',
    'staff'    => dirname(__DIR__) . '/public/uploads/staff',
    // 'videos' key retained for directory creation only
    // Videos use YouTube embeds (no file uploads)
    'videos'   => dirname(__DIR__) . '/public/uploads/videos',
  ]
];
