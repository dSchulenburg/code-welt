<?php
// Legt ein "Fragen an Nour"-Forum in Abschnitt 0 des Kurses an, oder gibt die cmid des bestehenden
// aus. Aufruf im Container:  php /tmp/create-forum.php <courseid> <name> <intro-html>
//
// name und intro-html kommen aus postbuild.mjs bereits fertig mit {mlang}-Bloecken (Modul-Name
// als Klartext mit echten Umlauten, Intro als HTML-Feld mit Entities -- siehe moodle/lib/mlang.mjs
// und moodle/course-def.mjs fuer das gleiche Muster bei anderen Aktivitaeten).
//
// Idempotent: existiert bereits ein Forum mit exakt diesem Namen im Kurs (Name inkl. {mlang}-Text
// ist deterministisch, gleicher Aufruf erzeugt immer denselben String), wird nichts neu angelegt --
// dessen cmid wird ausgegeben.
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->dirroot . '/mod/forum/lib.php');

// CLI-Skripte laufen sonst ohne Nutzerkontext (Guest); create_module() prueft
// moodle/course:manageactivities gegen $USER -- ohne diesen Umschalt bricht der Aufruf mit
// "Sie haben aktuell nicht das Recht, dies zu tun" ab. Idiom aus admin/tool/generator/cli/*.
\core\session\manager::set_user(get_admin());

$courseid = (int)($argv[1] ?? 0);
$name = $argv[2] ?? '';
$intro = $argv[3] ?? '';
if (!$courseid || $name === '') {
    fwrite(STDERR, "usage: create-forum.php <courseid> <name-mlang> <intro-html>\n");
    exit(1);
}

$existing = $DB->get_record('forum', ['course' => $courseid, 'name' => $name]);
if ($existing) {
    $cm = get_coursemodule_from_instance('forum', $existing->id, $courseid, false, MUST_EXIST);
    echo "cmid={$cm->id}\n";
    exit(0);
}

// Pflichtfelder von create_module() fuer modulename+course+section+visible+introeditor (forum
// unterstuetzt FEATURE_MOD_INTRO); der Rest sind Felder, die forum_add_instance() bzw.
// forum_grade_item_update() direkt lesen -- ohne sie liefe der Aufruf mit PHP-Warnings
// (Undefined property) statt sauber durch, siehe DB-Spalten in mod/forum/db/install.xml, die alle
// zwar einen DEFAULT haben, aber von forum_add_instance() teils vor dem Insert gelesen werden.
$moduleinfo = (object)[
    'modulename' => 'forum',
    'course' => $courseid,
    'section' => 0,
    'visible' => 1,
    'name' => $name,
    'introeditor' => ['text' => $intro, 'format' => FORMAT_HTML, 'itemid' => 0],
    'type' => 'general',
    'assessed' => 0,
    'scale' => 0,
    'forcesubscribe' => FORUM_CHOOSESUBSCRIBE,
    'grade_forum' => 0,
    'cmidnumber' => '',
    'groupmode' => 0,
    'groupingid' => 0,
    'completion' => 0,
    // Zusaetzliche Felder ohne Formular-Guard, verifiziert gegen mod/forum/db/install.xml:
    'maxbytes' => 0,
    'maxattachments' => 1,
    'displaywordcount' => 0,
    'duedate' => 0,
    'cutoffdate' => 0,
    'assesstimestart' => 0,
    'assesstimefinish' => 0,
    'blockperiod' => 0,
    'blockafter' => 0,
    'warnafter' => 0,
    'trackingtype' => 1,
    'rsstype' => 0,
    'rssarticles' => 0,
    'lockdiscussionafter' => 0,
];

$result = create_module($moduleinfo);
echo "cmid={$result->coursemodule}\n";
