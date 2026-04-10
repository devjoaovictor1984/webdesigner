<?php

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.use_strict_mode', '1');
    session_name('tcm_portal');
    session_start();
}

require_once __DIR__ . '/helpers.php';

$GLOBALS['app_config'] = require __DIR__ . '/config.php';

date_default_timezone_set((string) app_config('timezone', 'America/Cuiaba'));

ensure_directory(data_path());
ensure_directory(upload_path());
ensure_directory(upload_path('portfolio'));

if (!is_file(data_path('portfolio.json'))) {
    write_json_file(data_path('portfolio.json'), []);
}

if (!is_file(data_path('leads.json'))) {
    write_json_file(data_path('leads.json'), []);
}
