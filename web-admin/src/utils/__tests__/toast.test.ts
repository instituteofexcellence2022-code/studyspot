import { showSuccess, showError, showInfo, showWarning } from '../toast';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('Toast Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call toast.success with correct message', () => {
    const message = 'Operation successful';
    showSuccess(message);
    expect(toast.success).toHaveBeenCalledWith(message);
  });

  it('should call toast.error with correct message', () => {
    const message = 'Operation failed';
    showError(message);
    expect(toast.error).toHaveBeenCalledWith(message);
  });

  it('should call toast.info with correct message', () => {
    const message = 'Information message';
    showInfo(message);
    expect(toast.info).toHaveBeenCalledWith(message);
  });

  it('should call toast.warning with correct message', () => {
    const message = 'Warning message';
    showWarning(message);
    expect(toast.warning).toHaveBeenCalledWith(message);
  });
});

