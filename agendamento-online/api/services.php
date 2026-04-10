<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

require_method('GET');

$statement = db()->query(
    'SELECT id, name, slug, category_label, description, duration_minutes, price_cents, sort_order
     FROM services
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC'
);

$services = array_map('map_service', $statement->fetchAll());

json_response([
    'ok' => true,
    'services' => $services,
]);
