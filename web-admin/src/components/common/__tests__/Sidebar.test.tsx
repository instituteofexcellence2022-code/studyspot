import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Sidebar from '../../common/Sidebar';
import { store } from '../../../store';
import theme from '../../../theme';

describe('Sidebar', () => {
  it('renders navigation', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MemoryRouter>
            <Sidebar open={true} onClose={() => {}} />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  });
});


