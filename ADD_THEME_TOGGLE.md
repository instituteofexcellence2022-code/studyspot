# 🌓 How to Add Theme Toggle Button

## Quick Implementation Guide

### Option 1: Add to Sidebar (Recommended)

Update `web-owner/src/components/common/Sidebar.tsx`:

```typescript
// Add imports at the top
import { toggleTheme } from '../../store/themeSlice';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';

// In the component
const Sidebar = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  
  // Add this in the sidebar, before the logout button:
  return (
    <Drawer>
      {/* ... existing navigation items ... */}
      
      {/* Theme Toggle Button */}
      <ListItemButton 
        onClick={() => dispatch(toggleTheme())}
        sx={{ 
          borderRadius: 2, 
          mx: 1,
          my: 0.5,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {themeMode === 'dark' ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText 
          primary={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'} 
          primaryTypographyProps={{ fontSize: '0.9rem' }}
        />
      </ListItemButton>
      
      {/* Logout button */}
      <ListItemButton onClick={handleLogout}>
        ...
      </ListItemButton>
    </Drawer>
  );
};
```

### Option 2: Add to Header/Navbar

```typescript
import { IconButton, Tooltip } from '@mui/material';
import { toggleTheme } from '../store/themeSlice';

const Header = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  
  return (
    <AppBar>
      <Toolbar>
        {/* ... other items ... */}
        
        <Tooltip title="Toggle Theme">
          <IconButton 
            onClick={() => dispatch(toggleTheme())} 
            color="inherit"
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
```

### Option 3: Add to Settings Page

Already exists in `web-owner/src/pages/settings/SettingsPage.tsx`!

```typescript
// In Settings Page
<FormControlLabel
  control={
    <Switch 
      checked={themeMode === 'dark'}
      onChange={() => dispatch(toggleTheme())}
    />
  }
  label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {themeMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      <Typography>
        {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </Typography>
    </Box>
  }
/>
```

---

## 🎨 Styled Theme Toggle (Fancy)

### Floating Action Button
```typescript
import { Fab } from '@mui/material';

<Fab
  onClick={() => dispatch(toggleTheme())}
  sx={{
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  }}
  color="primary"
  size="medium"
>
  {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
</Fab>
```

### Animated Toggle Button
```typescript
import { ToggleButton } from '@mui/material';

<ToggleButton
  value={themeMode}
  selected={themeMode === 'dark'}
  onChange={() => dispatch(toggleTheme())}
  sx={{
    borderRadius: 8,
    transition: 'all 0.3s ease',
  }}
>
  {themeMode === 'dark' ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LightModeIcon />
      <Typography>Light</Typography>
    </Box>
  ) : (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <DarkModeIcon />
      <Typography>Dark</Typography>
    </Box>
  )}
</ToggleButton>
```

---

## ✅ Testing

After adding the toggle:

1. Click the button
2. Theme should instantly switch
3. Reload the page - theme should persist
4. Check all components look good in both modes

---

**That's it!** Your theme toggle is ready to use! 🎉

