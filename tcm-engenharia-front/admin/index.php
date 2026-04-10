<?php

declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

require_login();

$items = load_portfolio();
$leadItems = recent_leads();
$flash = get_flash();

$totalItems = count($items);
$publishedItems = count(array_filter($items, static fn(array $item): bool => (bool) ($item['published'] ?? false)));
$featuredItems = count(array_filter($items, static fn(array $item): bool => (bool) ($item['featured'] ?? false)));
$leadCount = count(load_leads());

$pageTitle = 'Dashboard | ' . app_config('site.name');
$adminPage = 'dashboard';

require __DIR__ . '/../app/partials/admin-head.php';
require __DIR__ . '/../app/partials/admin-header.php';
?>
<section class="admin-topbar">
    <div>
        <h1>Painel do portfólio</h1>
        <p>Cadastro, publicação e revisão dos trabalhos exibidos na landing page da TCM.</p>
    </div>
    <a class="btn-site" href="portfolio-form.php">Novo projeto</a>
</section>

<?php if ($flash !== null): ?><div class="alert-inline <?= e($flash['type']); ?>"><?= e($flash['message']); ?></div><?php endif; ?>

<section class="admin-stats">
    <article class="admin-stat"><strong><?= e((string) $totalItems); ?></strong><span>Projetos cadastrados</span></article>
    <article class="admin-stat"><strong><?= e((string) $publishedItems); ?></strong><span>Projetos publicados</span></article>
    <article class="admin-stat"><strong><?= e((string) $featuredItems); ?></strong><span>Destaques ativos</span></article>
    <article class="admin-stat"><strong><?= e((string) $leadCount); ?></strong><span>Leads recebidos</span></article>
</section>

<section class="admin-grid">
    <div class="admin-stack">
        <div class="admin-surface">
            <h2>Projetos cadastrados</h2>
            <?php if ($items !== []): ?>
                <div class="project-list">
                    <?php foreach ($items as $item): ?>
                        <article class="project-row">
                            <div class="project-thumb"><img src="../<?= e($item['image']); ?>" alt="<?= e($item['title']); ?>"></div>
                            <div class="project-copy">
                                <h3><?= e($item['title']); ?></h3>
                                <p><?= e($item['summary']); ?></p>
                                <small class="meta-muted"><?= e($item['category']); ?><?php if (!empty($item['location'])): ?> • <?= e($item['location']); ?><?php endif; ?> • Atualizado em <?= e(format_portfolio_date($item['published_at'] ?? null)); ?></small>
                            </div>
                            <div class="project-meta">
                                <div class="status-stack">
                                    <span class="status-pill <?= !empty($item['published']) ? 'published' : 'draft'; ?>"><?= !empty($item['published']) ? 'Publicado' : 'Rascunho'; ?></span>
                                    <?php if (!empty($item['featured'])): ?><span class="status-pill featured">Destaque</span><?php endif; ?>
                                </div>
                                <a class="btn-text-link" href="../portfolio.php?slug=<?= e($item['slug']); ?>" target="_blank" rel="noopener">Ver no site <i class="fa-light fa-arrow-right"></i></a>
                            </div>
                            <div class="project-actions">
                                <a class="btn-action" href="portfolio-form.php?id=<?= e($item['id']); ?>">Editar</a>
                                <form method="post" action="delete-portfolio.php" onsubmit="return confirm('Excluir este projeto?');">
                                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                                    <input type="hidden" name="id" value="<?= e($item['id']); ?>">
                                    <button class="btn-action danger" type="submit">Excluir</button>
                                </form>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <p>Nenhum projeto cadastrado ainda. Use o botão abaixo para criar o primeiro item do portfólio.</p>
                    <a class="btn-site" href="portfolio-form.php">Cadastrar projeto</a>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <div class="admin-stack">
        <div class="admin-surface">
            <h2>Leads recentes</h2>
            <?php if ($leadItems !== []): ?>
                <div class="lead-list">
                    <?php foreach ($leadItems as $lead): ?>
                        <article class="lead-item">
                            <strong><?= e($lead['name'] ?? 'Contato'); ?></strong>
                            <small><?= e($lead['company'] ?? 'Sem empresa'); ?> • <?= e(format_portfolio_date(substr((string) ($lead['created_at'] ?? ''), 0, 10))); ?></small>
                            <p style="margin: 0 0 0.6rem;"><?= e($lead['message'] ?? ''); ?></p>
                            <small><?= e($lead['email'] ?? ''); ?><?php if (!empty($lead['phone'])): ?> • <?= e($lead['phone']); ?><?php endif; ?></small>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="empty-state"><p>Ainda não há solicitações registradas pelo formulário da landing page.</p></div>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php require __DIR__ . '/../app/partials/admin-footer.php'; ?>
