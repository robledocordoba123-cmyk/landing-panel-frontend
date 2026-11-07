import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Paginador from './Paginador';
import LimiteDeError from './LimiteDeError';
import NoEncontrada from './NoEncontrada';
import MetaPagina from './MetaPagina';

describe('Paginador', () => {
  test('no deja ir antes de la primera ni después de la última página', async () => {
    const alCambiar = vi.fn();
    const { rerender } = render(<Paginador pagina={1} paginas={3} alCambiar={alCambiar} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(alCambiar).toHaveBeenCalledWith(2);
    rerender(<Paginador pagina={3} paginas={3} alCambiar={alCambiar} />);
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
  });
});

describe('Límite de error', () => {
  function Rompe() {
    throw new Error('falla de prueba');
  }

  test('cambia la pantalla en blanco por un aviso con salida', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<LimiteDeError><Rompe /></LimiteDeError>);
    expect(screen.getByRole('heading', { name: 'Algo se nos enredó.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
  });

  test('sin errores muestra la página normal', () => {
    render(<LimiteDeError><p>Todo bien</p></LimiteDeError>);
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });
});

test('la página 404 pide no indexarse y ofrece volver', () => {
  render(<MemoryRouter><MetaPagina titulo="Página no encontrada" privada /><NoEncontrada /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Esta página se nos escapó.' })).toBeInTheDocument();
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(document.title).toBe('Página no encontrada · Huellitas Veterinaria');
  expect(screen.getByRole('link', { name: 'Reservar una cita' })).toHaveAttribute('href', '/#cita');
});
