import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark';
}

const getInitialMode = (): 'light' | 'dark' => {
  // Check localStorage first
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode === 'light' || savedMode === 'dark') {
    return savedMode;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

const initialState: ThemeState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.mode);
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
  },
});

export const { toggleTheme, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;

