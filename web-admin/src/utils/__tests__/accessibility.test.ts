import { generateAriaId,
  isFocusable,
  handleKeyboardNavigation
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('generateAriaId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateAriaId('test');
      const id2 = generateAriaId('test');
      expect(id1).not.toBe(id2);
    });

    it('should include the prefix in the ID', () => {
      const id = generateAriaId('button');
      expect(id).toContain('button');
    });

    it('should use default prefix when none provided', () => {
      const id = generateAriaId();
      expect(id).toContain('aria');
    });
  });

  describe('isFocusable', () => {
    it('should return true for button elements', () => {
      const button = document.createElement('button');
      expect(isFocusable(button)).toBe(true);
    });

    it('should return true for input elements', () => {
      const input = document.createElement('input');
      expect(isFocusable(input)).toBe(true);
    });

    it('should return false for div without tabindex', () => {
      const div = document.createElement('div');
      expect(isFocusable(div)).toBe(false);
    });

    it('should return true for element with positive tabindex', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      expect(isFocusable(div)).toBe(true);
    });

    it('should return false for element with negative tabindex', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '-1');
      expect(isFocusable(div)).toBe(false);
    });
  });

  describe('handleKeyboardNavigation', () => {
    it('should call onEnter callback for Enter key', () => {
      const onEnter = jest.fn();
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()} as any;

      handleKeyboardNavigation(event, { onEnter });
      expect(onEnter).toHaveBeenCalled();
    });

    it('should call onSpace callback for Space key and prevent default', () => {
      const onSpace = jest.fn();
      const event = {
        key: ' ',
        preventDefault: jest.fn()} as any;

      handleKeyboardNavigation(event, { onSpace });
      expect(onSpace).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call onEscape callback for Escape key', () => {
      const onEscape = jest.fn();
      const event = {
        key: 'Escape',
        preventDefault: jest.fn()} as any;

      handleKeyboardNavigation(event, { onEscape });
      expect(onEscape).toHaveBeenCalled();
    });

    it('should call onArrowUp callback for ArrowUp key and prevent default', () => {
      const onArrowUp = jest.fn();
      const event = {
        key: 'ArrowUp',
        preventDefault: jest.fn()} as any;

      handleKeyboardNavigation(event, { onArrowUp });
      expect(onArrowUp).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});

