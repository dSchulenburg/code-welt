<?php
// NUR BOX -- niemals gegen Produktion ausfuehren. Setzt den Testschueler in einem Kurs auf den
// Ausgangszustand zurueck, damit der Lernpfad (moodle/smoke-learner.mjs) wieder von vorn beginnen
// kann und der Probelauf der Lehrkraft auf einer sauberen Box startet (final-fix-B.md, Punkt 3).
//
// Loescht fuer <username> in <courseid>: Aktivitaetsabschluss (course_modules_completion),
// Quizversuche inkl. ihrer question_usages (ueber quiz_delete_attempt(), nicht per Hand --
// sonst blieben verwaiste question_usages/question_attempts zurueck), Aufgaben-Abgaben inkl.
// ihres Online-Texts (assign_submission + assignsubmission_onlinetext) und die Kurs-Noten
// (grade_grades). Ruft danach dieselbe Logik wie reset-badges.php auf (hier dupliziert, siehe
// Kommentar dort zum Grund) und setzt alle Badges des Kurses zurueck auf ACTIVE, damit ein
// anschliessender `npm run moodle:postbuild`-Lauf die Kriterien frisch auf die aktuellen CMIDs
// setzen kann. assign_grades (die plugin-interne Bewertungstabelle) fasst dieses Skript bewusst
// nicht an -- der Boss-Check hat keine automatische Note (nur completionsubmit), assign_grades
// bleibt also ohnehin leer.
//
// Aufruf im Container:  php /tmp/reset-test-student.php <courseid> <username>
// Ueblicher Weg:         bash moodle/apply-php.sh php/reset-test-student.php <courseid> schueler1
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');
require_once($CFG->libdir . '/badgeslib.php');

// CLI-Skripte laufen sonst ohne Nutzerkontext (Guest) -- quiz_delete_attempt() loest ein Event
// aus, das einen echten Nutzer braucht. Idiom aus admin/tool/generator/cli/* (siehe create-forum.php).
\core\session\manager::set_user(get_admin());

$courseid = (int)($argv[1] ?? 0);
$username = $argv[2] ?? '';
if (!$courseid || $username === '') {
    fwrite(STDERR, "usage: reset-test-student.php <courseid> <username>\n");
    exit(1);
}

$user = $DB->get_record('user', ['username' => $username, 'deleted' => 0]);
if (!$user) {
    fwrite(STDERR, "Nutzer '{$username}' nicht gefunden\n");
    exit(1);
}
$userid = (int)$user->id;

// 1. Aktivitaetsabschluss
$cmids = $DB->get_fieldset_select('course_modules', 'id', 'course = ?', [$courseid]);
$completions = 0;
if ($cmids) {
    [$inSql, $inParams] = $DB->get_in_or_equal($cmids);
    $completions = $DB->count_records_select('course_modules_completion', "coursemoduleid {$inSql} AND userid = ?", [...$inParams, $userid]);
    $DB->delete_records_select('course_modules_completion', "coursemoduleid {$inSql} AND userid = ?", [...$inParams, $userid]);
}
echo "course_modules_completion: {$completions} geloescht\n";

// 2. Quizversuche -- quiz_delete_attempt() raeumt question_usage_by_activity mit auf
// (question_engine::delete_questions_usage_by_activity), ein rohes delete_records waere hier
// nicht ausreichend (siehe locallib.php).
$attemptCount = 0;
foreach ($DB->get_records('quiz', ['course' => $courseid]) as $quiz) {
    foreach ($DB->get_records('quiz_attempts', ['quiz' => $quiz->id, 'userid' => $userid]) as $attempt) {
        quiz_delete_attempt($attempt, $quiz);
        $attemptCount++;
    }
}
echo "quiz_attempts: {$attemptCount} geloescht (inkl. question_usages)\n";

// 3. Aufgaben-Abgaben (Online-Text)
$assignCount = 0;
foreach ($DB->get_records('assign', ['course' => $courseid]) as $assign) {
    foreach ($DB->get_records('assign_submission', ['assignment' => $assign->id, 'userid' => $userid]) as $submission) {
        $DB->delete_records('assignsubmission_onlinetext', ['assignment' => $assign->id, 'submission' => $submission->id]);
        $DB->delete_records('assign_submission', ['id' => $submission->id]);
        $assignCount++;
    }
}
echo "assign_submission (+ assignsubmission_onlinetext): {$assignCount} geloescht\n";

// 4. Noten (Gradebook-Items des Kurses -- Quiz- und Aufgaben-Noten haengen hier dran)
$itemIds = $DB->get_fieldset_select('grade_items', 'id', 'courseid = ?', [$courseid]);
$gradeCount = 0;
if ($itemIds) {
    [$inSql, $inParams] = $DB->get_in_or_equal($itemIds);
    $gradeCount = $DB->count_records_select('grade_grades', "itemid {$inSql} AND userid = ?", [...$inParams, $userid]);
    $DB->delete_records_select('grade_grades', "itemid {$inSql} AND userid = ?", [...$inParams, $userid]);
}
echo "grade_grades: {$gradeCount} geloescht\n";

// 5. Badges wieder ACTIVE -- dieselbe Logik wie reset-badges.php (kursweit, nicht userscope: ein
// Badge-Kriterium sperrt sich sobald es EINMAL verliehen wurde, egal an wen; auf dieser Box gibt
// es ohnehin nur den einen Testschueler). apply-php.sh kopiert je Aufruf nur ein Skript --
// reset-badges.php ein zweites Mal zu requiren wuerde config.php erneut laden und $CFG zerstoeren
// (require statt require_once darin), deshalb hier bewusst dieselbe kurze Logik dupliziert statt
// includiert.
$badges = $DB->get_records('badge', ['courseid' => $courseid]);
foreach ($badges as $b) {
    $issued = $DB->count_records('badge_issued', ['badgeid' => $b->id]);
    $critIds = $DB->get_fieldset_select('badge_criteria', 'id', 'badgeid = ?', [$b->id]);
    if ($critIds) {
        [$inSql, $inParams] = $DB->get_in_or_equal($critIds);
        $DB->delete_records_select('badge_criteria_met', "critid {$inSql}", $inParams);
    }
    $DB->delete_records('badge_issued', ['badgeid' => $b->id]);
    $DB->delete_records('badge_manual_award', ['badgeid' => $b->id]);
    $DB->set_field('badge', 'status', BADGE_STATUS_ACTIVE, ['id' => $b->id]);
    echo "badge {$b->id} ({$b->name}): {$issued} Verleihung(en) entfernt, status=ACTIVE\n";
}

rebuild_course_cache($courseid, true);
echo "ok\n";
