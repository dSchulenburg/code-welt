import Support from './Support.jsx';
import { pair } from '../lib/bilingual.js';

const LABEL = { auftrag: 'taskAuftrag', nochEiner: 'taskNochEiner', remix: 'taskRemix' };

export default function TaskCard({ tasks, supportTasks, ui, sui, showSupport }) {
  return (
    <section className="card tasks" aria-labelledby="tasks-h">
      <h2 id="tasks-h">{pair(ui.tasksHeading, sui?.tasksHeading)}</h2>
      <ol className="task-list">
        {tasks.map((t, i) => (
          <li key={t.kind} className={`task task-${t.kind}`}>
            <span className="task-kind">{pair(ui[LABEL[t.kind]], sui?.[LABEL[t.kind]])}</span>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
            <Support show={showSupport}>{supportTasks?.[i] && <><strong>{supportTasks[i].title}</strong> {supportTasks[i].text}</>}</Support>
          </li>
        ))}
      </ol>
    </section>
  );
}
