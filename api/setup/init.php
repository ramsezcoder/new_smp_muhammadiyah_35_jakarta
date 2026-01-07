<?php
/**
 * Complete Database Setup + Seed Script
 * Runs both migrations and user seeding in one call
 * 
 * Usage: Call POST /api/setup/init.php from browser or curl
 * 
 * curl -X POST http://localhost/api/setup/init.php
 */
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$setup_log = [];

try {
  // Step 1: Run all migrations from schema.sql
  $sql = file_get_contents(__DIR__ . '/../schema.sql');
  if ($sql === false) {
    throw new Exception('Failed to read schema.sql');
  }
  
  $pdo->exec($sql);
  $setup_log[] = '✓ Database schema applied';

  // Step 2: Seed default users
  $defaults = [
    ['name' => 'Super Administrator', 'email' => 'admin@smpmuh35.sch.id', 'password' => 'Admin123!', 'role' => 'Superadmin'],
    ['name' => 'Admin Staff', 'email' => 'adminstaff@smpmuh35.sch.id', 'password' => 'AdminStaff123!', 'role' => 'Admin'],
    ['name' => 'Content Creator', 'email' => 'postmaker@smpmuh35.sch.id', 'password' => 'PostMaker123!', 'role' => 'Author'],
  ];

  $created = 0;
  foreach ($defaults as $u) {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$u['email']]);
    if ($stmt->fetch()) {
      $setup_log[] = "- User {$u['email']} already exists";
      continue;
    }
    $hash = password_hash($u['password'], PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, "active")');
    $ins->execute([$u['name'], $u['email'], $hash, $u['role']]);
    $created++;
    $setup_log[] = "✓ Created user: {$u['email']}";
  }

  respond(true, 'Database setup complete', [
    'log' => $setup_log,
    'users_created' => $created,
    'ready_to_login' => true,
    'default_users' => [
      'email' => 'admin@smpmuh35.sch.id',
      'password' => 'Admin123!'
    ]
  ]);
} catch (Throwable $e) {
  respond(false, 'Setup failed', [
    'error' => $e->getMessage(),
    'log' => $setup_log
  ], 500);
}
?>
