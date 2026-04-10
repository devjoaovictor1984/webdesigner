<?php

declare(strict_types=1);

$adminPage = $adminPage ?? 'dashboard';
?>
<body class="admin-body">
    <div class="admin-shell">
        <aside class="admin-sidebar">
            <a class="brand-lockup footer-brand" href="../index.php">
                <span class="brand-mark">TCM</span>
                <span class="brand-copy">
                    <strong>Painel administrativo</strong>
                    <small>Gestão do portfólio</small>
                </span>
            </a>

            <nav class="admin-nav">
                <a class="admin-nav-link<?= $adminPage === 'dashboard' ? ' is-active' : ''; ?>" href="index.php">
                    <i class="fa-light fa-grid-2"></i>
                    <span>Dashboard</span>
                </a>
                <a class="admin-nav-link<?= $adminPage === 'create' ? ' is-active' : ''; ?>" href="portfolio-form.php">
                    <i class="fa-light fa-plus"></i>
                    <span>Novo projeto</span>
                </a>
                <a class="admin-nav-link" href="../index.php" target="_blank" rel="noopener">
                    <i class="fa-light fa-arrow-up-right-from-square"></i>
                    <span>Ver site</span>
                </a>
                <a class="admin-nav-link" href="logout.php">
                    <i class="fa-light fa-right-from-bracket"></i>
                    <span>Sair</span>
                </a>
            </nav>
        </aside>

        <main class="admin-main">
