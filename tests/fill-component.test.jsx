import { render, screen, fireEvent } from '@testing-library/react';
import FillCode from '../src/components/FillCode.jsx';

const ui = { fillPrompt: 'Wähle für jede Lücke.', checkButton: 'Prüfen', fillRight: 'Richtig!', fillWrong: 'Noch nicht.' };
const exercise = { type: 'fill', code: 'stufen = ___\nfor index in range(stufen):\n    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE)',
  gaps: [{ options: ['4', '6', 'index'], correct: '6' }, { options: ['0', 'index', 'stufen'], correct: 'index' }] };

test('zeigt den Code mit einer Chip-Gruppe je Luecke, Code bleibt Code', () => {
  const { container } = render(<FillCode exercise={exercise} prompt="Fülle aus." ui={ui} showSupport={false} />);
  expect(container.querySelectorAll('.gap')).toHaveLength(2);
  expect(screen.getAllByTestId(/^fill-gap-0-option-/)).toHaveLength(3);
  expect(container.querySelector('pre').textContent).toMatch(/for index in range\(stufen\):/);
  expect(container.querySelector('pre').textContent).not.toMatch(/___/);
});

test('Pruefen ohne Auswahl → fillWrong; richtige Chips → fillRight; ein falscher Chip → fillWrong', () => {
  render(<FillCode exercise={exercise} prompt="Fülle aus." ui={ui} showSupport={false} />);
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  fireEvent.click(screen.getByTestId('fill-gap-0-option-1')); // '6'
  fireEvent.click(screen.getByTestId('fill-gap-1-option-1')); // 'index'
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  fireEvent.click(screen.getByTestId('fill-gap-1-option-2')); // 'stufen'
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  expect(screen.getByTestId('fill-gap-1-option-2').className).toMatch(/nope/);
});
