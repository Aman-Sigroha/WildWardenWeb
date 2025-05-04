import { createContext, useState } from 'react';

// Create the theme context
const ThemeContext = createContext({
  theme: 'radar',
  changeTheme: () => {}
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('radar');
  
  // Function to change the theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    // We'll set a simple class on the body
    document.body.className = `theme-${newTheme}`;
  };
  
  // Set initial theme class
  if (document.body.className === '') {
    document.body.className = 'theme-radar';
  }
  
  // Create the value object
  const value = {
    theme,
    changeTheme
  };
  
  // Return the provider with the value
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export the context so it can be used by the hook
export default ThemeContext; 