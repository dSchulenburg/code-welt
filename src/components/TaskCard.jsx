import Support from './Support.jsx';

const LABEL = { auftrag: 'taskAuftrag', nochEiner: 'taskNochEiner', remix: 'taskRemix' };

export default function TaskCard({ tasks, supportTasks, ui, showSupport }) {
  return (
    <section className="card tasks" aria-labelledby="tasks-h">
      <h2 id="tasks-h">{ui.tasksHeading}</h2>
      <ol className="task-list">
        {tasks.map((t, i) => (
          <li key={t.kind} className={`task task-${t.kind}`}>
            <span className="task-kind">{ui[LABEL[t.kind]]}</span>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
            <Support show={showSupport}>{supportTasks?.[i] && <><strong>{supportTasks[i].title}</strong> {supportTasks[i].text}</>}</Support>
          </li>
        ))}
      </ol>
    </section>
  );
}
