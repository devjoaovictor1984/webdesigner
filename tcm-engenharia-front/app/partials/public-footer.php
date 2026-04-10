<?php

declare(strict_types=1);
?>
    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <a class="brand-lockup footer-brand" href="index.php" aria-label="Voltar ao início">
                        <span class="brand-mark">TCM</span>
                        <span class="brand-copy">
                            <strong>Engenharia Elétrica</strong>
                            <small><?= e(app_config('site.coverage')); ?></small>
                        </span>
                    </a>
                    <p class="footer-copy">
                        Soluções em engenharia elétrica para média e baixa tensão, com foco em projeto, implantação, manutenção e comissionamento.
                    </p>
                </div>

                <div>
                    <h2 class="footer-title">Frentes principais</h2>
                    <ul class="footer-links">
                        <li><a href="index.php#servicos">Projetos elétricos</a></li>
                        <li><a href="index.php#servicos">Subestações e redes</a></li>
                        <li><a href="index.php#atuacao">Laudos e estudos</a></li>
                        <li><a href="index.php#portfolio">Portfólio técnico</a></li>
                    </ul>
                </div>

                <div>
                    <h2 class="footer-title">Acesso rápido</h2>
                    <ul class="footer-links">
                        <li><a href="index.php#contato">Solicitar atendimento</a></li>
                        <li><a href="portfolio.php">Ver detalhes dos projetos</a></li>
                        <li><a href="admin/login.php">Entrar no dashboard</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; <?= date('Y'); ?> <?= e(app_config('site.name')); ?>. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/vendor/bootstrap.bundle.min.js"></script>
</body>
</html>
