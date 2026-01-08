<?php
// Quick script to check database file references
try {
    $pdo = new PDO('mysql:host=localhost;dbname=smpmuh35_web', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query('SELECT filename FROM gallery_images WHERE filename IS NOT NULL');
    $galleryFiles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Gallery DB files:\n";
    foreach ($galleryFiles as $f) echo "  - $f\n";
    
    $stmt = $pdo->query('SELECT photo_filename FROM staff WHERE photo_filename IS NOT NULL');
    $staffFiles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nStaff DB files:\n";
    foreach ($staffFiles as $f) echo "  - $f\n";
    
    $stmt = $pdo->query('SELECT featured_image FROM articles WHERE featured_image IS NOT NULL');
    $articleFiles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nArticle DB files:\n";
    foreach ($articleFiles as $f) echo "  - $f\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
