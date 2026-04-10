CREATE DATABASE IF NOT EXISTS agendamento_online
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE agendamento_online;

CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    category_label VARCHAR(60) DEFAULT NULL,
    description TEXT NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    price_cents INT UNSIGNED NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_services_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    service_id INT UNSIGNED NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(40) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_end_time TIME NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_booking_start (appointment_date, appointment_time),
    KEY idx_bookings_schedule (appointment_date, status, appointment_time, appointment_end_time),
    CONSTRAINT fk_bookings_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blocked_slots (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_blocked_slots_range (blocked_date, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO services (
    name,
    slug,
    category_label,
    description,
    duration_minutes,
    price_cents,
    sort_order
) VALUES
    (
        'Consultoria Express',
        'consultoria-express',
        'Mais agil',
        'Diagnostico objetivo para quem quer resolver rapido.',
        45,
        12000,
        1
    ),
    (
        'Sessao Premium',
        'sessao-premium',
        'Mais completa',
        'Atendimento mais detalhado com espaco para analise profunda.',
        90,
        26000,
        2
    ),
    (
        'Retorno Estrategico',
        'retorno-estrategico',
        'Pos-atendimento',
        'Ideal para continuidade, revisao e proximos passos.',
        30,
        8000,
        3
    )
ON DUPLICATE KEY UPDATE
    category_label = VALUES(category_label),
    description = VALUES(description),
    duration_minutes = VALUES(duration_minutes),
    price_cents = VALUES(price_cents),
    sort_order = VALUES(sort_order),
    is_active = 1;
