import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Parse CSS variables from global.css
function parseCssVariables(css: string, theme: "light" | "dark") {
  const regex = theme === "light" ? /:root\s*{([^}]+)}/ : /\.dark:root\s*{([^}]+)}/;

  const match = css.match(regex);
  if (!match) return {};

  const variables: Record<string, string> = {};
  const lines = match[1].split("\n");

  lines.forEach((line) => {
    const varMatch = line.match(/--([^:]+):\s*([^;]+);/);
    if (varMatch) {
      let [, name, value] = varMatch;
      // kebab case to camel
      name = name
        .trim()
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/-/g, "");

      // wrap color values in hsl()
      // hsl is normally written as three space-separated numbers but sometimes includes alpha
      if (value.split(" ").length !== 1) {
        value = `hsl(${value.trim()})`;
      }
      variables[name] = value.trim();
    }
  });

  return variables;
}

const cssContent = readFileSync(join(import.meta.dirname, "../global.css"), "utf-8");
const lightVars = parseCssVariables(cssContent, "light");
const darkVars = parseCssVariables(cssContent, "dark");

// Generate theme.ts content
const themeContent = `// filepath: /Users/dpjandow/Documents/react-native-skeleton/lib/theme.ts
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run 'npm run generate:theme' to regenerate
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    ${Object.entries(lightVars)
      .map(([key, value]) => `${key}: '${value}',`)
      .join("\n")}
      },
  dark: {
    ${Object.entries(darkVars)
      .map(([key, value]) => `${key}: '${value}',`)
      .join("\n")}
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
`;

writeFileSync(join(import.meta.dirname, "../lib/theme.ts"), themeContent);
console.log("✅ Theme generated successfully!");
