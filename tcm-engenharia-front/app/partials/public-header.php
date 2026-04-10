<?php

declare(strict_types=1);

$currentPage = $currentPage ?? 'home';
$navBase = $currentPage === 'home' ? '' : 'index.php';
?>
<body>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand brand-lockup" href="index.php" aria-label="Página inicial da TCM">
                    <span class="brand-mark">TCM</span>
                    <span class="brand-copy">
                        <strong>Engenharia Elétrica</strong>
                        <small>Projetos, execução e comissionamento</small>
                    </span>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="Abrir navegação">
                    <span class="navbar-toggler-icon">
                        <i class="fa-light fa-bars"></i>
                    </span>
                </button>

                <div class="collapse navbar-collapse" id="mainNavigation">
                    <ul class="navbar-nav ms-auto align-items-lg-center">
                        <li class="nav-item"><a class="nav-link" href="<?= e($navBase); ?>#home">Início</a></li>
                        <li class="nav-item"><a class="nav-link" href="<?= e($navBase); ?>#servicos">Serviços</a></li>
                        <li class="nav-item"><a class="nav-link" href="<?= e($navBase); ?>#atuacao">Atuação</a></li>
                        <li class="nav-item"><a class="nav-link" href="<?= e($navBase); ?>#portfolio">Portfólio</a></li>
                        <li class="nav-item"><a class="nav-link" href="<?= e($navBase); ?>#contato">Contato</a></li>
                    </ul>

                    <div class="header-actions">
                        <a class="btn btn-site btn-site-outline" href="admin/login.php">Dashboard</a>
                        <a class="btn btn-site" href="<?= e($navBase); ?>#contato">Solicitar proposta</a>
                    </div>
                </div>
            </div>
        </nav>
    </header>
