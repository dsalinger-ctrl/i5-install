import { useColorScheme } from 'react-native';

import { Colors, type Palette } from '@/constants/theme';

/** The I-5 palette for the phone's current light or dark setting. */
export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? Colors.dark : Colors.light;
}
