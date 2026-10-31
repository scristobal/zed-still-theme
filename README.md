# Still for Zed

**VS Code Dark 2026 and Light 2026 for Zed, with syntax highlighting stripped back to the essentials.** A port of [Still for VS Code](https://github.com/scristobal/vscode-theme-alabaster). Each appearance maps its stock 2026 workbench colors onto Zed: editor, panels, tabs, title and status bars, terminal, selections, diagnostics, and git colors.

The highlighting follows the principles in Nikita Prokopov’s [syntax highlighting article](https://tonsky.me/blog/syntax-highlighting/), using four syntax accents:

| Code | Still Dark | Still Light |
| --- | --- | --- |
| References, calls, type references, and keywords | Default text `#BBBEBF` | Default text `#202020` |
| Function and named type declarations | Yellow `#E5C76B` | Ochre `#8A6500` |
| Variable, parameter, and property declarations | Blue `#7EB6E8` | Blue `#1F6FAA` |
| Strings, numbers, and literal values | Green `#A8CF80` | Green `#3C6D2C` |
| Comments | Violet `#C49BE0` | Violet `#8250A0` |
| Punctuation and symbolic operators | Gray `#808080` | Gray `#767676` |

A declaration gets color where a name is introduced; its uses stay plain. Numbers and strings share a color. Comments stand out. Syntax uses no bold or italics. Rainbow brackets (`colorize_brackets`) use the punctuation color instead of adding more syntax colors.

## Install

Until Still is in the Zed extension registry, install it as a dev extension: run **zed: install dev extension** from the command palette and select this folder. Then pick **Still Dark** or **Still Light** with **theme selector: toggle**, or follow the system appearance:

```jsonc
"theme": {
  "mode": "system",
  "light": "Still Light",
  "dark": "Still Dark"
}
```

## Language support

Zed highlights with tree-sitter unless semantic tokens are enabled. Still colors a declaration only where Zed’s bundled grammars capture it separately from its uses:

- Rust: function and `macro_rules!` definitions, and parameters.
- Python: function, class, and `__init__` definitions, and parameters.
- Go: type definitions.
- JavaScript and TypeScript: parameters. Their grammars capture function and class names the same way at declarations and uses, so those stay plain.

Literals, comments, and punctuation are colored in every language. Extension grammars that use the same capture names get the same colors.

## Semantic tokens

Language servers know where every name is declared. To color declarations as VS Code Still does, enable semantic tokens and add Still’s rules: merge [`semantic-tokens.jsonc`](semantic-tokens.jsonc) into your settings (**zed: open settings**), placing its rules before any of your own `semantic_token_rules`. Then run **editor: restart language server**. See Zed’s [semantic tokens guide](https://zed.dev/docs/semantic-tokens).

Zed’s default rules already color class, struct, enum, interface, type, and type parameter declarations with Still’s styles. Still’s rules add function, method, macro, namespace, variable, parameter, property, and enum member declarations, and closure bindings (rust-analyzer’s `callable` modifier). Parameter references stay plain.

The rules apply to every theme. A theme without Still’s declaration styles keeps Zed’s default colors, but its parameter references use its `variable` style. Use **dev: open highlights tree view** to inspect a token.

## Differences from VS Code Still

- Zed has no line-highlight border. The current line uses only VS Code’s line background, which is faint in Still Light.
- CSS keyword values such as `flex` use the literal color: Zed’s CSS grammar captures them as built-in constants, like `null`, `nil`, and `None`.
- In `.diff` files, Zed’s grammar captures the `diff` command’s arguments as parameters, so they are blue.

## Development

Building requires Node.js 22 or later.

```sh
npm run build
npm run check
```

`src/dark-2026.json` and `src/light-2026.json` are the resolved workbench colors from VS Code 1.142.0’s built-in Dark 2026 and Light 2026 themes, copied from VS Code Still. `src/vscode-defaults.mjs` adds the VS Code registry defaults those themes inherit, such as terminal ANSI colors, diagnostics, diff lines, and ghost text. `src/theme.mjs` maps them onto Zed’s theme keys. Edit syntax roles in `src/palettes.mjs`, syntax keys in `createSyntax`, and semantic token rules in `src/semantic-tokens.mjs`.

`npm run build` writes `themes/still.json` and `semantic-tokens.jsonc`. `npm run check` checks that both are current, that syntax contrast is at least 4.5:1, that every theme color resolves to a hex color, and that every style a semantic token rule names exists in both themes.

Zed resolves a capture to the longest syntax key that is a dot-separated prefix of its name, and a semantic token whose style the theme lacks leaves tree-sitter’s color in place. Still therefore defines no keys for references, calls, types, or keywords: restating them in the foreground color would let semantic tokens erase tree-sitter’s declaration colors.

## Origin and license

Still is maintained by [Samuel Cristobal](https://github.com/scristobal). Its workbench colors come from Microsoft’s [VS Code default themes](https://github.com/microsoft/vscode/tree/main/extensions/theme-defaults), under the MIT license. The syntax rules follow the article above.

The project began as an independent fork of [Alabaster for VS Code](https://github.com/tonsky/vscode-theme-alabaster) by Nikita Prokopov, and its copyright notice is retained.

[MIT License](LICENSE.txt).
