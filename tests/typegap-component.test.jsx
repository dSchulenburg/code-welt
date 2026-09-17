import { render, screen, fireEvent } from '@testing-library/react';
import TypeGap from '../src/components/TypeGap.jsx';

const ui = { typePrompt: 'Tippe.', typeGapLabel: 'Lücke', checkButton: 'Prüfen', typeRight: 'Richtig!', typeWrong: 'Noch nicht.', typeCase: 'Fast.' };
const exercise = { type: 'type', code: 'while not agent.detect(AgentDetection.___, ___):\n    agent.move(FORWARD, 1)',
  gaps: [{ accept: ['REDSTONE'] }, { accept: ['DOWN'] }] };

test('ein Eingabefeld je Luecke, LTR, ohne Rechtschreibhilfen; Code bleibt Code', () => {
  const { container } = render(<TypeGap exercise={exercise} prompt="Ändere die Bedingung." ui={ui} showSupport={false} />);
  const inputs = screen.getAllByTestId(/^type-gap-/);
  expect(inputs).toHaveLength(2);
  for (const el of inputs) {
    expect(el.getAttribute('dir')).toBe('ltr');
    expect(el.getAttribute('spellcheck')).toBe('false');
    expect(el.getAttribute('autocapitalize')).toBe('off');
    expect(el.getAttribute('autocomplete')).toBe('off');
  }
  expect(container.querySelector('pre').textContent).toMatch(/agent\.move\(FORWARD, 1\)/);
  expect(container.querySelector('pre').textContent).not.toMatch(/___/);
});

test('Pruefen ist gesperrt, solange nichts getippt ist', () => {
  render(<TypeGap exercise={exercise} prompt="x" ui={ui} showSupport={false} />);
  expect(screen.getByTestId('type-check').disabled).toBe(true);
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'R' } });
  expect(screen.getByTestId('type-check').disabled).toBe(false);
});

test('richtig → typeRight, klein geschrieben → typeCase, falsch → typeWrong; Tippen loescht das Ergebnis', () => {
  render(<TypeGap exercise={exercise} prompt="x" ui={ui} showSupport={false} />);
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'redstone' } });
  fireEvent.change(screen.getByTestId('type-gap-1'), { target: { value: 'DOWN' } });
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Fast.');
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'REDSTONE' } });
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  fireEvent.change(screen.getByTestId('type-gap-1'), { target: { value: 'UP' } });
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  expect(screen.getByTestId('type-gap-1').className).toMatch(/nope/);
});

test('hint number setzt die Zifferntastatur', () => {
  const ex = { type: 'type', code: 'for index in range(___):', gaps: [{ accept: ['14'], hint: 'number' }] };
  render(<TypeGap exercise={ex} prompt="x" ui={ui} showSupport={false} />);
  expect(screen.getByTestId('type-gap-0').getAttribute('inputmode')).toBe('numeric');
});
