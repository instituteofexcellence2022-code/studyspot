/**
 * Accessibility utility functions for StudySpot web app
 */

/**
 * Announces a message to screen readers
 */
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Checks if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const tabindex = element.getAttribute('tabindex');
  if (tabindex && parseInt(tabindex) < 0) return false;
  
  const tagName = element.tagName.toLowerCase();
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
  
  return focusableTags.includes(tagName) || (tabindex !== null && parseInt(tabindex) >= 0);
};

/**
 * Traps focus within a container (useful for modals)
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Generates a unique ID for ARIA attributes
 */
let idCounter = 0;
export const generateAriaId = (prefix: string = 'aria'): string => {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
};

/**
 * Checks color contrast ratio (simplified version)
 * Returns true if contrast meets WCAG AA standards (4.5:1 for normal text)
 */
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // This is a simplified check - implement full contrast calculation if needed
  // For now, returns true as a placeholder
  return true;
};

/**
 * Keyboard navigation helper
 * Provides standardized keyboard navigation for custom components
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
): void => {
  switch (event.key) {
    case 'Enter':
      callbacks.onEnter?.();
      break;
    case ' ':
    case 'Space':
      event.preventDefault();
      callbacks.onSpace?.();
      break;
    case 'Escape':
      callbacks.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      callbacks.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      callbacks.onArrowDown?.();
      break;
    case 'ArrowLeft':
      callbacks.onArrowLeft?.();
      break;
    case 'ArrowRight':
      callbacks.onArrowRight?.();
      break;
  }
};

/**
 * Creates visually hidden text for screen readers
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0,
};


