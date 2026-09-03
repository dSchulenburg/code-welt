#!/usr/bin/env bash
# Kopiert ein PHP-Skript (und optionale Begleitdateien) in die Box und fuehrt es aus, gibt stdout
# durch. Allgemeinerer Nachfolger von apply-completion.sh's Kopiermuster fuer Skripte, die neben
# CLI-Argumenten auch Dateien brauchen (JSON, PNG) -- wegen Quoting/Groesse werden solche Daten als
# Datei uebergeben, nicht als CLI-Argument (siehe postbuild.mjs).
#
# Aufruf: apply-php.sh <script.php> [--copy <datei>]... [arg...]
#   --copy <datei>  kopiert <datei> zusaetzlich nach /tmp/<basename der Datei> im Container, BEVOR
#                    das Skript laeuft. Wiederholbar. Das Skript referenziert die Datei dann selbst
#                    ueber /tmp/<basename> (z.B. als eines seiner arg...).
set -euo pipefail
cd "$(dirname "$0")"

SCRIPT="$1"; shift
SCRIPT_BASENAME=$(basename "$SCRIPT")

# MSYS_NO_PATHCONV: Git Bash uebersetzt /tmp/...-Argumente an native Programme (docker.exe) sonst
# in Windows-Pfade -> php findet die Datei nicht mehr (siehe docker/ki-kurs-box/prepare-code-welt.sh,
# Task 1, und apply-completion.sh).
MSYS_NO_PATHCONV=1 docker cp "$SCRIPT" ki-kurs-moodle:/tmp/"$SCRIPT_BASENAME"

ARGS=()
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--copy" ]; then
    FILE="$2"; shift 2
    FILE_BASENAME=$(basename "$FILE")
    MSYS_NO_PATHCONV=1 docker cp "$FILE" ki-kurs-moodle:/tmp/"$FILE_BASENAME"
  else
    ARGS+=("$1"); shift
  fi
done

MSYS_NO_PATHCONV=1 docker exec ki-kurs-moodle php /tmp/"$SCRIPT_BASENAME" "${ARGS[@]}"
