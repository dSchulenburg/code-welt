import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

test('App rendert die Wortmarke', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Code-Welt/ })).toBeInTheDocument();
});
