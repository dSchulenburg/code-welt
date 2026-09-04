import { render, screen, fireEvent } from '@testing-library/react';
import MatchBlocksPython from '../src/components/MatchBlocksPython.jsx';

const ui = { matchPrompt: 'Welcher Block gehört zu welcher Zeile?', checkButton: 'Prüfen', matchRight: 'Richtig!', matchWrong: 'Noch nicht.' };
const exercise = { type: 'match', pairs: [
  { block: { kind: 'setVar', varName: 'laenge', value: 5 }, python: 'laenge = 5' },
  { block: { kind: 'repeat', n: 'laenge', body: [] }, python: 'for index in range(laenge):' },
  { block: { kind: 'agent.place', dir: 'down' }, python: 'agent.place(DOWN)' },
] };

function setup() {
  return render(<MatchBlocksPython exercise={exercise} prompt="Ordne zu." ui={ui} showSupport={false} seed={7} />);
}

test('zeigt jeden Block als SVG und jede Python-Zeile gemischt, aber vollstaendig', () => {
  setup();
  expect(screen.getAllByTestId(/^match-block-/)).toHaveLength(3);
  const lines = screen.getAllByTestId(/^match-line-/).map((el) => el.textContent);
  expect(lines.sort()).toEqual(['agent.place(DOWN)', 'for index in range(laenge):', 'laenge = 5']);
  expect(document.querySelectorAll('[data-kind="setVar"]')).toHaveLength(1);
});

test('richtige Paare → matchRight, ein falsches Paar → matchWrong', () => {
  setup();
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByTestId(`match-block-${i}`));
    fireEvent.click(screen.getByTestId(`match-line-${i}`));
  }
  fireEvent.click(screen.getByTestId('match-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  // Paar 0 umbiegen: Block 0 → Zeile 1
  fireEvent.click(screen.getByTestId('match-block-0'));
  fireEvent.click(screen.getByTestId('match-line-1'));
  fireEvent.click(screen.getByTestId('match-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
});

test('eine Zeile kann nur einem Block gehoeren: neue Zuordnung loest die alte', () => {
  setup();
  fireEvent.click(screen.getByTestId('match-block-0'));
  fireEvent.click(screen.getByTestId('match-line-2'));
  fireEvent.click(screen.getByTestId('match-block-1'));
  fireEvent.click(screen.getByTestId('match-line-2'));
  expect(screen.getByTestId('match-block-0').getAttribute('data-paired')).toBe('');
  expect(screen.getByTestId('match-block-1').getAttribute('data-paired')).toBe('2');
});
