import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders without errors', () => {
  render(<App />);
});

test('renders navbar', () => {
  render(<App />);
  expect(screen.getByRole('nav')).toBeInTheDocument();
});
