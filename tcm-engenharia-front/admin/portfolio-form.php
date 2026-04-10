<?php

declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

require_login();

$id = trim((string) ($_GET['id'] ?? ''));
$editingItem = $id !== '' ? find_portfolio_by_id($id) : null;

if ($id !== '' && $editingItem === null) {
    set_flash('error', 'Projeto não encontrado.');
    redirect('index.php');
}

$isEditing = $editingItem !== null;
$errors = [];
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$formData = [
    'title' => $editingItem['title'] ?? '',
    'category' => $editingItem['category'] ?? '',
    'location' => $editingItem['location'] ?? '',
    'summary' => $editingItem['summary'] ?? '',
    'description' => $editingItem['description'] ?? '',
    'published_at' => $editingItem['published_at'] ?? date('Y-m-d'),
    'image' => $editingItem['image'] ?? 'assets/images/tcm/placeholder-project.svg',
    'featured' => (bool) ($editingItem['featured'] ?? true),
    'published' => (bool) ($editingItem['published'] ?? true),
];

if ($requestMethod === 'POST') {
    require_valid_csrf($_POST['csrf_token'] ?? null);

    $formData = [
        'title' => trim((string) ($_POST['title'] ?? '')),
        'category' => trim((string) ($_POST['category'] ?? '')),
        'location' => trim((string) ($_POST['location'] ?? '')),
        'summary' => trim((string) ($_POST['summary'] ?? '')),
        'description' => trim((string) ($_POST['description'] ?? '')),
        'published_at' => trim((string) ($_POST['published_at'] ?? '')),
        'image' => $editingItem['image'] ?? 'assets/images/tcm/placeholder-project.svg',
        'featured' => isset($_POST['featured']),
        'published' => isset($_POST['published']),
    ];

    if ($formData['title'] === '') {
        $errors['title'] = 'Informe o título do projeto.';
    }
    if ($formData['category'] === '') {
        $errors['category'] = 'Informe a categoria principal.';
    }
    if ($formData['summary'] === '' || mb_strlen($formData['summary']) < 20) {
        $errors['summary'] = 'Escreva um resumo com pelo menos 20 caracteres.';
    } elseif (mb_strlen($formData['summary']) > 220) {
        $errors['summary'] = 'O resumo deve ter no máximo 220 caracteres.';
    }
    if ($formData['description'] === '' || mb_strlen($formData['description']) < 40) {
        $errors['description'] = 'Descreva o projeto com pelo menos 40 caracteres.';
    }
    if ($formData['published_at'] === '' || strtotime($formData['published_at']) === false) {
        $errors['published_at'] = 'Informe uma data válida.';
    }

    if ($errors === []) {
        try {
            $formData['image'] = handle_portfolio_upload($_FILES['image'] ?? ['error' => UPLOAD_ERR_NO_FILE], $editingItem['image'] ?? null);
        } catch (RuntimeException $exception) {
            $errors['image'] = $exception->getMessage();
        }
    }

    if ($errors === []) {
        $items = load_portfolio();
        $itemId = $editingItem['id'] ?? 'case-' . bin2hex(random_bytes(6));
        $record = [
            'id' => $itemId,
            'title' => $formData['title'],
            'slug' => generate_portfolio_slug($formData['title'], $items, $editingItem['id'] ?? null),
            'category' => $formData['category'],
            'location' => $formData['location'],
            'summary' => $formData['summary'],
            'description' => $formData['description'],
            'image' => $formData['image'],
            'featured' => $formData['featured'],
            'published' => $formData['published'],
            'published_at' => $formData['published_at'],
            'updated_at' => date(DATE_ATOM),
        ];

        $saved = false;
        foreach ($items as $index => $item) {
            if (($item['id'] ?? '') === $itemId) {
                $items[$index] = $record;
                $saved = true;
                break;
            }
        }
        if (!$saved) {
            $items[] = $record;
        }

        save_portfolio($items);
        set_flash('success', $isEditing ? 'Projeto atualizado com sucesso.' : 'Projeto criado com sucesso.');
        redirect('index.php');
    }
}

$pageTitle = ($isEditing ? 'Editar projeto' : 'Novo projeto') . ' | ' . app_config('site.name');
$adminPage = 'create';

require __DIR__ . '/../app/partials/admin-head.php';
require __DIR__ . '/../app/partials/admin-header.php';
?>
<section class="admin-topbar">
    <div>
        <h1><?= $isEditing ? 'Editar projeto' : 'Novo projeto'; ?></h1>
        <p>Preencha os dados do case. Os itens publicados passam a alimentar a landing page e a página de portfólio.</p>
    </div>
    <a class="btn-site btn-site-outline" href="index.php">Voltar ao dashboard</a>
</section>

<?php if ($errors !== []): ?><div class="alert-inline error">Revise os campos destacados antes de salvar.</div><?php endif; ?>

<section class="admin-surface">
    <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()); ?>">
        <div class="admin-form-grid">
            <div class="full-span">
                <label class="form-label" for="title">Título do projeto</label>
                <input class="form-control" type="text" id="title" name="title" value="<?= e($formData['title']); ?>" placeholder="Ex.: Projeto executivo de subestação abrigada">
                <?php if (isset($errors['title'])): ?><small class="field-error"><?= e($errors['title']); ?></small><?php endif; ?>
            </div>
            <div>
                <label class="form-label" for="category">Categoria</label>
                <input class="form-control" type="text" id="category" name="category" value="<?= e($formData['category']); ?>" placeholder="Ex.: Subestações">
                <?php if (isset($errors['category'])): ?><small class="field-error"><?= e($errors['category']); ?></small><?php endif; ?>
            </div>
            <div>
                <label class="form-label" for="location">Local / segmento</label>
                <input class="form-control" type="text" id="location" name="location" value="<?= e($formData['location']); ?>" placeholder="Ex.: Aplicação industrial">
            </div>
            <div class="full-span">
                <label class="form-label" for="summary">Resumo curto</label>
                <textarea class="form-control" id="summary" name="summary" placeholder="Texto curto para os cards da landing page."><?= e($formData['summary']); ?></textarea>
                <?php if (isset($errors['summary'])): ?><small class="field-error"><?= e($errors['summary']); ?></small><?php endif; ?>
            </div>
            <div class="full-span">
                <label class="form-label" for="description">Descrição completa</label>
                <textarea class="form-control" id="description" name="description" placeholder="Descreva escopo, contexto técnico, entregas e resultados do projeto."><?= e($formData['description']); ?></textarea>
                <?php if (isset($errors['description'])): ?><small class="field-error"><?= e($errors['description']); ?></small><?php endif; ?>
            </div>
            <div>
                <label class="form-label" for="published_at">Data de publicação</label>
                <input class="form-control" type="date" id="published_at" name="published_at" value="<?= e($formData['published_at']); ?>">
                <?php if (isset($errors['published_at'])): ?><small class="field-error"><?= e($errors['published_at']); ?></small><?php endif; ?>
            </div>
            <div>
                <label class="form-label" for="image">Imagem do projeto</label>
                <input class="form-control" type="file" id="image" name="image" accept=".jpg,.jpeg,.png,.webp">
                <?php if (isset($errors['image'])): ?><small class="field-error"><?= e($errors['image']); ?></small><?php endif; ?>
            </div>
            <div class="full-span checkbox-row">
                <label class="checkbox-chip"><input type="checkbox" name="published" <?= $formData['published'] ? 'checked' : ''; ?>><span>Publicar no site</span></label>
                <label class="checkbox-chip"><input type="checkbox" name="featured" <?= $formData['featured'] ? 'checked' : ''; ?>><span>Marcar como destaque</span></label>
            </div>
            <div class="full-span image-preview"><img src="../<?= e($formData['image']); ?>" alt="Pré-visualização do projeto"></div>
            <div class="full-span d-flex flex-wrap gap-3">
                <button class="btn-site" type="submit"><?= $isEditing ? 'Salvar alterações' : 'Criar projeto'; ?></button>
                <a class="btn-site btn-site-outline" href="index.php">Cancelar</a>
            </div>
        </div>
    </form>
</section>
<?php require __DIR__ . '/../app/partials/admin-footer.php'; ?>
