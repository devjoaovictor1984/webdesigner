<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

require_method('GET');

$serviceId = filter_input(INPUT_GET, 'service_id', FILTER_VALIDATE_INT);
$date = normalize_date((string) ($_GET['date'] ?? ''));

if ($serviceId === false || $serviceId === null || $serviceId < 1) {
    error_response('Servico invalido.', 422);
}

validate_future_or_today_date($date);

$pdo = db();
$service = find_service($pdo, (int) $serviceId);
$slots = available_slots($pdo, $date, (int) $service['duration_minutes']);

json_response([
    'ok' => true,
    'date' => $date,
    'service' => $service,
    'slots' => $slots,
    'total_slots' => count($slots),
    'is_open' => schedule_ranges_for_date($date) !== [],
]);
