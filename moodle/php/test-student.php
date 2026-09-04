<?php
// Legt den Testschueler "schueler1" an (falls er fehlt) und schreibt ihn als Student in den Kurs
// ein (falls noch nicht eingeschrieben). Idempotent. Aufruf im Container:
//   php /tmp/test-student.php <courseid>
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->libdir . '/enrollib.php');

// CLI-Skripte laufen sonst ohne Nutzerkontext (Guest) -- Events beim Anlegen/Einschreiben
// brauchen einen echten Nutzer. Idiom aus admin/tool/generator/cli/* (siehe create-forum.php).
\core\session\manager::set_user(get_admin());

$courseid = (int)($argv[1] ?? 0);
if (!$courseid) {
    fwrite(STDERR, "usage: test-student.php <courseid>\n");
    exit(1);
}

$user = $DB->get_record('user', ['username' => 'schueler1', 'deleted' => 0]);
if ($user) {
    // Testkonto -- bei jedem Lauf das Passwort neu setzen ist unproblematisch und faengt den Fall
    // ab, dass ein frueherer Lauf (vor dem Fix unten) es im Klartext abgelegt hatte.
    update_internal_user_password($user, 'Test-2026!');
    echo "schueler1: existiert bereits (Passwort erneut gesetzt)\n";
} else {
    // updatepassword=true (dritter Fall unten war frueher false): user_create_user() unsetzt das
    // Passwort-Feld dann VOR dem insert_record() und ruft stattdessen nach dem Insert
    // $authplugin->user_update_password() auf, die es ueber update_internal_user_password()
    // gehasht ablegt. Mit updatepassword=false landete "Test-2026!" unveraendert -- also im
    // Klartext -- in mdl_user.password (Befund des Controllers, gemessen an schueler1).
    $userid = user_create_user((object)[
        'username' => 'schueler1',
        'password' => 'Test-2026!',
        'firstname' => 'Sam',
        'lastname' => 'Test',
        'email' => 'schueler1@example.invalid',
        'confirmed' => 1,
        'mnethostid' => $CFG->mnet_localhost_id,
        'auth' => 'manual',
    ], true, false);
    $user = $DB->get_record('user', ['id' => $userid], '*', MUST_EXIST);
    echo "schueler1: neu angelegt (userid {$user->id})\n";
}

$instance = $DB->get_record('enrol', ['courseid' => $courseid, 'enrol' => 'manual'], '*', MUST_EXIST);
$alreadyEnrolled = $DB->record_exists('user_enrolments', ['enrolid' => $instance->id, 'userid' => $user->id]);
if ($alreadyEnrolled) {
    echo "schueler1: bereits eingeschrieben\n";
} else {
    $studentroleid = $DB->get_field('role', 'id', ['shortname' => 'student'], MUST_EXIST);
    enrol_get_plugin('manual')->enrol_user($instance, $user->id, $studentroleid);
    echo "schueler1: eingeschrieben (Kurs {$courseid}, Rolle student)\n";
}

echo "userid={$user->id}\n";
