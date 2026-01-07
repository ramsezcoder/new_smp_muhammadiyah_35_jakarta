<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json');

try {

  $stmt = $pdo->prepare("
    SELECT id, name, role, photo_filename 
    FROM staff 
    WHERE is_published = 1
    ORDER BY sort_order ASC
  ");

  $stmt->execute();
  $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $data = array_map(function($row){
    return [
      'id' => (int)$row['id'],
      'name' => $row['name'],
      'role' => $row['role'],
      'photo_url' => '/uploads/staff/'.$row['photo_filename']
    ];
  }, $items);

  file_put_contents(
    __DIR__.'/../../data/published_staff.json',
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
  );

  echo json_encode([
    'success' => true,
    'count' => count($data)
  ]);

} catch (Throwable $e) {
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}
