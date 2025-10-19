// Theme.js - Centralized theme management
export const lightTheme = {
  // Main colors
  primary: '#4285F4',
  secondary: '#34A853',
  accent: '#EA4335',
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  placeholder: '#999999',
  
  // Status colors
  success: '#34A853',
  warning: '#FBBC05',
  error: '#EA4335',
  
  // Button colors
  buttonPrimary: '#4285F4',
  buttonSecondary: '#f0f0f0',
  buttonText: '#ffffff',
  buttonDisabled: '#cccccc',
  
  // Header colors
  headerBackground: '#4285F4',
  headerText: '#ffffff',
  
  // Tab bar colors
  tabBarBackground: '#ffffff',
  tabBarActive: '#4285F4',
  tabBarInactive: '#999999',
};

export const darkTheme = {
  // Main colors
  primary: '#4285F4',
  secondary: '#34A853',
  accent: '#EA4335',
  background: '#121212',
  cardBackground: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#333333',
  placeholder: '#999999',
  
  // Status colors
  success: '#34A853',
  warning: '#FBBC05',
  error: '#EA4335',
  
  // Button colors
  buttonPrimary: '#4285F4',
  buttonSecondary: '#333333',
  buttonText: '#ffffff',
  buttonDisabled: '#555555',
  
  // Header colors
  headerBackground: '#1a1a1a',
  headerText: '#ffffff',
  
  // Tab bar colors
  tabBarBackground: '#1a1a1a',
  tabBarActive: '#4285F4',
  tabBarInactive: '#999999',
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};