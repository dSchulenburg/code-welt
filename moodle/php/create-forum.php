<?php
// Legt ein "Fragen an Nour"-Forum in Abschnitt 0 des Kurses an, aktualisiert es, oder gibt die
// cmid des bestehenden aus. Aufruf im Container:
//   php /tmp/create-forum.php <courseid> <name> <intro-html> [known-cmid]
//
// name und intro-html kommen aus postbuild.mjs bereits fertig mit {mlang}-Bloecken (Modul-Name
// als Klartext mit echten Umlauten, Intro als HTML-Feld mit Entities -- siehe moodle/lib/mlang.mjs
// und moodle/course-def.mjs fuer das gleiche Muster bei anderen Aktivitaeten). known-cmid ist
// optional: die aus registry.json bekannte cmid (items['forum-nour'].cmid), falls schon mal
// angelegt.
//
// Idempotenz (Fix-Runde 1): urspruenglich wurde nur per exaktem Namensvergleich gesucht -- aendert
// sich eine {mlang}-Uebersetzung (z.B. wurde eine Sprachfassung praezisiert), traf der Vergleich
// nicht mehr und ein zweites Forum waere entstanden (am Badge-Namensabgleich beim selben Problem
// beobachtet, siehe create-badges.php). Deshalb jetzt: erst per bekannter cmid suchen (robust
// gegen Textaenderungen), erst wenn die fehlt/nicht mehr passt per Name (Fallback fuer Alt-Register
// ohne cmid-Argument), sonst neu anlegen. Bei Treffer werden Name/Intro aktualisiert, falls sie vom
// aktuellen Text abweichen -- direktes $DB->update_record('forum', ...) + rebuild_course_cache()
// statt forum_update_instance() (die ein $mform erwartet und fuer den Formular-Editier-Pfad gebaut
// ist), analog zum bestehenden CLI-Direktzugriff in set-quiz-completion.php.
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
$knownCmid = (isset($argv[4]) && $argv[4] !== '') ? (int)$argv[4] : null;
if (!$courseid || $name === '') {
    fwrite(STDERR, "usage: create-forum.php <courseid> <name-mlang> <intro-html> [known-cmid]\n");
    exit(1);
}

$forum = null;
$cmid = null;
if ($knownCmid) {
    $cm = get_coursemodule_from_id('forum', $knownCmid, $courseid);
    if ($cm) {
        $forum = $DB->get_record('forum', ['id' => $cm->instance, 'course' => $courseid]);
        if ($forum) {
            $cmid = $cm->id;
        }
    }
}
if (!$forum) {
    $existing = $DB->get_record('forum', ['course' => $courseid, 'name' => $name]);
    if ($existing) {
        $forum = $existing;
        $cm = get_coursemodule_from_instance('forum', $forum->id, $courseid, false, MUST_EXIST);
        $cmid = $cm->id;
    }
}

if ($forum) {
    if ($forum->name !== $name || $forum->intro !== $intro) {
        $DB->update_record('forum', (object)[
            'id' => $forum->id,
            'name' => $name,
            'intro' => $intro,
            'introformat' => FORMAT_HTML,
            'timemodified' => time(),
        ]);
        rebuild_course_cache($courseid, true);
        echo "forum: Name/Intro aktualisiert\n";
    }
    echo "cmid={$cmid}\n";
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
