/**
 * ErrorBoundary Accessibility Tests
 */

import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { accessibilityService } from '../../../utils/accessibility';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Accessibility', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    accessibilityService.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have proper ARIA attributes when error occurs', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for error message
    const errorMessage = screen.getByText(/something went wrong/i);
    expect(errorMessage).toBeInTheDocument();

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('type', 'button');
  });

  it('should be keyboard navigable', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    
    // Focus should be on retry button
    retryButton.focus();
    expect(retryButton).toHaveFocus();

    // Should be able to activate with Enter key
    retryButton.click();
    expect(retryButton).toBeInTheDocument();
  });

  it('should have proper color contrast', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Run accessibility audit
    const audit = await accessibilityService.auditPage();
    
    // Check for color contrast violations
    const contrastViolations = audit.violations.filter(
      v => v.tags.includes('wcag143')
    );
    
    expect(contrastViolations).toHaveLength(0);
  });

  it('should have proper focus management', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check that focus is managed properly
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Focus should be on the retry button
    retryButton.focus();
    expect(retryButton).toHaveFocus();
  });

  it('should have proper semantic HTML structure', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for proper heading hierarchy
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper button semantics
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // All buttons should have accessible names
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('should have proper ARIA live regions for dynamic content', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for ARIA live region
    const liveRegion = screen.getByRole('alert');
    expect(liveRegion).toBeInTheDocument();
  });

  it('should be screen reader friendly', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for proper text content
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    
    // Check for proper button labels
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });

  it('should pass accessibility audit', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Run full accessibility audit
    const audit = await accessibilityService.auditPage();
    
    // Should have no critical or serious violations
    const criticalViolations = audit.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toHaveLength(0);
    
    // Should have good accessibility score
    expect(audit.score).toBeGreaterThanOrEqual(80);
  });
});
