// Wegwerf-Probe in der Box: legt einen Kurs "probe-mlang" an, schreibt Umlaute, Kyrillisch,
// Arabisch und {mlang}-Bloecke, liest die Rohwerte aus der DB und rendert sie in drei Sprachen.
// Loescht den Kurs am Ende wieder. Aufruf: node moodle/probe.mjs
import { execSync } from 'node:child_process';
import { callTool, extractId, sleepBetween } from './lib/mcp.mjs';
import { mlang } from './lib/mlang.mjs';

const name = mlang({ de: 'Über Holz', en: 'About wood', uk: 'Про дерево', ar: 'عن الخشب', es: 'Sobre madera', it: 'Sul legno' });
const label = mlang({ de: '<p>Grüße aus Deutschland</p>', uk: '<p>Вітання з Німеччини</p>', ar: '<p>تحيات من ألمانيا</p>' });

const created = await callTool('moodle_create_course', { fullname: 'Probe Multilang', shortname: `probe-mlang-${Date.now()}`, categoryid: 1, numsections: 1, visible: 0 });
const courseId = extractId(created, 'ID');
await sleepBetween();
await callTool('moodle_update_section', { courseId, sectionNum: 1, name });
await sleepBetween();
const lab = await callTool('moodle_create_label', { courseId, sectionNum: 1, labelText: label });
const cmid = extractId(lab, 'Modul-ID');

const php = `
define("CLI_SCRIPT", true); require("/var/www/html/config.php");
$sec = $DB->get_record("course_sections", ["course" => ${courseId}, "section" => 1]);
$cm = $DB->get_record("course_modules", ["id" => ${cmid}]);
$lab = $DB->get_record("label", ["id" => $cm->instance]);
echo "RAW_NAME=" . $sec->name . "\\n";
echo "RAW_LABEL=" . $lab->intro . "\\n";
$ctx = context_course::instance(${courseId});
foreach (["de", "uk", "ar", "es"] as $l) {
  force_current_language($l);
  echo "NAME_$l=" . format_string($sec->name, true, ["context" => $ctx]) . "\\n";
  echo "LABEL_$l=" . strip_tags(format_text($lab->intro, FORMAT_HTML, ["context" => $ctx])) . "\\n";
}
`;
const out = execSync(`docker exec -i ki-kurs-moodle php`, { input: `<?php ${php}`, encoding: 'utf8' });
console.log(out);

const raw = Object.fromEntries(out.split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const checks = [
  ['Rohwert Name unveraendert', raw.RAW_NAME === name],
  ['Rohwert Label unveraendert', raw.RAW_LABEL.includes('Вітання з Німеччини') && raw.RAW_LABEL.includes('تحيات من ألمانيا') && raw.RAW_LABEL.includes('Grüße')],
  ['Name de', raw.NAME_de === 'Über Holz'],
  ['Name uk', raw.NAME_uk === 'Про дерево'],
  ['Name ar', raw.NAME_ar === 'عن الخشب'],
  ['Name es (kein eigener Block → other)', raw.NAME_es === 'Sobre madera'],
  ['Label uk', raw.LABEL_uk.trim() === 'Вітання з Німеччини'],
  ['Label es faellt auf other=de', raw.LABEL_es.trim() === 'Grüße aus Deutschland'],
];
let fail = 0;
for (const [l, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${l}`); if (!ok) fail++; }

await callTool('moodle_delete_course', { courseId });
console.log(fail ? `\n${fail} FAIL — Bauskript NICHT starten, erst Ursache klaeren` : '\nProbe grün');
process.exit(fail ? 1 : 0);
