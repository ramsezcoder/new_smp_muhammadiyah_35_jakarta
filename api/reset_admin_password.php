<?php

require __DIR__ . '/_bootstrap.php';

$email = 'admin@smpmuh35.sch.id';
$newPassword = 'Admin123!';

$hash = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
$stmt->execute([$hash, $email]);

echo "DONE ✓ Password reset untuk $email sekarang adalah: $newPassword";
