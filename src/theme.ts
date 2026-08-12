import { useColorScheme } from 'react-native';

// Palette pulled straight from the design proposal: a warm "study lamp"
// identity — pine-green accent, amber highlight, warm neutrals.

export type Colors = {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  line: string;
  accent: string;
  accentInk: string;
  onAccent: string;
  amber: string;
  good: string;
  bad: string;
  dark: boolean;
};

const light: Colors = {
  bg: '#FBFAF7',
  surface: '#FFFFFF',
  surface2: '#F3F1EB',
  ink: '#23201D',
  inkSoft: '#5C574E',
  line: '#E4E0D6',
  accent: '#2E6F5E',
  accentInk: '#1E4B40',
  onAccent: '#FFFFFF',
  amber: '#C67C1E',
  good: '#2E6F5E',
  bad: '#C0442E',
  dark: false,
};

const dark: Colors = {
  bg: '#1A1815',
  surface: '#232019',
  surface2: '#2C2822',
  ink: '#F0EBE1',
  inkSoft: '#B0A99B',
  line: '#38332B',
  accent: '#5FB89E',
  accentInk: '#8FD3BE',
  onAccent: '#122019',
  amber: '#E8A94D',
  good: '#5FB89E',
  bad: '#E0765C',
  dark: true,
};

export function useTheme(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export { light, dark };
