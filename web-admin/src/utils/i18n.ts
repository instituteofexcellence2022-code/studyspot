/**
 * Internationalization (i18n) Utility
 * Basic scaffolding for future multi-language support
 */

type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh';

interface TranslationKeys {
  // Auth
  'auth.login.title': string;
  'auth.login.subtitle': string;
  'auth.login.email': string;
  'auth.login.password': string;
  'auth.login.signIn': string;
  'auth.login.demoAccount': string;
  'auth.login.orLoginWithEmail': string;
  'auth.login.socialLogin': string;
  'auth.login.rememberMe': string;
  'auth.login.forgotPassword': string;
  'auth.login.noAccount': string;
  'auth.login.signUp': string;
  
  // Errors
  'error.login.failed': string;
  'error.network': string;
  'error.invalidCredentials': string;
  'error.tooManyAttempts': string;
  'error.serverError': string;
  'error.required': string;
  
  // Success
  'success.login': string;
  'success.demoSetup': string;
  
  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.cancel': string;
  'common.confirm': string;
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    'auth.login.title': 'Platform Admin Portal',
    'auth.login.subtitle': 'Manage the entire StudySpot platform',
    'auth.login.email': 'Email Address',
    'auth.login.password': 'Password',
    'auth.login.signIn': 'Sign In',
    'auth.login.demoAccount': 'Try Demo Admin Account',
    'auth.login.orLoginWithEmail': 'OR LOGIN WITH EMAIL',
    'auth.login.socialLogin': 'Social Login (Coming Soon)',
    'auth.login.rememberMe': 'Remember me',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signUp': 'Sign up',
    
    'error.login.failed': 'Login failed. Please check your credentials.',
    'error.network': 'Cannot connect to server. Please check your connection.',
    'error.invalidCredentials': 'Invalid credentials. Please try again.',
    'error.tooManyAttempts': 'Too many attempts. Please wait a moment before trying again.',
    'error.serverError': 'Server error. Please try again later.',
    'error.required': 'This field is required',
    
    'success.login': 'Login successful! Redirecting...',
    'success.demoSetup': 'Setting up demo account...',
    
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
  },
  es: {
    'auth.login.title': 'Portal de Administración',
    'auth.login.subtitle': 'Gestiona toda la plataforma StudySpot',
    'auth.login.email': 'Dirección de correo',
    'auth.login.password': 'Contraseña',
    'auth.login.signIn': 'Iniciar sesión',
    'auth.login.demoAccount': 'Probar cuenta demo',
    'auth.login.orLoginWithEmail': 'O INICIAR SESIÓN CON EMAIL',
    'auth.login.socialLogin': 'Inicio de sesión social (Próximamente)',
    'auth.login.rememberMe': 'Recordarme',
    'auth.login.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.login.noAccount': '¿No tienes cuenta?',
    'auth.login.signUp': 'Registrarse',
    
    'error.login.failed': 'Error al iniciar sesión. Verifica tus credenciales.',
    'error.network': 'No se puede conectar al servidor. Verifica tu conexión.',
    'error.invalidCredentials': 'Credenciales inválidas. Inténtalo de nuevo.',
    'error.tooManyAttempts': 'Demasiados intentos. Espera un momento antes de intentar de nuevo.',
    'error.serverError': 'Error del servidor. Inténtalo más tarde.',
    'error.required': 'Este campo es obligatorio',
    
    'success.login': '¡Inicio de sesión exitoso! Redirigiendo...',
    'success.demoSetup': 'Configurando cuenta demo...',
    
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
  },
  // Add more languages as needed...
  fr: {} as TranslationKeys,
  de: {} as TranslationKeys,
  hi: {} as TranslationKeys,
  zh: {} as TranslationKeys,
};

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    localStorage.setItem('studyspot_language', language);
  }

  getLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('studyspot_language') as SupportedLanguage;
    return stored && translations[stored] ? stored : 'en';
  }

  t(key: keyof TranslationKeys): string {
    const translation = translations[this.currentLanguage]?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
      return translations.en[key] || key;
    }
    return translation;
  }

  // Initialize with stored language
  init(): void {
    this.currentLanguage = this.getLanguage();
  }
}

export const i18n = new I18nService();
export default i18n;

// Initialize on module load
i18n.init();



