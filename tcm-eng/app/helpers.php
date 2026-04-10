<?php

declare(strict_types=1);

function app_root(string $path = ''): string
{
    $root = dirname(__DIR__);

    if ($path === '') {
        return $root;
    }

    return $root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
}

function data_path(string $path = ''): string
{
    $base = app_root('data');

    if ($path === '') {
        return $base;
    }

    return $base . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
}

function upload_path(string $path = ''): string
{
    $base = app_root('uploads');

    if ($path === '') {
        return $base;
    }

    return $base . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
}

function app_config(?string $key = null, mixed $default = null): mixed
{
    $config = $GLOBALS['app_config'] ?? [];

    if ($key === null || $key === '') {
        return $config;
    }

    $value = $config;

    foreach (explode('.', $key) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return $default;
        }

        $value = $value[$segment];
    }

    return $value;
}

function ensure_directory(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0775, true);
    }
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function set_flash(string $type, string $message): void
{
    $_SESSION['flash_message'] = [
        'type' => $type,
        'message' => $message,
    ];
}

function get_flash(): ?array
{
    $flash = $_SESSION['flash_message'] ?? null;
    unset($_SESSION['flash_message']);

    return is_array($flash) ? $flash : null;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf_token'];
}

function verify_csrf(?string $token): bool
{
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    return is_string($token) && $sessionToken !== '' && hash_equals($sessionToken, $token);
}

function require_valid_csrf(?string $token): void
{
    if (!verify_csrf($token)) {
        http_response_code(419);
        exit('Token CSRF inválido.');
    }
}

function is_logged_in(): bool
{
    return !empty($_SESSION['auth']['logged_in']);
}

function login_user(string $username): void
{
    $_SESSION['auth'] = [
        'logged_in' => true,
        'username' => $username,
        'logged_at' => date(DATE_ATOM),
    ];
}

function attempt_login(string $username, string $password): bool
{
    $configuredUser = (string) app_config('auth.username', '');
    $configuredHash = (string) app_config('auth.password_hash', '');

    if ($username !== $configuredUser) {
        return false;
    }

    if (!password_verify($password, $configuredHash)) {
        return false;
    }

    session_regenerate_id(true);
    login_user($username);

    return true;
}

function require_login(): void
{
    if (!is_logged_in()) {
        set_flash('error', 'Faça login para acessar o painel.');
        redirect('login.php');
    }
}

function logout_user(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }

    session_destroy();
}

function read_json_file(string $path, array $fallback = []): array
{
    if (!is_file($path)) {
        return $fallback;
    }

    $content = file_get_contents($path);

    if ($content === false || trim($content) === '') {
        return $fallback;
    }

    $decoded = json_decode($content, true);

    return is_array($decoded) ? $decoded : $fallback;
}

function write_json_file(string $path, array $payload): void
{
    file_put_contents(
        $path,
        json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)
    );
}

function sort_portfolio_items(array $items): array
{
    usort($items, static function (array $left, array $right): int {
        $featuredCompare = ((int) ($right['featured'] ?? false)) <=> ((int) ($left['featured'] ?? false));

        if ($featuredCompare !== 0) {
            return $featuredCompare;
        }

        $leftDate = strtotime((string) ($left['published_at'] ?? ''));
        $rightDate = strtotime((string) ($right['published_at'] ?? ''));

        if ($leftDate !== $rightDate) {
            return $rightDate <=> $leftDate;
        }

        return strcmp((string) ($right['updated_at'] ?? ''), (string) ($left['updated_at'] ?? ''));
    });

    return $items;
}

function load_portfolio(bool $publishedOnly = false): array
{
    $items = read_json_file(data_path('portfolio.json'), []);

    $items = array_values(array_filter($items, 'is_array'));

    if ($publishedOnly) {
        $items = array_values(array_filter($items, static fn(array $item): bool => (bool) ($item['published'] ?? false)));
    }

    return sort_portfolio_items($items);
}

function save_portfolio(array $items): void
{
    write_json_file(data_path('portfolio.json'), array_values(sort_portfolio_items($items)));
}

function portfolio_categories(array $items): array
{
    $categories = [];

    foreach ($items as $item) {
        $category = trim((string) ($item['category'] ?? ''));

        if ($category !== '') {
            $categories[$category] = true;
        }
    }

    return array_keys($categories);
}

function featured_portfolio(array $items, int $limit = 6): array
{
    return array_slice(sort_portfolio_items($items), 0, $limit);
}

function find_portfolio_by_id(string $id): ?array
{
    foreach (load_portfolio() as $item) {
        if (($item['id'] ?? '') === $id) {
            return $item;
        }
    }

    return null;
}

function find_portfolio_by_slug(string $slug, bool $publishedOnly = true): ?array
{
    foreach (load_portfolio($publishedOnly) as $item) {
        if (($item['slug'] ?? '') === $slug) {
            return $item;
        }
    }

    return null;
}

function normalize_text(string $value): string
{
    $value = trim($value);
    $transliterated = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);

    if (is_string($transliterated)) {
        $value = $transliterated;
    }

    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    $value = trim($value, '-');

    return $value !== '' ? $value : 'projeto';
}

function generate_portfolio_slug(string $title, array $items, ?string $ignoreId = null): string
{
    $base = normalize_text($title);
    $slug = $base;
    $index = 2;

    while (true) {
        $exists = false;

        foreach ($items as $item) {
            if (($item['id'] ?? '') === $ignoreId) {
                continue;
            }

            if (($item['slug'] ?? '') === $slug) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            return $slug;
        }

        $slug = $base . '-' . $index;
        $index++;
    }
}

function remove_uploaded_file(?string $relativePath): void
{
    if (!$relativePath || !str_starts_with($relativePath, 'uploads/portfolio/')) {
        return;
    }

    $fullPath = app_root($relativePath);

    if (is_file($fullPath)) {
        unlink($fullPath);
    }
}

function handle_portfolio_upload(array $file, ?string $currentImage = null): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return $currentImage ?: 'assets/images/tcm/placeholder-project.svg';
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Falha ao enviar a imagem do projeto.');
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        throw new RuntimeException('A imagem deve ter no máximo 5 MB.');
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');

    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        throw new RuntimeException('Upload de imagem inválido.');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo ? finfo_file($finfo, $tmpName) : false;

    if ($finfo) {
        finfo_close($finfo);
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    if (!is_string($mime) || !isset($allowed[$mime])) {
        throw new RuntimeException('Formato de imagem não suportado. Use JPG, PNG ou WEBP.');
    }

    ensure_directory(upload_path('portfolio'));

    $filename = date('YmdHis') . '-' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
    $relativePath = 'uploads/portfolio/' . $filename;
    $destination = app_root($relativePath);

    if (!move_uploaded_file($tmpName, $destination)) {
        throw new RuntimeException('Não foi possível salvar a imagem enviada.');
    }

    remove_uploaded_file($currentImage);

    return $relativePath;
}

function delete_portfolio_item(string $id): bool
{
    $items = load_portfolio();
    $remaining = [];
    $removed = null;

    foreach ($items as $item) {
        if (($item['id'] ?? '') === $id) {
            $removed = $item;
            continue;
        }

        $remaining[] = $item;
    }

    if ($removed === null) {
        return false;
    }

    remove_uploaded_file($removed['image'] ?? null);
    save_portfolio($remaining);

    return true;
}

function format_portfolio_date(?string $date): string
{
    if (!$date) {
        return 'Sem data';
    }

    $timestamp = strtotime($date);

    if ($timestamp === false) {
        return 'Sem data';
    }

    return date('d/m/Y', $timestamp);
}

function load_leads(): array
{
    $leads = read_json_file(data_path('leads.json'), []);

    return array_values(array_filter($leads, 'is_array'));
}

function save_leads(array $leads): void
{
    write_json_file(data_path('leads.json'), array_values($leads));
}

function store_lead(array $lead): void
{
    $leads = load_leads();
    array_unshift($leads, $lead);
    save_leads($leads);
}

function recent_leads(int $limit = 5): array
{
    return array_slice(load_leads(), 0, $limit);
}
