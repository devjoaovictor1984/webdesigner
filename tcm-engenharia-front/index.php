<?php

declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$content = require __DIR__ . '/app/site-content.php';
$allProjects = load_portfolio(true);
$featuredProjects = featured_portfolio($allProjects, 6);
$categoriesCount = count(portfolio_categories($allProjects));

$contactData = ['name' => '', 'company' => '', 'email' => '', 'phone' => '', 'message' => ''];
$contactErrors = [];
$contactSuccess = isset($_GET['sent']) && $_GET['sent'] === '1';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod === 'POST' && ($_POST['action'] ?? '') === 'contact') {
    require_valid_csrf($_POST['csrf_token'] ?? null);
    $contactData = [
        'name' => trim((string) ($_POST['name'] ?? '')),
        'company' => trim((string) ($_POST['company'] ?? '')),
        'email' => trim((string) ($_POST['email'] ?? '')),
        'phone' => trim((string) ($_POST['phone'] ?? '')),
        'message' => trim((string) ($_POST['message'] ?? '')),
    ];

    if ($contactData['name'] === '' || mb_strlen($contactData['name']) < 3) {
        $contactErrors['name'] = 'Informe o nome completo.';
    }
    if ($contactData['email'] === '' || !filter_var($contactData['email'], FILTER_VALIDATE_EMAIL)) {
        $contactErrors['email'] = 'Informe um e-mail válido.';
    }
    if ($contactData['message'] === '' || mb_strlen($contactData['message']) < 20) {
        $contactErrors['message'] = 'Descreva o projeto com pelo menos 20 caracteres.';
    }
    if ($contactData['phone'] !== '' && mb_strlen($contactData['phone']) < 8) {
        $contactErrors['phone'] = 'Informe um telefone válido ou deixe em branco.';
    }

    if ($contactErrors === []) {
        store_lead([
            'id' => 'lead-' . bin2hex(random_bytes(6)),
            'name' => $contactData['name'],
            'company' => $contactData['company'],
            'email' => $contactData['email'],
            'phone' => $contactData['phone'],
            'message' => $contactData['message'],
            'created_at' => date(DATE_ATOM),
        ]);
        redirect('index.php?sent=1#contato');
    }
}

$pageTitle = app_config('site.name') . ' | Landing Page';
$pageDescription = app_config('site.description');
$currentPage = 'home';

require __DIR__ . '/app/partials/public-head.php';
require __DIR__ . '/app/partials/public-header.php';
?>
<main>
    <section class="hero-section" id="home">
        <div class="container">
            <div class="hero-shell">
                <div class="row g-4 align-items-center">
                    <div class="col-lg-7">
                        <span class="eyebrow">Projetos, estudos, execução e comissionamento</span>
                        <h1 class="hero-title">Engenharia elétrica para média e baixa tensão com atuação nacional.</h1>
                        <p class="hero-lead">A TCM atende obras, indústrias, condomínios e operações do setor elétrico com foco em performance, conformidade técnica e execução segura, da rede rural à subestação abrigada de 2.500 kVA.</p>
                        <div class="hero-actions">
                            <a class="btn-site" href="#contato">Solicitar proposta</a>
                            <a class="btn-site btn-site-outline" href="#portfolio">Ver portfólio</a>
                        </div>
                        <div class="hero-metrics">
                            <article class="metric-card"><strong>13,8 kV a 34,5 kV</strong><span>Faixa de atuação em subestações, manutenção e sistemas de média tensão.</span></article>
                            <article class="metric-card"><strong>2.500 kVA</strong><span>Projetos executivos completos de subestações abrigadas e postos de transformação.</span></article>
                            <article class="metric-card"><strong>Brasil inteiro</strong><span>Atendimento nacional em contratos PJ, implantação técnica e suporte especializado.</span></article>
                            <article class="metric-card"><strong><?= $categoriesCount > 0 ? e((string) $categoriesCount) : '08'; ?> frentes</strong><span>Portfólio técnico voltado a obras, energia, proteção, laudos e eficiência industrial.</span></article>
                        </div>
                    </div>
                    <div class="col-lg-5">
                        <div class="hero-panel">
                            <span class="panel-tag">Mapa de atuação</span>
                            <h2>Engenharia aplicada com leitura de campo, projeto e entrega técnica.</h2>
                            <p>Estrutura pensada para resolver demandas críticas com rastreabilidade: normas, estudos, comissionamento e manutenção em ambientes que não aceitam improviso.</p>
                            <div class="signal-card">
                                <div class="signal-row"><div><strong>Subestações e MT</strong><small>Projeto, adequação e manutenção</small></div><div class="signal-bar"><span style="width: 92%;"></span></div></div>
                                <div class="signal-row"><div><strong>Proteção e seletividade</strong><small>Estudos elétricos e confiabilidade</small></div><div class="signal-bar"><span style="width: 88%;"></span></div></div>
                                <div class="signal-row"><div><strong>Redes e execução</strong><small>Rural, urbana e atendimento nacional</small></div><div class="signal-bar"><span style="width: 95%;"></span></div></div>
                                <div class="signal-row"><div><strong>Automação e eficiência</strong><small>Correção do fator de potência e expansão</small></div><div class="signal-bar"><span style="width: 83%;"></span></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section-space" id="servicos">
        <div class="container">
            <div class="section-head">
                <div>
                    <span class="eyebrow section-kicker">Escopo técnico</span>
                    <h2 class="section-title">Serviços estruturados para projeto, implantação e continuidade.</h2>
                </div>
                <p class="section-intro">O foco da landing é comercial, mas o posicionamento é técnico: mostrar domínio de normas, execução e comissionamento para contratos que exigem responsabilidade de engenharia.</p>
            </div>
            <div class="row g-4">
                <?php foreach ($content['services'] as $service): ?>
                    <div class="col-md-6 col-xl-4">
                        <article class="surface-card service-card">
                            <div class="service-icon"><i class="<?= e($service['icon']); ?>"></i></div>
                            <h3><?= e($service['title']); ?></h3>
                            <p><?= e($service['copy']); ?></p>
                            <ul class="check-list">
                                <?php foreach ($service['bullets'] as $bullet): ?>
                                    <li><?= e($bullet); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </article>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="section-space" id="atuacao">
        <div class="container">
            <div class="band-shell">
                <div class="section-head">
                    <div>
                        <span class="eyebrow section-kicker">Modelo de entrega</span>
                        <h2 class="section-title">A TCM entra no ponto crítico do projeto e organiza a solução de ponta a ponta.</h2>
                    </div>
                    <p class="section-intro">Do levantamento à energização, a proposta comercial da empresa precisa comunicar precisão técnica e capacidade operacional. É isso que a estrutura abaixo faz.</p>
                </div>
                <div class="steps-grid">
                    <?php foreach ($content['steps'] as $index => $step): ?>
                        <article class="surface-card compact step-card">
                            <span class="step-index"><?= e((string) ($index + 1)); ?></span>
                            <h3><?= e($step['title']); ?></h3>
                            <p><?= e($step['copy']); ?></p>
                        </article>
                    <?php endforeach; ?>
                </div>
                <div class="section-head" style="margin-top: 2.4rem;">
                    <div>
                        <span class="eyebrow section-kicker">Setores atendidos</span>
                        <h2 class="section-title">Frentes em que o discurso comercial precisa falar a linguagem da engenharia.</h2>
                    </div>
                </div>
                <div class="sectors-grid">
                    <?php foreach ($content['sectors'] as $sector): ?>
                        <div class="sector-pill"><?= e($sector); ?></div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <section class="section-space" id="portfolio">
        <div class="container">
            <div class="section-head">
                <div>
                    <span class="eyebrow section-kicker">Portfólio dinâmico</span>
                    <h2 class="section-title">Os trabalhos publicados no dashboard aparecem aqui automaticamente.</h2>
                </div>
                <p class="section-intro">A landing ficou pronta para receber novos cases sem editar código. Basta entrar no painel, cadastrar o projeto e publicar.</p>
            </div>
            <?php if ($featuredProjects !== []): ?>
                <div class="portfolio-grid">
                    <?php foreach ($featuredProjects as $project): ?>
                        <article class="surface-card portfolio-card">
                            <div class="portfolio-thumb"><img src="<?= e($project['image']); ?>" alt="<?= e($project['title']); ?>"></div>
                            <div class="portfolio-meta">
                                <span class="badge-soft is-orange"><?= e($project['category']); ?></span>
                                <?php if (!empty($project['location'])): ?><span class="badge-soft"><?= e($project['location']); ?></span><?php endif; ?>
                                <?php if (!empty($project['featured'])): ?><span class="badge-soft">Destaque</span><?php endif; ?>
                            </div>
                            <h3><?= e($project['title']); ?></h3>
                            <p><?= e($project['summary']); ?></p>
                            <a class="btn-text-link" href="portfolio.php?slug=<?= e($project['slug']); ?>">Ver detalhes <i class="fa-light fa-arrow-right"></i></a>
                        </article>
                    <?php endforeach; ?>
                </div>
                <div class="text-center mt-4 pt-2"><a class="btn-site btn-site-outline" href="portfolio.php">Ver todos os projetos</a></div>
            <?php else: ?>
                <div class="empty-state">
                    <p>Ainda não há projetos publicados. Use o dashboard para cadastrar os primeiros cases e alimentar automaticamente esta seção.</p>
                    <a class="btn-site" href="admin/login.php">Abrir dashboard</a>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="section-space">
        <div class="container">
            <div class="section-head">
                <div>
                    <span class="eyebrow section-kicker">Diferenciais da operação</span>
                    <h2 class="section-title">Posicionamento para contratos que exigem técnica, documentação e resposta rápida.</h2>
                </div>
            </div>
            <div class="row g-4">
                <?php foreach ($content['differentials'] as $item): ?>
                    <div class="col-md-6"><article class="surface-card compact"><p style="margin: 0;"><?= e($item); ?></p></article></div>
                <?php endforeach; ?>
            </div>
            <div class="stats-inline">
                <article class="stat-inline-card"><strong>34,5 kV</strong><span>Manutenção de subestações e suporte técnico em média tensão.</span></article>
                <article class="stat-inline-card"><strong>PJ</strong><span>Estrutura de atendimento para condomínios, construtoras e indústrias.</span></article>
                <article class="stat-inline-card"><strong>PCHs</strong><span>Projetos completos de usinas hidrelétricas e pequenas centrais.</span></article>
                <article class="stat-inline-card"><strong>AT</strong><span>Serviços em linhas de transmissão e operações de alta tensão.</span></article>
            </div>
        </div>
    </section>

    <section class="section-space" id="contato">
        <div class="container">
            <div class="section-head">
                <div>
                    <span class="eyebrow section-kicker">Contato comercial</span>
                    <h2 class="section-title">Envie o escopo do projeto e receba retorno técnico inicial.</h2>
                </div>
                <p class="section-intro">O formulário abaixo grava os contatos no painel para facilitar o primeiro atendimento enquanto o site do cliente ainda está em implantação.</p>
            </div>
            <div class="contact-layout">
                <div class="contact-info-stack">
                    <article class="surface-card compact"><h3>Atendimento em todo o Brasil</h3><p>Execução orientada por engenharia, leitura de normas das concessionárias e aderência ao cenário real da instalação.</p></article>
                    <article class="contact-stat"><strong>Projetos executivos e estudos</strong><span>Escopo técnico para baixa e média tensão com documentação pronta para obra ou aprovação.</span></article>
                    <article class="contact-stat"><strong>Comissionamento e manutenção</strong><span>Parametrização, testes, suporte à energização e manutenção em subestações até 34,5 kV.</span></article>
                    <article class="contact-stat"><strong>Setores atendidos</strong><span>Condomínios, indústrias, construtoras, seguradoras, setor elétrico e empreendimentos de geração.</span></article>
                </div>
                <div class="form-shell">
                    <?php if ($contactSuccess): ?>
                        <div class="alert-inline success">Mensagem registrada com sucesso. O lead já está salvo para acompanhamento no dashboard.</div>
                    <?php elseif ($contactErrors !== []): ?>
                        <div class="alert-inline error">Revise os campos destacados e envie novamente.</div>
                    <?php endif; ?>
                    <form method="post" action="#contato">
                        <input type="hidden" name="action" value="contact">
                        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label" for="name">Nome</label>
                                <input class="form-control" type="text" id="name" name="name" value="<?= e($contactData['name']); ?>" placeholder="Responsável pelo projeto">
                                <?php if (isset($contactErrors['name'])): ?><small class="field-error"><?= e($contactErrors['name']); ?></small><?php endif; ?>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="company">Empresa</label>
                                <input class="form-control" type="text" id="company" name="company" value="<?= e($contactData['company']); ?>" placeholder="Nome da empresa ou empreendimento">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="email">E-mail</label>
                                <input class="form-control" type="email" id="email" name="email" value="<?= e($contactData['email']); ?>" placeholder="voce@empresa.com">
                                <?php if (isset($contactErrors['email'])): ?><small class="field-error"><?= e($contactErrors['email']); ?></small><?php endif; ?>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="phone">Telefone</label>
                                <input class="form-control" type="text" id="phone" name="phone" value="<?= e($contactData['phone']); ?>" placeholder="WhatsApp ou telefone comercial">
                                <?php if (isset($contactErrors['phone'])): ?><small class="field-error"><?= e($contactErrors['phone']); ?></small><?php endif; ?>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="message">Escopo inicial</label>
                                <textarea class="form-control" id="message" name="message" placeholder="Descreva a demanda: tipo de instalação, tensão, prazo, local e necessidade principal."><?= e($contactData['message']); ?></textarea>
                                <?php if (isset($contactErrors['message'])): ?><small class="field-error"><?= e($contactErrors['message']); ?></small><?php endif; ?>
                            </div>
                            <div class="col-12"><button class="btn-site" type="submit">Enviar solicitação</button></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
</main>
<?php require __DIR__ . '/app/partials/public-footer.php'; ?>
