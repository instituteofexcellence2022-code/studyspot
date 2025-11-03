/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance tools and helpers
 */

import { trackActivity } from './monitoring';

// Accessibility audit results
export interface AccessibilityAudit {
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  passed: number;
  failed: number;
  score: number;
  recommendations: string[];
}

// Accessibility violation
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
  tags: string[];
}

// Accessibility warning
export interface AccessibilityWarning {
  id: string;
  description: string;
  nodes: AccessibilityNode[];
}

// Accessibility node
export interface AccessibilityNode {
  target: string[];
  html: string;
  impact: string;
  any: any[];
  all: any[];
  none: any[];
}

// Color contrast checker
export interface ColorContrast {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  largeText: boolean;
  normalText: boolean;
}

// Focus management
export interface FocusTrap {
  element: HTMLElement;
  firstFocusable: HTMLElement | null;
  lastFocusable: HTMLElement | null;
  previousActiveElement: HTMLElement | null;
}

/**
 * Accessibility Service
 * Comprehensive accessibility checking and compliance tools
 */
export class AccessibilityService {
  private static instance: AccessibilityService;
  private violations: AccessibilityViolation[] = [];
  private warnings: AccessibilityWarning[] = [];

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Run comprehensive accessibility audit
   */
  async auditPage(): Promise<AccessibilityAudit> {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];

    // Check for common accessibility issues
    this.checkImages(violations);
    this.checkHeadings(violations);
    this.checkLinks(violations);
    this.checkButtons(violations);
    this.checkFormLabels(violations);
    this.checkColorContrast(violations);
    this.checkKeyboardNavigation(violations);
    this.checkARIALabels(violations);
    this.checkFocusManagement(violations);

    // Check for warnings
    this.checkSemanticHTML(warnings);
    this.checkLanguageAttributes(warnings);
    this.checkViewportSettings(warnings);

    this.violations = violations;
    this.warnings = warnings;

    const total = violations.length + warnings.length;
    const passed = total - violations.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;

    const audit: AccessibilityAudit = {
      violations,
      warnings,
      passed,
      failed: violations.length,
      score,
      recommendations: this.generateRecommendations(violations),
    };

    // Track accessibility audit
    trackActivity('accessibility_audit', 'compliance', {
      violations: violations.length,
      warnings: warnings.length,
      score,
    });

    return audit;
  }

  /**
   * Check for missing alt text on images
   */
  private checkImages(violations: AccessibilityViolation[]) {
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        violations.push({
          id: `missing-alt-text-${index}`,
          impact: 'serious',
          description: 'Images must have alternate text',
          help: 'Add alt attribute to img elements',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
          nodes: [{
            target: [img.outerHTML],
            html: img.outerHTML,
            impact: 'serious',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag111', 'section508', 'section508.22.a'],
        });
      }
    });
  }

  /**
   * Check heading hierarchy
   */
  private checkHeadings(violations: AccessibilityViolation[]) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels: number[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      headingLevels.push(level);
      
      // Check for skipped heading levels
      if (index > 0) {
        const prevLevel = headingLevels[index - 1];
        if (level > prevLevel + 1) {
          violations.push({
            id: `skipped-heading-${index}`,
            impact: 'moderate',
            description: 'Heading levels should not be skipped',
            help: 'Use heading levels in order (h1, h2, h3, etc.)',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
            nodes: [{
              target: [heading.outerHTML],
              html: heading.outerHTML,
              impact: 'moderate',
              any: [],
              all: [],
              none: [],
            }],
            tags: ['wcag2a', 'wcag141'],
          });
        }
      }
    });
  }

  /**
   * Check link accessibility
   */
  private checkLinks(violations: AccessibilityViolation[]) {
    const links = document.querySelectorAll('a');
    
    links.forEach((link, index) => {
      // Check for missing link text
      if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
        violations.push({
          id: `missing-link-text-${index}`,
          impact: 'serious',
          description: 'Links must have accessible names',
          help: 'Add text content or aria-label to link elements',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
          nodes: [{
            target: [link.outerHTML],
            html: link.outerHTML,
            impact: 'serious',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag241'],
        });
      }

      // Check for links that open in new window without warning
      if (link.target === '_blank' && !link.getAttribute('aria-label')?.includes('opens in new window')) {
        violations.push({
          id: `new-window-link-${index}`,
          impact: 'moderate',
          description: 'Links that open in new window should warn users',
          help: 'Add aria-label indicating the link opens in a new window',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
          nodes: [{
            target: [link.outerHTML],
            html: link.outerHTML,
            impact: 'moderate',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag241'],
        });
      }
    });
  }

  /**
   * Check button accessibility
   */
  private checkButtons(violations: AccessibilityViolation[]) {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach((button, index) => {
      // Check for missing accessible name
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        violations.push({
          id: `missing-button-text-${index}`,
          impact: 'serious',
          description: 'Buttons must have accessible names',
          help: 'Add text content or aria-label to button elements',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
          nodes: [{
            target: [button.outerHTML],
            html: button.outerHTML,
            impact: 'serious',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag412'],
        });
      }
    });
  }

  /**
   * Check form label accessibility
   */
  private checkFormLabels(violations: AccessibilityViolation[]) {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!id && !ariaLabel && !ariaLabelledBy) {
        violations.push({
          id: `missing-form-label-${index}`,
          impact: 'serious',
          description: 'Form inputs must have labels',
          help: 'Add label element or aria-label to form inputs',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
          nodes: [{
            target: [input.outerHTML],
            html: input.outerHTML,
            impact: 'serious',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag312'],
        });
      }
    });
  }

  /**
   * Check color contrast
   */
  private checkColorContrast(violations: AccessibilityViolation[]) {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        
        if (contrast.ratio < 4.5) {
          violations.push({
            id: `color-contrast-${index}`,
            impact: 'serious',
            description: 'Elements must have sufficient color contrast',
            help: `Color contrast ratio is ${contrast.ratio.toFixed(2)}. Minimum required is 4.5:1`,
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
            nodes: [{
              target: [element.outerHTML],
              html: element.outerHTML,
              impact: 'serious',
              any: [],
              all: [],
              none: [],
            }],
            tags: ['wcag2a', 'wcag143'],
          });
        }
      }
    });
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(violations: AccessibilityViolation[]) {
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex === '-1' && element.getAttribute('role') !== 'presentation') {
        violations.push({
          id: `keyboard-navigation-${index}`,
          impact: 'serious',
          description: 'Interactive elements must be keyboard accessible',
          help: 'Remove tabindex="-1" or ensure element is not interactive',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
          nodes: [{
            target: [element.outerHTML],
            html: element.outerHTML,
            impact: 'serious',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag241'],
        });
      }
    });
  }

  /**
   * Check ARIA labels
   */
  private checkARIALabels(violations: AccessibilityViolation[]) {
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby]');
    
    elementsWithAria.forEach((element, index) => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      
      if (ariaLabel && ariaLabel.trim() === '') {
        violations.push({
          id: `empty-aria-label-${index}`,
          impact: 'moderate',
          description: 'ARIA labels must not be empty',
          help: 'Provide meaningful text for aria-label or remove the attribute',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
          nodes: [{
            target: [element.outerHTML],
            html: element.outerHTML,
            impact: 'moderate',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag412'],
        });
      }
    });
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(violations: AccessibilityViolation[]) {
    // Check for focus traps
    const focusTraps = document.querySelectorAll('[data-focus-trap]');
    
    focusTraps.forEach((trap, index) => {
      const focusableElements = trap.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      if (focusableElements.length === 0) {
        violations.push({
          id: `empty-focus-trap-${index}`,
          impact: 'moderate',
          description: 'Focus traps must contain focusable elements',
          help: 'Add focusable elements to focus trap or remove the trap',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
          nodes: [{
            target: [trap.outerHTML],
            html: trap.outerHTML,
            impact: 'moderate',
            any: [],
            all: [],
            none: [],
          }],
          tags: ['wcag2a', 'wcag241'],
        });
      }
    });
  }

  /**
   * Check semantic HTML
   */
  private checkSemanticHTML(warnings: AccessibilityWarning[]) {
    const divs = document.querySelectorAll('div');
    
    divs.forEach((div, index) => {
      if (div.getAttribute('role') === 'button' && div.tagName !== 'BUTTON') {
        warnings.push({
          id: `semantic-button-${index}`,
          description: 'Use button element instead of div with role="button"',
          nodes: [{
            target: [div.outerHTML],
            html: div.outerHTML,
            impact: 'minor',
            any: [],
            all: [],
            none: [],
          }],
        });
      }
    });
  }

  /**
   * Check language attributes
   */
  private checkLanguageAttributes(warnings: AccessibilityWarning[]) {
    const html = document.documentElement;
    const lang = html.getAttribute('lang');
    
    if (!lang) {
      warnings.push({
        id: 'missing-lang-attribute',
        description: 'HTML element should have a lang attribute',
        nodes: [{
          target: [html.outerHTML],
          html: html.outerHTML,
          impact: 'minor',
          any: [],
          all: [],
          none: [],
        }],
      });
    }
  }

  /**
   * Check viewport settings
   */
  private checkViewportSettings(warnings: AccessibilityWarning[]) {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      warnings.push({
        id: 'missing-viewport-meta',
        description: 'Page should have viewport meta tag for mobile accessibility',
        nodes: [{
          target: ['<head>'],
          html: '<head>',
          impact: 'minor',
          any: [],
          all: [],
          none: [],
        }],
      });
    }
  }

  /**
   * Calculate color contrast ratio
   */
  private calculateContrast(color1: string, color2: string): ColorContrast {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) {
      return { ratio: 0, level: 'FAIL', largeText: false, normalText: false };
    }
    
    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);
    
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    
    return {
      ratio,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL',
      largeText: ratio >= 3,
      normalText: ratio >= 4.5,
    };
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Get relative luminance
   */
  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(violations: AccessibilityViolation[]): string[] {
    const recommendations: string[] = [];
    
    const violationTypes = violations.map(v => v.tags[0]);
    const uniqueTypes = [...new Set(violationTypes)];
    
    if (uniqueTypes.includes('wcag111')) {
      recommendations.push('Add alt text to all images');
    }
    
    if (uniqueTypes.includes('wcag143')) {
      recommendations.push('Improve color contrast ratios');
    }
    
    if (uniqueTypes.includes('wcag241')) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }
    
    if (uniqueTypes.includes('wcag312')) {
      recommendations.push('Add proper labels to all form inputs');
    }
    
    if (uniqueTypes.includes('wcag412')) {
      recommendations.push('Provide accessible names for all interactive elements');
    }
    
    return recommendations;
  }

  /**
   * Get current violations
   */
  getViolations(): AccessibilityViolation[] {
    return [...this.violations];
  }

  /**
   * Get current warnings
   */
  getWarnings(): AccessibilityWarning[] {
    return [...this.warnings];
  }

  /**
   * Clear audit results
   */
  clear() {
    this.violations = [];
    this.warnings = [];
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Trap focus within an element
   */
  static trapFocus(element: HTMLElement): FocusTrap {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    ) as NodeListOf<HTMLElement>;
    
    const firstFocusable = focusableElements[0] || null;
    const lastFocusable = focusableElements[focusableElements.length - 1] || null;
    const previousActiveElement = document.activeElement as HTMLElement;

    const trap: FocusTrap = {
      element,
      firstFocusable,
      lastFocusable,
      previousActiveElement,
    };

    // Focus first element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Add keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable?.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    this.focusStack.push(element);

    return trap;
  }

  /**
   * Release focus trap
   */
  static releaseFocus(trap: FocusTrap) {
    const index = this.focusStack.indexOf(trap.element);
    if (index > -1) {
      this.focusStack.splice(index, 1);
    }

    // Focus previous element
    if (trap.previousActiveElement) {
      trap.previousActiveElement.focus();
    }
  }

  /**
   * Focus next focusable element
   */
  static focusNext() {
    const focusableElements = document.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    ) as NodeListOf<HTMLElement>;
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    
    focusableElements[nextIndex]?.focus();
  }

  /**
   * Focus previous focusable element
   */
  static focusPrevious() {
    const focusableElements = document.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    ) as NodeListOf<HTMLElement>;
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    
    focusableElements[prevIndex]?.focus();
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Lightweight utility helpers expected by tests
export function generateAriaId(prefix: string = 'aria'): string {
  const random = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now().toString(36).slice(-4);
  return `${prefix}-${random}${timestamp}`;
}

export function isFocusable(element: HTMLElement): boolean {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) return true;
  const tabIndex = element.getAttribute('tabindex');
  return tabIndex !== null && Number(tabIndex) >= 0;
}

type KeyHandlers = {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
};

export function handleKeyboardNavigation(e: KeyboardEvent, handlers: KeyHandlers) {
  switch (e.key) {
    case 'Enter':
      handlers.onEnter?.();
      break;
    case ' ':
    case 'Spacebar':
      e.preventDefault?.();
      handlers.onSpace?.();
      break;
    case 'Escape':
      handlers.onEscape?.();
      break;
    case 'ArrowUp':
      e.preventDefault?.();
      handlers.onArrowUp?.();
      break;
    case 'ArrowDown':
      e.preventDefault?.();
      handlers.onArrowDown?.();
      break;
    case 'ArrowLeft':
      e.preventDefault?.();
      handlers.onArrowLeft?.();
      break;
    case 'ArrowRight':
      e.preventDefault?.();
      handlers.onArrowRight?.();
      break;
  }
}