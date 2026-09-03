#!/usr/bin/env bash
# Kopiert set-quiz-completion.php in die Box und fuehrt es fuer den Kurs aus registry.json aus.
set -euo pipefail
cd "$(dirname "$0")"
ENV="${REG_ENV:-box}"
COURSE=$(node -p "require('./registry.json')['$ENV'].courseId")
# MSYS_NO_PATHCONV: Git Bash uebersetzt /tmp/... und /var/www/html/...-Argumente
# an native Programme (docker.exe) sonst in Windows-Pfade -> php findet die Datei
# nicht mehr (siehe docker/ki-kurs-box/prepare-code-welt.sh, Task 1).
MSYS_NO_PATHCONV=1 docker cp php/set-quiz-completion.php ki-kurs-moodle:/tmp/set-quiz-completion.php
MSYS_NO_PATHCONV=1 docker exec ki-kurs-moodle php /tmp/set-quiz-completion.php "$COURSE" 60
MSYS_NO_PATHCONV=1 docker exec ki-kurs-moodle php /var/www/html/admin/cli/purge_caches.php
