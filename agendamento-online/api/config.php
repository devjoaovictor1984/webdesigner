<?php

declare(strict_types=1);

return [
    'timezone' => getenv('APP_TIMEZONE') ?: 'America/Cuiaba',
    'slot_step_minutes' => 15,
    'minimum_lead_minutes' => 30,
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'agendamento_online',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    'schedule' => [
        0 => [],
        1 => [
            ['start' => '09:00', 'end' => '18:00'],
        ],
        2 => [
            ['start' => '09:00', 'end' => '18:00'],
        ],
        3 => [
            ['start' => '09:00', 'end' => '18:00'],
        ],
        4 => [
            ['start' => '09:00', 'end' => '18:00'],
        ],
        5 => [
            ['start' => '09:00', 'end' => '18:00'],
        ],
        6 => [
            ['start' => '09:00', 'end' => '13:00'],
        ],
    ],
];
