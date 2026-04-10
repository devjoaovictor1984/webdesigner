<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

date_default_timezone_set((string) $config['timezone']);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function app_config(?string $path = null): mixed
{
    global $config;

    if ($path === null) {
        return $config;
    }

    $value = $config;

    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return null;
        }

        $value = $value[$segment];
    }

    return $value;
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_response(string $message, int $status = 400, array $extra = []): never
{
    json_response(
        array_merge(
            [
                'ok' => false,
                'message' => $message,
            ],
            $extra
        ),
        $status
    );
}

function require_method(string $method): void
{
    $currentMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($currentMethod !== $method) {
        header('Allow: ' . $method);
        error_response('Metodo nao permitido.', 405);
    }
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dbConfig = app_config('db');

    if (!is_array($dbConfig)) {
        error_response('Configuracao de banco invalida.', 500);
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $dbConfig['host'],
        $dbConfig['port'],
        $dbConfig['name'],
        $dbConfig['charset']
    );

    try {
        $pdo = new PDO(
            $dsn,
            (string) $dbConfig['user'],
            (string) $dbConfig['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (PDOException $exception) {
        error_response(
            'Falha ao conectar no banco. Importe o schema SQL e revise a configuracao.',
            500,
            ['error' => $exception->getMessage()]
        );
    }

    return $pdo;
}

function parse_json_body(): array
{
    $rawBody = file_get_contents('php://input');

    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);

    if (!is_array($decoded)) {
        error_response('JSON invalido.', 400);
    }

    return $decoded;
}

function normalize_date(string $date): string
{
    $date = trim($date);
    $parsed = DateTimeImmutable::createFromFormat('Y-m-d', $date);

    if ($parsed === false || $parsed->format('Y-m-d') !== $date) {
        error_response('Data invalida. Use YYYY-MM-DD.', 422);
    }

    return $date;
}

function normalize_time(string $time): string
{
    $time = trim($time);

    foreach (['H:i:s', 'H:i'] as $format) {
        $parsed = DateTimeImmutable::createFromFormat($format, $time);

        if ($parsed instanceof DateTimeImmutable) {
            return $parsed->format('H:i:s');
        }
    }

    error_response('Horario invalido. Use HH:MM.', 422);
}

function validate_future_or_today_date(string $date): void
{
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');

    if ($date < $today) {
        error_response('Datas passadas nao podem ser usadas.', 422);
    }
}

function format_duration(int $minutes): string
{
    if ($minutes < 60) {
        return $minutes . ' min';
    }

    $hours = intdiv($minutes, 60);
    $remainingMinutes = $minutes % 60;

    if ($remainingMinutes === 0) {
        return $hours . 'h';
    }

    return $hours . 'h ' . $remainingMinutes . 'min';
}

function format_brl(int $cents): string
{
    return 'R$ ' . number_format($cents / 100, 2, ',', '.');
}

function map_service(array $service): array
{
    $service['id'] = (int) $service['id'];
    $service['duration_minutes'] = (int) $service['duration_minutes'];
    $service['price_cents'] = (int) $service['price_cents'];
    $service['sort_order'] = isset($service['sort_order']) ? (int) $service['sort_order'] : 0;
    $service['duration_label'] = format_duration($service['duration_minutes']);
    $service['price_label'] = format_brl($service['price_cents']);

    return $service;
}

function find_service(PDO $pdo, int $serviceId): array
{
    $statement = $pdo->prepare(
        'SELECT id, name, slug, category_label, description, duration_minutes, price_cents, sort_order
         FROM services
         WHERE id = :id
           AND is_active = 1
         LIMIT 1'
    );
    $statement->execute([':id' => $serviceId]);

    $service = $statement->fetch();

    if ($service === false) {
        error_response('Servico nao encontrado.', 404);
    }

    return map_service($service);
}

function make_datetime(string $date, string $time): DateTimeImmutable
{
    return new DateTimeImmutable(
        $date . ' ' . $time,
        new DateTimeZone((string) app_config('timezone'))
    );
}

function add_minutes_to_time(string $date, string $time, int $minutes): string
{
    return make_datetime($date, $time)
        ->modify(sprintf('+%d minutes', $minutes))
        ->format('H:i:s');
}

function schedule_ranges_for_date(string $date): array
{
    $weekday = (int) (new DateTimeImmutable($date))->format('w');
    $ranges = app_config('schedule.' . $weekday);

    return is_array($ranges) ? $ranges : [];
}

function candidate_slots_for_date(string $date, int $durationMinutes): array
{
    $ranges = schedule_ranges_for_date($date);

    if ($ranges === []) {
        return [];
    }

    $stepMinutes = (int) app_config('slot_step_minutes');
    $leadMinutes = (int) app_config('minimum_lead_minutes');
    $now = new DateTimeImmutable('now');
    $today = $now->format('Y-m-d');
    $slots = [];

    foreach ($ranges as $range) {
        $cursor = make_datetime($date, (string) $range['start']);
        $boundary = make_datetime($date, (string) $range['end']);

        while ($cursor->modify(sprintf('+%d minutes', $durationMinutes)) <= $boundary) {
            if ($date !== $today || $cursor >= $now->modify(sprintf('+%d minutes', $leadMinutes))) {
                $slots[] = $cursor->format('H:i:s');
            }

            $cursor = $cursor->modify(sprintf('+%d minutes', $stepMinutes));
        }
    }

    return $slots;
}

function interval_has_conflict(PDO $pdo, string $date, string $startTime, string $endTime): bool
{
    $bookingsStatement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM bookings
         WHERE appointment_date = :date
           AND status IN (\'pending\', \'confirmed\')
           AND appointment_time < :end_time
           AND appointment_end_time > :start_time'
    );
    $bookingsStatement->execute([
        ':date' => $date,
        ':start_time' => $startTime,
        ':end_time' => $endTime,
    ]);

    if ((int) $bookingsStatement->fetchColumn() > 0) {
        return true;
    }

    $blockedStatement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM blocked_slots
         WHERE blocked_date = :date
           AND start_time < :end_time
           AND end_time > :start_time'
    );
    $blockedStatement->execute([
        ':date' => $date,
        ':start_time' => $startTime,
        ':end_time' => $endTime,
    ]);

    return (int) $blockedStatement->fetchColumn() > 0;
}

function available_slots(PDO $pdo, string $date, int $durationMinutes): array
{
    $slots = [];

    foreach (candidate_slots_for_date($date, $durationMinutes) as $startTime) {
        $endTime = add_minutes_to_time($date, $startTime, $durationMinutes);

        if (!interval_has_conflict($pdo, $date, $startTime, $endTime)) {
            $slots[] = [
                'value' => $startTime,
                'label' => substr($startTime, 0, 5),
            ];
        }
    }

    return $slots;
}

set_exception_handler(
    static function (Throwable $exception): never {
        error_response(
            'Erro interno da API.',
            500,
            ['error' => $exception->getMessage()]
        );
    }
);
