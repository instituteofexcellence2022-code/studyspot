import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Divider, List, ListItem, ListItemIcon, ListItemText, LinearProgress, IconButton, CssBaseline, ThemeProvider, createTheme } from '@mui/material';


// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Back Home/i })).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const fallback = <div>Custom Error Fallback</div>;
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
  });
});

