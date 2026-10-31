import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { palettes } from '../src/palettes.mjs';
import { createRules, formatSettings } from '../src/semantic-tokens.mjs';
import { createThemeFamily } from '../src/theme.mjs';

const check = process.argv.includes('--check');
const root = new URL('../', import.meta.url);

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(n => parseInt(n, 16) / 255);
  const linear = rgb.map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// Check readability without forcing distinct roles to have equal lightness.
function checkContrast(p) {
  const minimum = 4.5;
  for (const role of ['foreground', 'punctuation', 'comment', 'literal', 'binding', 'declaration']) {
    const ratio = contrast(p[role], p.editor);
    if (ratio < minimum) throw new Error(`${p.name}: ${role} on editor is ${ratio.toFixed(2)}:1; requires ${minimum}:1`);
  }
}

// Every color must be a Zed hex color; an undefined one means a missing VS Code key.
function checkColors(theme) {
  const visit = (value, path) => {
    if (value === undefined) throw new Error(`${theme.name}: ${path} has no source color`);
    if (typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`);
    } else if (path !== 'style.background.appearance' && !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
      throw new Error(`${theme.name}: ${path} is not a hex color: ${value}`);
    }
  };
  for (const [key, value] of Object.entries(theme.style)) visit(value, `style.${key}`);
}

async function emit(file, output) {
  const path = new URL(file, root);
  if (check) {
    if (await readFile(path, 'utf8') !== output) throw new Error(`${file} is stale. Run npm run build.`);
  } else {
    await writeFile(path, output);
  }
}

await mkdir(new URL('themes/', root), { recursive: true });
const family = createThemeFamily(palettes);
for (const [i, theme] of family.themes.entries()) {
  checkContrast(palettes[i]);
  checkColors(theme);
}
await emit('themes/still.json', JSON.stringify(family, null, '\t') + '\n');
console.log(`${check ? 'Checked' : 'Built'} ${family.themes.map(t => t.name).join(' and ')}; syntax text contrast meets 4.5:1.`);

const rules = createRules();
for (const style of new Set(rules.flatMap(rule => rule.style))) {
  for (const theme of family.themes) {
    if (!theme.style.syntax[style]) throw new Error(`${theme.name} lacks the ${style} style a semantic token rule uses`);
  }
}
await emit('semantic-tokens.jsonc', formatSettings(rules));
console.log(`${check ? 'Checked' : 'Built'} semantic-tokens.jsonc; every rule style exists in both themes.`);
