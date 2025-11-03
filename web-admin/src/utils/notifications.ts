import { store } from '../store';
import { showSnackbar } from '../store/slices/uiSlice';

export function showSuccess(message: string): void {
  store.dispatch(showSnackbar({ message, severity: 'success' }));
}

export function showError(message: string): void {
  store.dispatch(showSnackbar({ message, severity: 'error' }));
}

export function showInfo(message: string): void {
  store.dispatch(showSnackbar({ message, severity: 'info' }));
}

export function showWarning(message: string): void {
  store.dispatch(showSnackbar({ message, severity: 'warning' }));
}


