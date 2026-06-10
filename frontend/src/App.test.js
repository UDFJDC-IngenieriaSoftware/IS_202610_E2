import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';

test('Renderiza la página de login', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/Bienvenido de nuevo/i);
  expect(linkElement).toBeInTheDocument();
});
