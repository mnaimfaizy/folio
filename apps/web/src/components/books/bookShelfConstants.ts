/* ================================================================
   Book shelf colour / texture constants
   ================================================================ */

export const GENRE_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    accent: string;
    texture: 'leather' | 'cloth' | 'linen';
  }
> = {
  Fiction: {
    bg: '#8B2252',
    text: '#F5DEB3',
    accent: '#D4A574',
    texture: 'cloth',
  },
  'Science Fiction': {
    bg: '#1B4F72',
    text: '#AED6F1',
    accent: '#5DADE2',
    texture: 'cloth',
  },
  Fantasy: {
    bg: '#4A235A',
    text: '#D7BDE2',
    accent: '#AF7AC5',
    texture: 'leather',
  },
  Mystery: {
    bg: '#1C2833',
    text: '#D5D8DC',
    accent: '#85929E',
    texture: 'leather',
  },
  Romance: {
    bg: '#922B3E',
    text: '#FADBD8',
    accent: '#E74C3C',
    texture: 'cloth',
  },
  History: {
    bg: '#2E5436',
    text: '#D5F5E3',
    accent: '#82E0AA',
    texture: 'leather',
  },
  Biography: {
    bg: '#6C3D0F',
    text: '#FDEBD0',
    accent: '#E59866',
    texture: 'leather',
  },
  Science: {
    bg: '#1A5276',
    text: '#D6EAF8',
    accent: '#3498DB',
    texture: 'linen',
  },
  Philosophy: {
    bg: '#4D5656',
    text: '#E8E8E8',
    accent: '#AAB7B8',
    texture: 'linen',
  },
  Poetry: {
    bg: '#7D3C98',
    text: '#E8DAEF',
    accent: '#BB8FCE',
    texture: 'cloth',
  },
  Thriller: {
    bg: '#1B2631',
    text: '#D5D8DC',
    accent: '#5D6D7E',
    texture: 'leather',
  },
  Horror: {
    bg: '#1A1A2E',
    text: '#C0C0C0',
    accent: '#E74C3C',
    texture: 'leather',
  },
  'Non-Fiction': {
    bg: '#5B370A',
    text: '#F9E79F',
    accent: '#F4D03F',
    texture: 'linen',
  },
  'Self-Help': {
    bg: '#0E6655',
    text: '#D1F2EB',
    accent: '#48C9B0',
    texture: 'cloth',
  },
};

export const FALLBACK_COLORS: Array<{
  bg: string;
  text: string;
  accent: string;
  texture: 'leather' | 'cloth' | 'linen';
}> = [
  { bg: '#6B3A2A', text: '#FDEBD0', accent: '#E59866', texture: 'leather' },
  { bg: '#2C3E50', text: '#D6EAF8', accent: '#5DADE2', texture: 'cloth' },
  { bg: '#4A235A', text: '#E8DAEF', accent: '#BB8FCE', texture: 'leather' },
  { bg: '#1E8449', text: '#D5F5E3', accent: '#82E0AA', texture: 'cloth' },
  { bg: '#7B241C', text: '#FADBD8', accent: '#EC7063', texture: 'leather' },
  { bg: '#1F618D', text: '#AED6F1', accent: '#3498DB', texture: 'linen' },
  { bg: '#6E2C00', text: '#FAD7A0', accent: '#F0B27A', texture: 'leather' },
  { bg: '#514A9D', text: '#D2B4DE', accent: '#A569BD', texture: 'cloth' },
];

/** Headband colours — the coloured fabric strip at top/bottom of a spine */
export const HEADBAND_COLORS: [string, string][] = [
  ['#C41E3A', '#F5F5DC'], // red + cream
  ['#1E3A5F', '#C4A35A'], // navy + gold
  ['#2E5436', '#F5DEB3'], // green + wheat
  ['#4A235A', '#E8DAEF'], // purple + lavender
  ['#8B4513', '#F4A460'], // saddle brown + sandy
  ['#1C2833', '#D5D8DC'], // charcoal + silver
];
