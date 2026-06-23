/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings } from '@bina/types';
import { settingsRepository } from '@bina/shared';

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  theme: Theme;
  settings: WebsiteSettings | null;
  refreshTheme: () => Promise<void>;
  updateThemeColors: (primary: string, secondary: string, accent: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [theme, setTheme] = useState<Theme>({
    primary: '#064E3B',   // Default Executive Emerald
    secondary: '#B45309', // Default Premium Gold/Amber
    accent: '#1E4E42',    // Default Deep Accent
  });

  const applyColorsToDocument = (colors: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
  };

  const loadTheme = async () => {
    try {
      const currentSettings = await settingsRepository.getSettings();
      setSettings(currentSettings);
      const loadedTheme = {
        primary: currentSettings.primaryColor,
        secondary: currentSettings.secondaryColor,
        accent: currentSettings.accentColor,
      };
      setTheme(loadedTheme);
      applyColorsToDocument(loadedTheme);
    } catch (e) {
      console.error('Error loading theme settings:', e);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const refreshTheme = async () => {
    await loadTheme();
  };

  const updateThemeColors = async (primary: string, secondary: string, accent: string) => {
    if (!settings) return;
    try {
      const updatedSettings = await settingsRepository.updateSettings({
        primaryColor: primary,
        secondaryColor: secondary,
        accentColor: accent,
      });
      setSettings(updatedSettings);
      const newTheme = { primary, secondary, accent };
      setTheme(newTheme);
      applyColorsToDocument(newTheme);
    } catch (e) {
      console.error('Error updating theme colors:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, settings, refreshTheme, updateThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
