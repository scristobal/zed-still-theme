import dark2026 from './dark-2026.json' with { type: 'json' };
import light2026 from './light-2026.json' with { type: 'json' };
import { vscodeDefaults } from './vscode-defaults.mjs';

// Both appearances share syntax roles and preserve their stock 2026 workbench.
// The syntax roles match VS Code Still.
export const palettes = [{
  name: 'Still Dark',
  appearance: 'dark',
  colors: { ...vscodeDefaults.dark, ...dark2026.colors },
  editor: dark2026.colors['editor.background'],
  foreground: dark2026.colors['editor.foreground'],
  punctuation: '#808080',
  comment: '#C49BE0',
  binding: '#7EB6E8',
  literal: '#A8CF80',
  declaration: '#E5C76B',
  error: '#EC8B8B',
}, {
  name: 'Still Light',
  appearance: 'light',
  colors: { ...vscodeDefaults.light, ...light2026.colors },
  editor: light2026.colors['editor.background'],
  foreground: light2026.colors['editor.foreground'],
  punctuation: '#767676',
  comment: '#8250A0',
  binding: '#1F6FAA',
  literal: '#3C6D2C',
  declaration: '#8A6500',
  error: '#B64343',
}];
