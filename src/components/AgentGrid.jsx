import { useState } from 'react';
import { simulate } from '../lib/agentSim.js';
import Support from './Support.jsx';

const ARROW = { N: '▲', E: '▶', S: '▼', W: '◀' };

export default function AgentGrid({ exercise, prompt, supportPrompt, ui, showSupport }) {
  const { grid, start, program } = exercise;
  const target = simulate(grid, start, program);
  const [picked, setPicked] = useState(null);
  const right = picked && picked.x === target.x && picked.y === target.y;
  return (
    <section className="exercise predict">
      <p className="prompt">{ui.predictPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <pre className="mini-program">{program.join('\n')}</pre>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${grid.w}, 40px)` }} role="group" aria-label="Raster">
        {Array.from({ length: grid.h }, (_, y) =>
          Array.from({ length: grid.w }, (_, x) => {
            const isStart = x === start.x && y === start.y;
            const isPick = picked && picked.x === x && picked.y === y;
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                data-testid={`cell-${x}-${y}`}
                className={`cell${isStart ? ' start' : ''}${isPick ? (right ? ' right' : ' wrong') : ''}`}
                onClick={() => setPicked({ x, y })}
                aria-label={`Feld ${x + 1}, ${y + 1}`}
              >
                {isStart ? ARROW[start.dir] : ''}
              </button>
            );
          }),
        )}
      </div>
      {picked && <p className={right ? 'ok' : 'nope'} role="status">{right ? ui.predictRight : ui.predictWrong}</p>}
    </section>
  );
}
