<?php
// NUR BOX -- niemals gegen Produktion ausfuehren. Anders als die uebrigen Skripte hier hat dieses
// keine Idempotenz-Rueckversicherung: es LOESCHT Verleihungen. Auf Produktion waeren das echte
// Schueler-Abzeichen.
//
// Setzt alle Badges eines Kurses in den unverliehenen Ausgangszustand zurueck: loescht jede
// Verleihung (badge_issued), jeden erfuellten Kriterien-Fortschritt (badge_criteria_met) und jede
// manuelle Vergabe (badge_manual_award) fuer jedes Badge des Kurses, und setzt den Badge-Status
// wieder auf BADGE_STATUS_ACTIVE (aus z.B. ACTIVE_LOCKED nach einer Verleihung). Die Kriterien
// selbst (badge_criteria/badge_criteria_param) fasst dieses Skript nicht an -- die setzt
// create-badges.php beim naechsten postbuild-Lauf neu.
//
// Grund (Nachtrag Task 11, Controller): npm run moodle:build legt ein Quiz neu an, wenn sich sein
// Inhalt (Fragen/Intro/Name) geaendert hat -- dabei wandert die CMID. Ein bereits an schueler1
// verliehenes Badge ist ACTIVE_LOCKED; badge::save() aktualisiert dann zwar Name/Beschreibung
// (siehe create-badges.php), aber die Kriterien lassen sich wegen is_locked() nicht mehr auf die
// neuen CMIDs umstellen (create-badges.php meldet nur eine Warnung, aendert nichts). Dieses
// Skript hebt die Sperre auf, indem es die Verleihung selbst entfernt -- danach ist das Badge
// wieder ACTIVE (unverliehen), und create-badges.php kann die Kriterien beim naechsten Lauf neu
// auf die aktuellen CMIDs setzen.
//
// Aufruf im Container: php /tmp/reset-badges.php <courseid>
// Ueblicher Weg:        bash moodle/apply-php.sh php/reset-badges.php <courseid>
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/badgeslib.php');

$courseid = (int)($argv[1] ?? 0);
if (!$courseid) {
    fwrite(STDERR, "usage: reset-badges.php <courseid>\n");
    exit(1);
}

$badges = $DB->get_records('badge', ['courseid' => $courseid]);
if (!$badges) {
    echo "keine Badges in Kurs {$courseid}\n";
    exit(0);
}

foreach ($badges as $b) {
    $issued = $DB->count_records('badge_issued', ['badgeid' => $b->id]);
    // badge_criteria_met hat keine badgeid-Spalte, sondern haengt ueber critid an badge_criteria
    // (verifiziert per get_columns() gegen die Box-DB: id, issuedid, critid, userid, datemet).
    $critIds = $DB->get_fieldset_select('badge_criteria', 'id', 'badgeid = ?', [$b->id]);
    if ($critIds) {
        [$inSql, $inParams] = $DB->get_in_or_equal($critIds);
        $DB->delete_records_select('badge_criteria_met', "critid $inSql", $inParams);
    }
    $DB->delete_records('badge_issued', ['badgeid' => $b->id]);
    $DB->delete_records('badge_manual_award', ['badgeid' => $b->id]);
    $DB->set_field('badge', 'status', BADGE_STATUS_ACTIVE, ['id' => $b->id]);
    echo "badge {$b->id} ({$b->name}): {$issued} Verleihung(en) entfernt, Kriterien-Fortschritt geloescht, status=ACTIVE\n";
}
