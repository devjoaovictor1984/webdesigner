<?php

declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

if (is_logged_in()) {
    redirect('index.php');
}

$username = '';
$error = '';
$flash = get_flash();
$loggedOut = isset($_GET['logout']) && $_GET['logout'] === '1';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod === 'POST') {
    require_valid_csrf($_POST['csrf_token'] ?? null);
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (attempt_login($username, $password)) {
        redirect('index.php');
    }

    $error = 'Usuário ou senha inválidos.';
}

$pageTitle = 'Login do dashboard | ' . app_config('site.name');
require __DIR__ . '/../app/partials/admin-head.php';
?>
<body class="admin-body">
    <main class="login-shell">
        <div class="login-card">
            <a class="brand-lockup" href="../index.php">
                <span class="brand-mark">TCM</span>
                <span class="brand-copy">
                    <strong>Dashboard do portfólio</strong>
                    <small>Gerencie os projetos publicados</small>
                </span>
            </a>

            <h1>Login administrativo</h1>
            <p>Área restrita para cadastrar, editar e publicar trabalhos que serão exibidos automaticamente na landing page.</p>

            <?php if ($flash !== null): ?><div class="alert-inline <?= e($flash['type']); ?>"><?= e($flash['message']); ?></div><?php endif; ?>
            <?php if ($loggedOut): ?><div class="alert-inline success">Sessão encerrada com sucesso.</div><?php endif; ?>
            <?php if ($error !== ''): ?><div class="alert-inline error"><?= e($error); ?></div><?php endif; ?>

            <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                <div class="mb-3">
                    <label class="form-label" for="username">Usuário</label>
                    <input class="form-control" type="text" id="username" name="username" value="<?= e($username); ?>" autocomplete="username">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="password">Senha</label>
                    <input class="form-control" type="password" id="password" name="password" autocomplete="current-password">
                </div>
                <button class="btn-site w-100" type="submit">Entrar no dashboard</button>
            </form>

            <div class="helper-note">As credenciais administrativas estão configuradas internamente e podem ser alteradas depois sem mudar o layout do painel.</div>
        </div>
    </main>
</body>
</html>
