<?php

declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

logout_user();

redirect('login.php?logout=1');
