/**
 * StudySpot Mobile App - NativeBase Theme Configuration
 * Custom theme for consistent UI across the app
 */

import {extendTheme} from 'native-base';
import {COLORS, TYPOGRAPHY} from './index';

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#E8F5E8',
      100: '#C8E6C8',
      200: '#A5D6A5',
      300: '#81C784',
      400: '#66BB6A',
      500: COLORS.PRIMARY, // #2E7D32
      600: '#388E3C',
      700: '#2E7D32',
      800: '#1B5E20',
      900: '#0D4F0F',
    },
    secondary: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: COLORS.SECONDARY, // #FF6B35
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
    gray: {
      50: COLORS.GRAY[50],
      100: COLORS.GRAY[100],
      200: COLORS.GRAY[200],
      300: COLORS.GRAY[300],
      400: COLORS.GRAY[400],
      500: COLORS.GRAY[500],
      600: COLORS.GRAY[600],
      700: COLORS.GRAY[700],
      800: COLORS.GRAY[800],
      900: COLORS.GRAY[900],
    },
    success: {
      500: COLORS.SUCCESS,
    },
    warning: {
      500: COLORS.WARNING,
    },
    error: {
      500: COLORS.ERROR,
    },
    info: {
      500: COLORS.INFO,
    },
  },
  fontConfig: {
    Roboto: {
      100: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      200: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      300: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      400: {
        normal: 'Roboto-Regular',
        italic: 'Roboto-Italic',
      },
      500: {
        normal: 'Roboto-Medium',
        italic: 'Roboto-MediumItalic',
      },
      600: {
        normal: 'Roboto-Medium',
        italic: 'Roboto-MediumItalic',
      },
      700: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      },
      800: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      },
      900: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      },
    },
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
    mono: 'Roboto',
  },
  fontSizes: {
    xs: TYPOGRAPHY.FONT_SIZE.XS,
    sm: TYPOGRAPHY.FONT_SIZE.SM,
    md: TYPOGRAPHY.FONT_SIZE.MD,
    lg: TYPOGRAPHY.FONT_SIZE.LG,
    xl: TYPOGRAPHY.FONT_SIZE.XL,
    '2xl': TYPOGRAPHY.FONT_SIZE.XXL,
    '3xl': TYPOGRAPHY.FONT_SIZE.XXXL,
  },
  lineHeights: {
    xs: TYPOGRAPHY.LINE_HEIGHT.XS,
    sm: TYPOGRAPHY.LINE_HEIGHT.SM,
    md: TYPOGRAPHY.LINE_HEIGHT.MD,
    lg: TYPOGRAPHY.LINE_HEIGHT.LG,
    xl: TYPOGRAPHY.LINE_HEIGHT.XL,
    '2xl': TYPOGRAPHY.LINE_HEIGHT.XXL,
    '3xl': TYPOGRAPHY.LINE_HEIGHT.XXXL,
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 8,
        _text: {
          fontWeight: '600',
        },
      },
      variants: {
        solid: {
          _pressed: {
            opacity: 0.8,
          },
        },
        outline: {
          borderWidth: 1,
          _pressed: {
            opacity: 0.8,
          },
        },
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          _text: {
            fontSize: 'sm',
          },
        },
        md: {
          px: 4,
          py: 3,
          _text: {
            fontSize: 'md',
          },
        },
        lg: {
          px: 6,
          py: 4,
          _text: {
            fontSize: 'lg',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER.PRIMARY,
        _focus: {
          borderColor: COLORS.BORDER.FOCUS,
        },
        _invalid: {
          borderColor: COLORS.BORDER.ERROR,
        },
      },
      variants: {
        filled: {
          backgroundColor: COLORS.BACKGROUND.SECONDARY,
          borderColor: 'transparent',
        },
      },
    },
    Card: {
      baseStyle: {
        borderRadius: 12,
        backgroundColor: COLORS.BACKGROUND.CARD,
        shadowColor: COLORS.SHADOW.LIGHT,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 4,
        px: 2,
        py: 1,
      },
      variants: {
        solid: {
          _text: {
            color: COLORS.WHITE,
            fontWeight: '600',
          },
        },
        outline: {
          borderWidth: 1,
          _text: {
            fontWeight: '600',
          },
        },
      },
    },
    Alert: {
      baseStyle: {
        borderRadius: 8,
        p: 3,
      },
      variants: {
        success: {
          backgroundColor: COLORS.SUCCESS + '20',
          borderColor: COLORS.SUCCESS,
          borderWidth: 1,
          _text: {
            color: COLORS.SUCCESS,
          },
        },
        warning: {
          backgroundColor: COLORS.WARNING + '20',
          borderColor: COLORS.WARNING,
          borderWidth: 1,
          _text: {
            color: COLORS.WARNING,
          },
        },
        error: {
          backgroundColor: COLORS.ERROR + '20',
          borderColor: COLORS.ERROR,
          borderWidth: 1,
          _text: {
            color: COLORS.ERROR,
          },
        },
        info: {
          backgroundColor: COLORS.INFO + '20',
          borderColor: COLORS.INFO,
          borderWidth: 1,
          _text: {
            color: COLORS.INFO,
          },
        },
      },
    },
  },
  config: {
    useSystemColorMode: true,
    initialColorMode: 'light',
  },
});

export default theme;
