<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Dashboard | ' . app_config('site.name');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle); ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/vendor/bootstrap.css">
    <link rel="stylesheet" href="../assets/css/plugins/fontawesome.css">
    <link rel="stylesheet" href="../assets/css/tcm-site.css">
    <link rel="stylesheet" href="../assets/css/tcm-admin.css">
</head>
