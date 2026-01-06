<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$defaults = [
  ['name' => 'Super Administrator', 'email' => 'admin@smpmuh35.sch.id', 'password' => 'Admin123!', 'role' => 'Superadmin'],
  ['name' => 'Admin Staff', 'email' => 'adminstaff@smpmuh35.sch.id', 'password' => 'AdminStaff123!', 'role' => 'Admin'],
  ['name' => 'Content Creator', 'email' => 'postmaker@smpmuh35.sch.id', 'password' => 'PostMaker123!', 'role' => 'Author'],
];

try {
  $created = 0;
  foreach ($defaults as $u) {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$u['email']]);
    if ($stmt->fetch()) continue;
    $hash = password_hash($u['password'], PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, "active")');
    $ins->execute([$u['name'], $u['email'], $hash, $u['role']]);
    $created++;
  }
  respond(true, 'Seeded users', ['created' => $created]);
} catch (Throwable $e) {
  respond(false, 'Seeding failed', ['error' => $e->getMessage()], 500);
}
