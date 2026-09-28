export type ColorTheme = 'hearth' | 'ocean' | 'forest' | 'berry' | 'sunset' | 'slate';

export interface ThemePackage {
  id: ColorTheme;
  label: string;
  description: string;
  /** The package's signature shade, used only for the swatch preview in
   * the picker UI — the real colors are the CSS variables defined in
   * styles/globals.css that this id switches between. */
  swatch: string;
}

export const THEME_PACKAGES: ThemePackage[] = [
  {
    id: 'hearth',
    label: 'Hearth',
    description: 'The FamilyHub original — warm porch-light amber.',
    swatch: '#E08E45',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Calm teal and blue.',
    swatch: '#3BA6BC',
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Grounded, natural green.',
    swatch: '#5F9E52',
  },
  {
    id: 'berry',
    label: 'Berry',
    description: 'Rich magenta and plum.',
    swatch: '#A6549E',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Bold coral and red-orange.',
    swatch: '#E0704F',
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Minimal, monochrome, understated.',
    swatch: '#6B7280',
  },
];

export const DEFAULT_COLOR_THEME: ColorTheme = 'hearth';
