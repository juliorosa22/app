// Theme configuration for Okan Assist App
export const theme = {
  // Color palette - Dark blue, Grey, White theme
  colors: {
    // Primary colors (Dark Blues)
    primary: '#1e3a8a',        // Dark blue
    primaryDark: '#1e40af',    // Slightly darker blue
    primaryLight: '#3b82f6',   // Lighter blue for accents
    
    // Secondary colors (Greys)
    secondary: '#6b7280',      // Medium grey
    secondaryDark: '#4b5563',  // Dark grey
    secondaryLight: '#9ca3af', // Light grey
    
    // Background colors
    background: '#ffffff',      // Pure white
    backgroundSecondary: '#f9fafb', // Very light grey
    backgroundDark: '#1f2937',  // Dark background for dark mode
    
    // Surface colors
    surface: '#ffffff',         // Card/surface white
    surfaceSecondary: '#f3f4f6', // Light grey surface
    
    // Text colors
    textPrimary: '#111827',     // Almost black
    textSecondary: '#6b7280',   // Medium grey
    textLight: '#9ca3af',       // Light grey
    textOnPrimary: '#ffffff',   // White text on primary colors
    
    // Border colors
    border: '#e5e7eb',          // Light border
    borderLight: '#f3f4f6',     // Very light border
    borderDark: '#d1d5db',      // Darker border
    
    // Status colors
    success: '#10b981',         // Green
    error: '#ef4444',           // Red
    warning: '#f59e0b',         // Orange
    info: '#3b82f6',            // Blue
    
    // Expense & Reminder specific colors
    expense: '#ef4444',         // Red for expenses
    income: '#10b981',          // Green for income
    reminder: '#8b5cf6',        // Purple for reminders
    
    // Interactive elements
    link: '#3b82f6',            // Blue links
    linkHover: '#2563eb',       // Darker blue on hover
    
    // Overlay and shadow
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Typography system
  typography: {
    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  
  // Component specific styles
  components: {
    button: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
      },
      padding: {
        sm: { paddingHorizontal: 12, paddingVertical: 6 },
        md: { paddingHorizontal: 16, paddingVertical: 8 },
        lg: { paddingHorizontal: 20, paddingVertical: 12 },
      },
    },
    
    input: {
      height: 48,
      borderWidth: 1,
      paddingHorizontal: 16,
    },
    
    card: {
      padding: 16,
      borderRadius: 12,
    },
  },
};

// Dark theme variant
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    // Override colors for dark mode
    background: '#111827',
    backgroundSecondary: '#1f2937',
    surface: '#374151',
    surfaceSecondary: '#4b5563',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textLight: '#9ca3af',
    border: '#4b5563',
    borderLight: '#374151',
    borderDark: '#6b7280',
  },
};

// Helper functions for theme usage
export const getSpacing = (size) => theme.spacing[size] || size;
export const getColor = (colorName) => theme.colors[colorName] || colorName;
export const getFontSize = (size) => theme.typography.fontSize[size] || size;