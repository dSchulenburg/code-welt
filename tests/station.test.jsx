import { render, screen, fireEvent } from '@testing-library/react';
import StationView from '../src/components/StationView.jsx';

test('Station 2 zeigt Titel, Dialog, Python und Aufgaben auf Deutsch', () => {
  const { container } = render(<StationView id="s02" lang="de" />);
  expect(screen.getByRole('heading', { name: /Reihenfolge zählt/ })).toBeInTheDocument();
  expect(screen.getByText(/Der Agent versteht kein Deutsch/)).toBeInTheDocument();
  // Prism zerlegt den Code in Token-Spans, deshalb den Gesamttext des Code-Blocks pruefen
  expect(container.querySelector('.code pre code').textContent).toMatch(/agent\.turn\(LEFT_TURN\)/);
  expect(screen.getAllByText(/Auftrag/).length).toBeGreaterThan(0);
  expect(screen.queryByText(/Hilfe in deiner Sprache/)).not.toBeInTheDocument();
});

test('mit Stuetzsprache erscheint der Umschalter, Deutsch bleibt sichtbar', () => {
  const { container } = render(<StationView id="s02" lang="uk" />);
  expect(screen.getByText(/Der Agent versteht kein Deutsch/)).toBeInTheDocument();
  const toggle = container.querySelector('.btn-support');
  expect(toggle).not.toBeNull();
  // Stuetze ist beim Laden eingeblendet; einmal aus, einmal wieder an
  expect(screen.getAllByTestId('support').length).toBeGreaterThan(0);
  fireEvent.click(toggle);
  expect(screen.queryAllByTestId('support')).toHaveLength(0);
  fireEvent.click(toggle);
  expect(screen.getAllByTestId('support').length).toBeGreaterThan(0);
});

test('Vorhersage-Raster wertet Klick aus', () => {
  render(<StationView id="s02" lang="de" />);
  fireEvent.click(screen.getByTestId('cell-1-2'));
  expect(screen.getByText(/Richtig! Der Agent steht genau da/)).toBeInTheDocument();
});

test('Sortier-Puzzle laesst sich loesen', () => {
  render(<StationView id="s02" lang="de" />);
  const list = screen.getByTestId('parsons');
  // Solange sortieren, bis die Reihenfolge stimmt: Zeile "teleport" ganz nach oben usw.
  const want = ['agent.teleport_to_player()', 'agent.move(FORWARD, 2)', 'agent.turn(LEFT_TURN)', 'agent.move(FORWARD, 1)'];
  for (let target = 0; target < want.length; target++) {
    for (let guard = 0; guard < 10; guard++) {
      const items = [...list.querySelectorAll('li')].map((li) => li.dataset.line);
      const pos = items.indexOf(want[target]);
      if (pos === target) break;
      fireEvent.click(list.querySelectorAll('li')[pos].querySelector('button[data-dir="up"]'));
    }
  }
  fireEvent.click(screen.getByRole('button', { name: /Prüfen/ }));
  expect(screen.getByText(/Richtig! Das ist die Reihenfolge/)).toBeInTheDocument();
});

test('mit Stuetzsprache sind Ueberschriften zweisprachig, Buttons deutsch', () => {
  render(<StationView id="s02" lang="uk" />);
  const h2 = screen.getByRole('heading', { name: /Die Geschichte · / });
  expect(h2).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Prüfen' })).toBeInTheDocument();
});
test('auf Deutsch bleiben Ueberschriften einsprachig', () => {
  render(<StationView id="s02" lang="de" />);
  expect(screen.getByRole('heading', { name: 'Die Geschichte' })).toBeInTheDocument();
});
