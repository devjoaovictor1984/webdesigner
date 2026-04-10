<?php

declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$projects = load_portfolio(true);
$slug = trim((string) ($_GET['slug'] ?? ''));
$currentPage = 'portfolio';
$pageDescription = app_config('site.description');

if ($slug === '') {
    $pageTitle = 'Portfólio técnico | ' . app_config('site.name');
    require __DIR__ . '/app/partials/public-head.php';
    require __DIR__ . '/app/partials/public-header.php';
    ?>
    <main>
        <section class="detail-hero">
            <div class="container">
                <div class="detail-surface">
                    <div class="detail-back">
                        <a class="btn-text-link" href="index.php#portfolio"><i class="fa-light fa-arrow-left"></i> Voltar para a landing page</a>
                    </div>
                    <span class="eyebrow">Portfólio técnico</span>
                    <h1 class="section-title" style="margin-top: 1rem;">Projetos publicados no dashboard da TCM.</h1>
                    <p class="section-intro">Esta vitrine é abastecida pelo painel administrativo. Sempre que um novo case for publicado, ele aparece aqui sem necessidade de alterar o front-end.</p>
                </div>
            </div>
        </section>
        <section class="section-space" style="padding-top: 1rem;">
            <div class="container">
                <?php if ($projects !== []): ?>
                    <div class="portfolio-grid">
                        <?php foreach ($projects as $project): ?>
                            <article class="surface-card portfolio-card">
                                <div class="portfolio-thumb"><img src="<?= e($project['image']); ?>" alt="<?= e($project['title']); ?>"></div>
                                <div class="portfolio-meta">
                                    <span class="badge-soft is-orange"><?= e($project['category']); ?></span>
                                    <?php if (!empty($project['location'])): ?><span class="badge-soft"><?= e($project['location']); ?></span><?php endif; ?>
                                </div>
                                <h3><?= e($project['title']); ?></h3>
                                <p><?= e($project['summary']); ?></p>
                                <a class="btn-text-link" href="portfolio.php?slug=<?= e($project['slug']); ?>">Abrir case <i class="fa-light fa-arrow-right"></i></a>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="empty-state">
                        <p>Nenhum projeto publicado até o momento. Acesse o dashboard para criar os primeiros cases.</p>
                        <a class="btn-site" href="admin/login.php">Ir para o dashboard</a>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </main>
    <?php
    require __DIR__ . '/app/partials/public-footer.php';
    return;
}

$project = find_portfolio_by_slug($slug, true);

if ($project === null) {
    http_response_code(404);
    $pageTitle = 'Projeto não encontrado | ' . app_config('site.name');
    require __DIR__ . '/app/partials/public-head.php';
    require __DIR__ . '/app/partials/public-header.php';
    ?>
    <main>
        <section class="detail-hero">
            <div class="container">
                <div class="detail-surface">
                    <div class="detail-back">
                        <a class="btn-text-link" href="portfolio.php"><i class="fa-light fa-arrow-left"></i> Voltar ao portfólio</a>
                    </div>
                    <span class="eyebrow">404</span>
                    <h1 class="section-title" style="margin-top: 1rem;">Projeto não encontrado.</h1>
                    <p class="section-intro">O item solicitado não está publicado ou o link informado não existe mais.</p>
                </div>
            </div>
        </section>
    </main>
    <?php
    require __DIR__ . '/app/partials/public-footer.php';
    return;
}

$pageTitle = $project['title'] . ' | ' . app_config('site.name');
$relatedProjects = array_values(array_filter($projects, static fn(array $item): bool => $item['slug'] !== $project['slug']));
$relatedProjects = array_slice($relatedProjects, 0, 3);

require __DIR__ . '/app/partials/public-head.php';
require __DIR__ . '/app/partials/public-header.php';
?>
<main>
    <section class="detail-hero">
        <div class="container">
            <div class="detail-surface">
                <div class="detail-back">
                    <a class="btn-text-link" href="portfolio.php"><i class="fa-light fa-arrow-left"></i> Voltar ao portfólio</a>
                </div>
                <div class="detail-meta">
                    <span class="badge-soft is-orange"><?= e($project['category']); ?></span>
                    <?php if (!empty($project['location'])): ?><span class="badge-soft"><?= e($project['location']); ?></span><?php endif; ?>
                    <span class="badge-soft"><?= e(format_portfolio_date($project['published_at'] ?? null)); ?></span>
                </div>
                <h1 class="section-title"><?= e($project['title']); ?></h1>
                <p class="section-intro"><?= e($project['summary']); ?></p>
                <div class="detail-image" style="margin-top: 1.8rem;"><img src="<?= e($project['image']); ?>" alt="<?= e($project['title']); ?>"></div>
                <div class="detail-richtext">
                    <?php foreach (preg_split('/\R{2,}/', (string) $project['description']) as $paragraph): ?>
                        <?php if (trim($paragraph) !== ''): ?><p><?= nl2br(e(trim($paragraph))); ?></p><?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>
    <?php if ($relatedProjects !== []): ?>
        <section class="section-space" style="padding-top: 1rem;">
            <div class="container">
                <div class="section-head">
                    <div>
                        <span class="eyebrow section-kicker">Outros projetos</span>
                        <h2 class="section-title">Mais cases publicados.</h2>
                    </div>
                </div>
                <div class="portfolio-grid">
                    <?php foreach ($relatedProjects as $related): ?>
                        <article class="surface-card portfolio-card">
                            <div class="portfolio-thumb"><img src="<?= e($related['image']); ?>" alt="<?= e($related['title']); ?>"></div>
                            <div class="portfolio-meta">
                                <span class="badge-soft is-orange"><?= e($related['category']); ?></span>
                                <?php if (!empty($related['location'])): ?><span class="badge-soft"><?= e($related['location']); ?></span><?php endif; ?>
                            </div>
                            <h3><?= e($related['title']); ?></h3>
                            <p><?= e($related['summary']); ?></p>
                            <a class="btn-text-link" href="portfolio.php?slug=<?= e($related['slug']); ?>">Abrir case <i class="fa-light fa-arrow-right"></i></a>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
    <?php endif; ?>
</main>
<?php require __DIR__ . '/app/partials/public-footer.php'; ?>
