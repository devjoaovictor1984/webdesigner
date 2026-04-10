<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

require_method('POST');

$payload = parse_json_body();

$serviceId = filter_var($payload['service_id'] ?? null, FILTER_VALIDATE_INT);
$appointmentDate = normalize_date((string) ($payload['appointment_date'] ?? ''));
$appointmentTime = normalize_time((string) ($payload['appointment_time'] ?? ''));
$customerName = trim((string) ($payload['name'] ?? ''));
$customerEmail = trim((string) ($payload['email'] ?? ''));
$customerPhone = trim((string) ($payload['phone'] ?? ''));
$notes = trim((string) ($payload['notes'] ?? ''));

if ($serviceId === false || $serviceId === null || $serviceId < 1) {
    error_response('Servico invalido.', 422);
}

validate_future_or_today_date($appointmentDate);

if (mb_strlen($customerName) < 3) {
    error_response('Informe um nome valido.', 422);
}

if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
    error_response('Informe um email valido.', 422);
}

if (mb_strlen($customerPhone) < 8) {
    error_response('Informe um telefone valido.', 422);
}

if (mb_strlen($notes) > 1500) {
    error_response('As observacoes estao muito longas.', 422);
}

$pdo = db();
$service = find_service($pdo, (int) $serviceId);
$availableSlots = available_slots($pdo, $appointmentDate, (int) $service['duration_minutes']);
$availableTimes = array_column($availableSlots, 'value');

if (!in_array($appointmentTime, $availableTimes, true)) {
    error_response('Esse horario nao esta mais disponivel.', 409);
}

$appointmentEndTime = add_minutes_to_time(
    $appointmentDate,
    $appointmentTime,
    (int) $service['duration_minutes']
);

$statement = $pdo->prepare(
    'INSERT INTO bookings (
        service_id,
        customer_name,
        customer_email,
        customer_phone,
        appointment_date,
        appointment_time,
        appointment_end_time,
        duration_minutes,
        notes,
        status
    ) VALUES (
        :service_id,
        :customer_name,
        :customer_email,
        :customer_phone,
        :appointment_date,
        :appointment_time,
        :appointment_end_time,
        :duration_minutes,
        :notes,
        :status
    )'
);

try {
    $statement->execute([
        ':service_id' => $service['id'],
        ':customer_name' => $customerName,
        ':customer_email' => $customerEmail,
        ':customer_phone' => $customerPhone,
        ':appointment_date' => $appointmentDate,
        ':appointment_time' => $appointmentTime,
        ':appointment_end_time' => $appointmentEndTime,
        ':duration_minutes' => $service['duration_minutes'],
        ':notes' => $notes === '' ? null : $notes,
        ':status' => 'pending',
    ]);
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        error_response('Esse horario acabou de ser reservado por outra pessoa.', 409);
    }

    throw $exception;
}

json_response(
    [
        'ok' => true,
        'message' => sprintf(
            'Pre-agendamento criado para %s em %s as %s.',
            $service['name'],
            $appointmentDate,
            substr($appointmentTime, 0, 5)
        ),
        'booking' => [
            'id' => (int) $pdo->lastInsertId(),
            'service' => $service['name'],
            'date' => $appointmentDate,
            'time' => substr($appointmentTime, 0, 5),
            'status' => 'pending',
        ],
    ],
    201
);
