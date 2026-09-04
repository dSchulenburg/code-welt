<?php
// Legt Kurs-Badges an oder aktualisiert ihre Kriterien/Bild/Text, idempotent ueber die
// Register-ID (Fallback: Name).
// Aufruf im Container:  php /tmp/create-badges.php <courseid> <json-oder-pfad>
//
// <json-oder-pfad>: entweder das JSON direkt als Argument, oder (wegen Shell-Quoting bei
// mehrsprachigen {mlang}-Namen/-Beschreibungen, siehe postbuild.mjs) ein Dateipfad im Container,
// dessen Inhalt das JSON ist. JSON-Form: [{ key, id, name, description, icon, cmids: [...] }, ...]
// -- name (Klartext, {mlang} mit echten Umlauten) und description (HTML-Feld, {mlang} mit
// Umlaut-Entities) kommen bereits fertig aus postbuild.mjs. icon ist ein Dateipfad im Container.
// id ist optional: die aus registry.json bekannte Badge-ID (box.badges['<key>']), falls schon
// mal angelegt.
//
// Idempotenz (Fix-Runde 1): eine {mlang}-Uebersetzung kann sich aendern (z.B. wurde das arabische
// "الخشب" spaeter zu "خشب" praezisiert), dann traf der Name-Abgleich aus der ersten Fassung nicht
// mehr und haette ein zweites Badge mit demselben key angelegt. Deshalb jetzt: erst per Register-ID
// suchen (robust gegen Textaenderungen), erst wenn die fehlt oder nicht mehr existiert per Name
// (Fallback fuer Alt-Register ohne id), sonst neu anlegen. Bei Treffer werden Name/Beschreibung
// aktualisiert, falls sie vom aktuellen Text abweichen.
//
// API-Fund (verifiziert gegen /var/www/html/badges/classes/badge.php,
// /var/www/html/badges/criteria/award_criteria*.php, /var/www/html/lib/badgeslib.php):
// - badge::create_badge() liegt NICHT in badgeslib.php, sondern in badges/classes/badge.php,
//   Klasse core_badges\badge -- badgeslib.php registriert per class_alias('\core_badges\badge',
//   'badge') einen globalen Alias "badge", ueber den auch "new badge($id)" funktioniert.
// - badge::create_badge($data, $courseid) gibt NICHT die ID zurueck (wie eine erste Lesart der
//   Planvorgabe nahelegt), sondern ein badge-Objekt; die ID steht in $badge->id.
// - award_criteria ist in badges/criteria/award_criteria.php definiert (globaler Namespace, kein
//   eigenes require noetig ausser diesem einen); award_criteria::build() laedt die konkrete
//   Kriterien-Unterklasse (award_criteria_overall.php, award_criteria_activity.php) selbst nach.
// - Kriterien-Unique-Key ist (badgeid, criteriatype) -- ein zweites save() mit derselben
//   Kombination ohne vorheriges delete() verletzt den Unique-Index, deshalb bei bestehendem Badge
//   erst alle vorhandenen $badge->criteria loeschen, dann neu anlegen.
// - badges_process_badge_image() loescht die Icon-Datei nach dem Verarbeiten (unlink) -- bei
//   jedem Lauf wird ueber apply-php.sh --copy eine frische Kopie ins Image kopiert, das ist also
//   unproblematisch.
// - badge::save() (Fix-Runde 1, fuer den Name/Beschreibung-Abgleich) hat KEINE Sperrpruefung --
//   $DB->update_record_raw('badge', ...) laeuft unabhaengig vom status-Feld durch. Verifiziert:
//   badges/classes/badge.php, Methode save(). Nur die Kriterien-Aenderung ist an is_locked()
//   gebunden (Moodle-eigene Regel, s.u.), nicht das Aktualisieren von Textfeldern. Ein
//   $DB->update_record()-Umweg ist deshalb nicht noetig, badge::save() reicht in jedem Status.
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/badgeslib.php');
require_once($CFG->dirroot . '/badges/criteria/award_criteria.php');

// CLI-Skripte laufen sonst ohne Nutzerkontext (Guest); badge::create_badge() liest $USER->id
// (usercreated/usermodified), Bild-/Kriterien-Events brauchen ebenfalls einen echten Nutzer.
// Idiom aus admin/tool/generator/cli/* (siehe create-forum.php).
\core\session\manager::set_user(get_admin());

$courseid = (int)($argv[1] ?? 0);
$jsonArg = $argv[2] ?? '';
if (!$courseid || $jsonArg === '') {
    fwrite(STDERR, "usage: create-badges.php <courseid> <json-oder-pfad>\n");
    exit(1);
}

$jsonText = is_file($jsonArg) ? file_get_contents($jsonArg) : $jsonArg;
$specs = json_decode($jsonText, true);
if (!is_array($specs)) {
    fwrite(STDERR, "ungueltiges JSON\n");
    exit(1);
}

foreach ($specs as $spec) {
    $key = $spec['key'];
    $name = $spec['name'];
    $description = $spec['description'];
    $knownId = $spec['id'] ?? null;

    $badge = null;
    if ($knownId) {
        $existing = $DB->get_record('badge', ['id' => (int)$knownId, 'courseid' => $courseid]);
        if ($existing) {
            $badge = new badge($existing->id);
        }
    }
    if (!$badge) {
        $existing = $DB->get_record('badge', ['courseid' => $courseid, 'name' => $name]);
        if ($existing) {
            $badge = new badge($existing->id);
        }
    }

    if ($badge) {
        echo "badge {$key}: existiert bereits (id {$badge->id})\n";
        if ($badge->name !== $name || $badge->description !== $description) {
            $badge->name = $name;
            $badge->description = $description;
            $badge->save();
            echo "badge {$key}: Name/Beschreibung aktualisiert\n";
        }
    } else {
        $data = (object)[
            'name' => $name,
            'description' => $description,
            'version' => '1.0',
            'language' => 'de',
            'imagecaption' => '',
            'issuername' => 'Code-Welt',
            'issuerurl' => '',
            'issuercontact' => '',
        ];
        $badge = badge::create_badge($data, $courseid);
        echo "badge {$key}: neu angelegt (id {$badge->id})\n";
    }

    if (!is_file($spec['icon'])) {
        fwrite(STDERR, "badge {$key}: Icon-Datei fehlt: {$spec['icon']}\n");
        exit(1);
    }
    badges_process_badge_image($badge, $spec['icon']);

    if ($badge->is_locked()) {
        // Kriterien lassen sich nur aendern, solange nichts verliehen wurde (INACTIVE/ACTIVE ohne
        // Verleihungen); ACTIVE_LOCKED/INACTIVE_LOCKED heisst: schon mindestens einmal verliehen.
        // Melden statt scheitern -- Bild wurde trotzdem aktualisiert.
        echo "badge {$key}: WARNUNG Kriterien gesperrt (status {$badge->status}, bereits verliehen), nicht geaendert\n";
    } else {
        foreach ($badge->criteria as $crit) {
            $crit->delete();
        }
        award_criteria::build(['criteriatype' => BADGE_CRITERIA_TYPE_OVERALL, 'badgeid' => $badge->id])
            ->save(['agg' => BADGE_CRITERIA_AGGREGATION_ALL]);

        $activityParams = ['agg' => BADGE_CRITERIA_AGGREGATION_ALL];
        foreach ($spec['cmids'] as $cmid) {
            $activityParams['module_' . (int)$cmid] = (int)$cmid;
        }
        award_criteria::build(['criteriatype' => BADGE_CRITERIA_TYPE_ACTIVITY, 'badgeid' => $badge->id])
            ->save($activityParams);

        if (!$badge->is_active()) {
            $badge->set_status(BADGE_STATUS_ACTIVE);
            echo "badge {$key}: status auf ACTIVE gesetzt\n";
        }
    }

    echo "badge={$key} id={$badge->id}\n";
}
