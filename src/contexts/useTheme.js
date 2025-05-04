import { useContext } from 'react';
import ThemeContext from './ThemeContext';
 
// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext); 