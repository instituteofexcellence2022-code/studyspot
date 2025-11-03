import type { Preview } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../src/theme';
import { store } from '../src/store';

const preview: Preview = {
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </Provider>
    ),
  ],
};

export default preview;


