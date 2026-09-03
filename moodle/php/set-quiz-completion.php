<?php
// Setzt fuer alle Quizze eines Kurses den Aktivitaetsabschluss auf "Bestehensnote erreicht".
// Aufruf im Container:  php /tmp/set-quiz-completion.php <courseid> [passpercent=60]
//
// Moodle 5.0: "completionusegrade" ist nur ein Formularfeld (mod_form), keine
// Spalte in course_modules. Die tatsaechliche DB-Spalte, die Grade-Completion
// aktiviert, ist "completiongradeitemnumber" (nullable int; NULL = aus, sonst
// die itemnumber des zu pruefenden Grade-Items, fuer das Haupt-Grade-Item = 0).
// $DB->update_record() verwirft unbekannte Felder wie "completionusegrade" still
// (kein Fehler, kein Effekt) -- deshalb hier "completiongradeitemnumber" => 0.
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->libdir . '/completionlib.php');

$courseid = (int)($argv[1] ?? 0);
$pass = (float)($argv[2] ?? 60);
if (!$courseid) { fwrite(STDERR, "usage: set-quiz-completion.php <courseid> [passpercent]\n"); exit(1); }

$course = $DB->get_record('course', ['id' => $courseid], '*', MUST_EXIST);
if (!$course->enablecompletion) {
    $DB->set_field('course', 'enablecompletion', 1, ['id' => $courseid]);
    echo "enablecompletion=1 gesetzt\n";
}

foreach ($DB->get_records('quiz', ['course' => $courseid]) as $quiz) {
    $cm = get_coursemodule_from_instance('quiz', $quiz->id, $courseid, false, MUST_EXIST);
    $DB->update_record('course_modules', (object)[
        'id' => $cm->id, 'completion' => COMPLETION_TRACKING_AUTOMATIC,
        'completionview' => 0, 'completiongradeitemnumber' => 0, 'completionpassgrade' => 1,
    ]);
    $gi = grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quiz->id, 'courseid' => $courseid]);
    if ($gi) { $gi->gradepass = round($gi->grademax * $pass / 100, 2); $gi->update(); }
    echo "quiz {$quiz->id} cm {$cm->id}: completiongradeitemnumber=0 passgrade=1 gradepass=" . ($gi ? $gi->gradepass : 'kein grade_item') . "\n";
}
rebuild_course_cache($courseid, true);
echo "ok\n";
