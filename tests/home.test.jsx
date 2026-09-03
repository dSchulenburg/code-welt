import { render, screen } from '@testing-library/react';
import Home from '../src/components/Home.jsx';

test('mit Stuetzsprache ist die Etappen-Ueberschrift zweisprachig', () => {
  render(<Home switcher={null} lang="uk" />);
  expect(screen.getByRole('heading', { name: /Holz · / })).toBeInTheDocument();
});
test('auf Deutsch bleibt die Etappen-Ueberschrift einsprachig', () => {
  render(<Home switcher={null} lang="de" />);
  expect(screen.getByRole('heading', { name: '🪵 Holz' })).toBeInTheDocument();
});
