const transparent = '#00000000';

// Replace a color's alpha byte.
const alpha = (color, value) => color.slice(0, 7) + value;

// Composite a translucent color over an opaque one.
function over(top, bottom) {
  const channels = hex => hex.slice(1).match(/../g).map(n => parseInt(n, 16));
  const [r, g, b, a = 255] = channels(top);
  const base = channels(bottom);
  return '#' + [r, g, b].map((n, i) => Math.round(n * a / 255 + base[i] * (1 - a / 255))
    .toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Zed resolves a capture to the longest syntax key that is a dot-separated
// prefix of its name. Captures without a key keep the editor foreground, and
// semantic tokens whose style is missing leave tree-sitter's color in place.
// So references, calls, types, and keywords get no key: restating them in the
// foreground color would let semantic tokens erase declaration colors.
export function createSyntax(p) {
  const c = p.colors;
  const style = color => ({ color });
  const literal = style(p.literal);
  const binding = style(p.binding);
  const declaration = style(p.declaration);
  return {
    // Code embedded in strings remains code, including rust-analyzer's
    // variables inside format strings.
    variable: style(p.foreground),
    embedded: style(p.foreground),
    punctuation: style(p.punctuation),
    operator: style(p.punctuation),
    string: literal,
    number: literal,
    boolean: literal,
    'constant.builtin': literal,
    // Injected regular expressions stay inside their literal.
    'keyword.operator.regex': literal,
    'operator.regex': literal,
    'punctuation.bracket.regex': literal,
    'punctuation.delimiter.regex': literal,
    'label.regex': literal,
    // Binding declarations, only where the grammar or language server
    // identifies them.
    'variable.parameter': binding,
    'variable.definition': binding,
    'type.parameter.definition': binding,
    // Named declarations, never calls or type references. Zed's default
    // semantic token rules use the type.*.definition styles.
    'function.definition': declaration,
    'function.method.definition': declaration,
    'function.method.constructor': declaration,
    'function.special.definition': declaration,
    'type.definition': declaration,
    'type.class.definition': declaration,
    'type.enum.definition': declaration,
    'type.interface.definition': declaration,
    'type.struct.definition': declaration,
    // Comments deserve attention, including names in JSDoc tags.
    comment: style(p.comment),
    'variable.jsdoc': style(p.comment),
    title: declaration,
    'markup.heading': declaration,
    link_text: binding,
    link_uri: binding,
    'markup.link': binding,
    'diff.plus': literal,
    'diff.minus': style(p.error),
    hint: { color: c['editorInlayHint.foreground'], background_color: alpha(c['badge.background'], '1A') },
    predictive: style(c['editorGhostText.foreground']),
  };
}

function statusColor(name, color, background = alpha(color, '1A'), border = alpha(color, '4D')) {
  return { [name]: color, [`${name}.background`]: background, [`${name}.border`]: border };
}

// Map the stock 2026 workbench onto Zed's surfaces. Zed fills an omitted key
// from its own palette, so every surface is set here. Only vim mode colors
// (transparent by default) and hollow diff hunks (derived from version_control)
// are left to Zed.
export function createTheme(p) {
  const c = p.colors;
  const terminal = c['terminal.background'] ?? c['panel.background'];
  const ansi = {};
  for (const name of ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']) {
    const key = name.toLowerCase();
    ansi[`terminal.ansi.${key}`] = c[`terminal.ansi${name}`];
    ansi[`terminal.ansi.bright_${key}`] = c[`terminal.ansiBright${name}`];
    // VS Code draws dim text at half opacity.
    ansi[`terminal.ansi.dim_${key}`] = alpha(c[`terminal.ansi${name}`], '80');
  }
  const collaborators = ['red', 'yellow', 'green', 'purple', 'orange', 'blue'].map(name => {
    const color = c[`charts.${name}`];
    return { cursor: color, background: color, selection: alpha(color, '3D') };
  });
  return {
    name: p.name,
    appearance: p.appearance,
    style: {
      'background.appearance': 'opaque',
      // Bracket nesting uses the punctuation color instead of adding syntax colors.
      accents: [p.punctuation],

      border: c['widget.border'],
      'border.variant': c['panel.border'],
      'border.focused': c['focusBorder'],
      'border.selected': c['focusBorder'],
      'border.transparent': transparent,
      'border.disabled': c['dropdown.border'],
      'elevated_surface.background': c['editorWidget.background'],
      'surface.background': c['sideBar.background'],
      background: c['sideBar.background'],
      'element.background': c['checkbox.background'],
      'element.hover': c['list.hoverBackground'],
      'element.active': c['toolbar.activeBackground'],
      'element.selected': c['inputOption.activeBackground'],
      'element.disabled': c['checkbox.background'],
      'element.selection_background': c['editor.selectionBackground'],
      'drop_target.background': c['list.dropBackground'],
      'drop_target.border': c['focusBorder'],
      'ghost_element.background': transparent,
      'ghost_element.hover': c['list.hoverBackground'],
      'ghost_element.active': c['toolbar.activeBackground'],
      'ghost_element.selected': c['list.activeSelectionBackground'],
      'ghost_element.disabled': transparent,
      text: c['foreground'],
      'text.muted': c['descriptionForeground'],
      'text.placeholder': c['input.placeholderForeground'],
      'text.disabled': c['disabledForeground'],
      'text.accent': c['list.highlightForeground'],
      icon: c['foreground'],
      'icon.muted': c['icon.foreground'],
      'icon.disabled': c['disabledForeground'],
      'icon.placeholder': c['descriptionForeground'],
      'icon.accent': c['textLink.foreground'],
      'debugger.accent': c['debugIcon.breakpointForeground'],
      'status_bar.background': c['statusBar.background'],
      'title_bar.background': c['titleBar.activeBackground'],
      'title_bar.inactive_background': c['titleBar.inactiveBackground'],
      'toolbar.background': c['breadcrumb.background'],
      'tab_bar.background': c['editorGroupHeader.tabsBackground'],
      'tab.inactive_background': c['tab.inactiveBackground'],
      'tab.active_background': c['tab.activeBackground'],
      'search.match_background': c['editor.findMatchHighlightBackground'],
      'search.active_match_background': c['editor.findMatchBackground'],
      'panel.background': c['panel.background'],
      'panel.focused_border': c['list.focusOutline'],
      // VS Code draws inactive tree guides at 40% of the stroke.
      'panel.indent_guide': alpha(c['tree.indentGuidesStroke'], '66'),
      'panel.indent_guide_hover': c['tree.indentGuidesStroke'],
      'panel.indent_guide_active': c['tree.indentGuidesStroke'],
      // Sticky rows cover the list, so their hover color must be opaque.
      'panel.overlay_background': c['sideBar.background'],
      'panel.overlay_hover': over(c['list.hoverBackground'], c['sideBar.background']),
      'pane.focused_border': transparent,
      'pane_group.border': c['editorGroup.border'],
      'scrollbar.thumb.background': c['scrollbarSlider.background'],
      'scrollbar.thumb.hover_background': c['scrollbarSlider.hoverBackground'],
      'scrollbar.thumb.active_background': c['scrollbarSlider.activeBackground'],
      'scrollbar.thumb.border': transparent,
      'scrollbar.track.background': transparent,
      'scrollbar.track.border': c['editorOverviewRuler.border'],
      'minimap.thumb.background': c['minimapSlider.background'],
      'minimap.thumb.hover_background': c['minimapSlider.hoverBackground'],
      'minimap.thumb.active_background': c['minimapSlider.activeBackground'],
      'minimap.thumb.border': transparent,
      'editor.foreground': c['editor.foreground'],
      'editor.code_lens.foreground': c['editorCodeLens.foreground'],
      'editor.background': c['editor.background'],
      'editor.gutter.background': c['editorGutter.background'],
      'editor.subheader.background': c['sideBarSectionHeader.background'],
      'editor.active_line.background': c['editor.lineHighlightBackground'],
      'editor.highlighted_line.background': c['editor.rangeHighlightBackground'],
      'editor.debugger_active_line.background': c['editor.stackFrameHighlightBackground'],
      'editor.line_number': c['editorLineNumber.foreground'],
      'editor.active_line_number': c['editorLineNumber.activeForeground'],
      'editor.hover_line_number': c['editorLineNumber.activeForeground'],
      'editor.invisible': c['editorWhitespace.foreground'],
      'editor.wrap_guide': c['editorRuler.foreground'],
      'editor.active_wrap_guide': c['editorRuler.foreground'],
      'editor.indent_guide': c['editorIndentGuide.background1'],
      'editor.indent_guide_active': c['editorIndentGuide.activeBackground1'],
      'editor.document_highlight.read_background': c['editor.wordHighlightBackground'],
      'editor.document_highlight.write_background': c['editor.wordHighlightStrongBackground'],
      'editor.document_highlight.bracket_background': c['editorBracketMatch.background'],
      'editor.diff_hunk.added.background': c['diffEditor.insertedLineBackground'],
      'editor.diff_hunk.deleted.background': c['diffEditor.removedLineBackground'],
      'terminal.background': terminal,
      'terminal.ansi.background': terminal,
      'terminal.foreground': c['terminal.foreground'],
      'terminal.bright_foreground': c['terminal.foreground'],
      'terminal.dim_foreground': alpha(c['terminal.foreground'], '80'),
      ...ansi,
      'link_text.hover': c['textLink.activeForeground'],
      'version_control.added': c['editorGutter.addedBackground'],
      'version_control.deleted': c['editorGutter.deletedBackground'],
      'version_control.modified': c['editorGutter.modifiedBackground'],
      'version_control.renamed': c['gitDecoration.renamedResourceForeground'],
      'version_control.conflict': c['gitDecoration.conflictingResourceForeground'],
      'version_control.ignored': c['gitDecoration.ignoredResourceForeground'],
      'version_control.word_added': c['diffEditor.insertedTextBackground'],
      'version_control.word_deleted': c['diffEditor.removedTextBackground'],
      'version_control.conflict_marker.ours': c['merge.currentContentBackground'],
      'version_control.conflict_marker.theirs': c['merge.incomingContentBackground'],
      'vim.yank.background': c['editor.rangeHighlightBackground'],

      ...statusColor('conflict', c['gitDecoration.conflictingResourceForeground']),
      ...statusColor('created', c['gitDecoration.addedResourceForeground']),
      ...statusColor('deleted', c['gitDecoration.deletedResourceForeground']),
      ...statusColor('error', c['editorError.foreground'], c['inputValidation.errorBackground'], c['inputValidation.errorBorder']),
      ...statusColor('hidden', c['descriptionForeground']),
      ...statusColor('hint', c['editorInlayHint.foreground']),
      ...statusColor('ignored', c['gitDecoration.ignoredResourceForeground']),
      ...statusColor('info', c['editorInfo.foreground'], c['inputValidation.infoBackground'], c['inputValidation.infoBorder']),
      ...statusColor('modified', c['gitDecoration.modifiedResourceForeground']),
      ...statusColor('predictive', c['editorGhostText.foreground']),
      ...statusColor('renamed', c['gitDecoration.renamedResourceForeground']),
      ...statusColor('success', c['gitDecoration.addedResourceForeground']),
      ...statusColor('unreachable', c['descriptionForeground']),
      ...statusColor('warning', c['editorWarning.foreground'], c['inputValidation.warningBackground'], c['inputValidation.warningBorder']),

      players: [{
        cursor: c['editorCursor.foreground'],
        background: c['activityBarBadge.background'],
        selection: c['editor.selectionBackground'],
      }, ...collaborators],
      syntax: createSyntax(p),
    },
  };
}

export function createThemeFamily(palettes) {
  return {
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: 'Still',
    author: 'Samuel Cristobal',
    themes: palettes.map(createTheme),
  };
}
