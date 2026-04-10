<?php

declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

require_login();

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod !== 'POST') {
    redirect('index.php');
}

require_valid_csrf($_POST['csrf_token'] ?? null);

$id = trim((string) ($_POST['id'] ?? ''));

if ($id === '') {
    set_flash('error', 'Projeto inválido para exclusão.');
    redirect('index.php');
}

if (delete_portfolio_item($id)) {
    set_flash('success', 'Projeto excluído com sucesso.');
} else {
    set_flash('error', 'Não foi possível localizar o projeto para exclusão.');
}

redirect('index.php');
