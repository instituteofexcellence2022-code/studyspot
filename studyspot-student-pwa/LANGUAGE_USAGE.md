# Language Context Usage Guide

The language setting is now available throughout the entire student portal using React Context.

## How to Use

### 1. Import the hook in any component:

```typescript
import { useLanguage } from '../contexts/LanguageContext';
```

### 2. Use in your component:

```typescript
function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
    </div>
  );
}
```

## Available Methods

- `language`: Current language ('en' or 'hi')
- `setLanguage(lang)`: Change the language (saves to localStorage and backend)
- `t(key)`: Get translation for a key

## Adding New Translations

Add translations to `src/utils/translations.ts`:

```typescript
'my.new.key': {
  en: 'English text',
  hi: 'हिंदी पाठ',
},
```

Then use it:
```typescript
{t('my.new.key')}
```

## Language Persistence

- Automatically saves to localStorage
- Syncs with backend user profile
- Loads saved preference on app start
- Updates HTML lang attribute


