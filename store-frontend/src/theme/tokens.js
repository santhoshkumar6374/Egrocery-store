/**
 * Design tokens for the "neighborhood market" visual identity.
 * Grounded in the actual vernacular of a grocery shop — canvas awnings,
 * kraft-paper crates, chalkboard price tags — rather than generic
 * "eco SaaS green" or default Material Design blue.
 */
export const colors = {
  awningGreen: '#2F5233', // primary — deep canvas-awning green
  awningGreenLight: '#4A7550',
  awningGreenDark: '#1E3821',
  kraft: '#E8DCC4', // crate / kraft-paper surface
  kraftDark: '#D8C8A4',
  paper: '#FAF7F0', // warm off-white background, like packing paper
  tomato: '#C1440E', // signature accent — price tags, discount badges, sale
  tomatoDark: '#9A3509',
  wheat: '#D9A441', // secondary accent — ratings, highlights
  ink: '#2B2620', // warm charcoal text, not pure black
  inkMuted: '#6B6355',
  success: '#2F5233',
  error: '#C1440E',
  warning: '#D9A441',
};

export const fonts = {
  display: '"Fraunces", "Georgia", serif', // headings, big prices — the chalkboard-numeral face
  body: '"Inter", "Segoe UI", sans-serif', // UI copy, product grids
  mono: '"IBM Plex Mono", "Courier New", monospace', // order numbers, SKUs, timestamps, stamped data
};