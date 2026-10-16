/**
 * I-5 design tokens. Source of truth: the "Brand and design tokens" table in CLAUDE.md
 * and the `.phone` / `.phone.dark` variables in the prototype.
 */

export const Colors = {
  light: {
    bg: '#F3F3F3',
    surface: '#FFFFFF',
    field: '#EEEEEE',
    line: '#E6E6E6',
    ink: '#0B0B0B',
    sub: '#5F5F5F',
    accent: '#224778',
    button: '#224778',
    tint: '#E4EAF3',
    amberBg: '#FFF0DB',
    amberInk: '#9A4A00',
    redBg: '#FCEBEB',
    redInk: '#A32D2D',
    okBg: '#E2F2E6',
    okInk: '#1E6B37',
  },
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    field: '#2C2C2E',
    line: '#2C2C2E',
    ink: '#FFFFFF',
    sub: '#A1A1A6',
    accent: '#7FA3D8',
    button: '#3E6CB3',
    tint: '#1E2C42',
    amberBg: '#3A2A12',
    amberInk: '#FFB340',
    redBg: '#3A1416',
    redInk: '#FF8A80',
    okBg: '#16301F',
    okInk: '#7DD69A',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

/** Brand colors that don't change with light/dark mode. */
export const Brand = {
  /** I-5 blue. The now card is always this, in both modes. */
  blue: '#224778',
  /** Icon navy: app icon and splash background. */
  navy: '#1B3A63',
  /** Placeholder until Dan confirms the brand gold. After changing navy or gold, run scripts/make-icons.py. */
  gold: '#C5A15A',
  /** Secondary text on the blue now card. */
  heroSub: '#C5D2E6',
  /** Ghost button border on the blue now card. */
  heroLine: '#5A7BAA',
  /** Live "on the clock" dot. */
  live: '#2FA35A',
} as const;

/** Montserrat for headings and small uppercase labels. Body text uses the system font (SF Pro). */
export const Fonts = {
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
} as const;

export const Radius = {
  pill: 10,
  button: 16,
  card: 20,
  hero: 24,
  tile: 22,
} as const;

/** Space the floating tab bar takes at the bottom of every screen. */
export const TabBarHeight = 70;
